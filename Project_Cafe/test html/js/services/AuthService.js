(function() {
    'use strict';

    angular.module('coffeeShopApp')
        .service('AuthService', AuthService);

    AuthService.$inject = ['$http', '$q'];

    function AuthService($http, $q) {
        var API_BASE_URL = 'http://localhost:5000';
        var cachedUser = null;
        
        var service = {
            login: login,
            logout: logout,
            isAuthenticated: isAuthenticated,
            getCurrentUser: getCurrentUser,
            setCurrentUser: setCurrentUser,
            clearAuth: clearAuth,
            getToken: getToken,
            setToken: setToken,
            hasRole: hasRole,
            isManager: isManager,
            canEdit: canEdit
        };

        return service;

        // ==================== FUNCTIONS ====================

        /**
         * Login user through API Gateway
         * @param {string} username 
         * @param {string} password 
         * @returns {Promise}
         */
        function login(username, password) {
            var deferred = $q.defer();

            // API expects Vietnamese field names
            var loginData = {
                tenDangNhap: username,
                matKhau: password
            };

            console.log('Attempting login to:', API_BASE_URL + '/admin/api/Authentication/login');
            console.log('Login data:', loginData);

            $http.post(API_BASE_URL + '/admin/api/Authentication/login', loginData)
                .then(function(response) {
                    console.log('✅ Login response:', response);
                    console.log('📋 Response data fields:', Object.keys(response.data));
                    
                    // Check if login successful
                    if (response.data && response.data.success && response.data.token) {
                        // Log all possible name fields
                        console.log('🔍 Name field candidates:');
                        console.log('   - tenHienThi:', response.data.tenHienThi);
                        console.log('   - TenHienThi:', response.data.TenHienThi);
                        console.log('   - tenNhanVien:', response.data.tenNhanVien);
                        console.log('   - TenNhanVien:', response.data.TenNhanVien);
                        console.log('   - name:', response.data.name);
                        console.log('   - tenDangNhap:', response.data.tenDangNhap);
                        console.log('   - username:', response.data.username);
                        
                        // Extract user info with proper fallbacks (prioritize tenHienThi)
                        var userName = response.data.tenHienThi || response.data.TenHienThi || 
                                      response.data.tenNhanVien || response.data.TenNhanVien || 
                                      response.data.name || response.data.Name || 
                                      response.data.tenDangNhap || response.data.TenDangNhap ||
                                      response.data.username || 'User';
                        
                        // Map API response to our user object
                        var user = {
                            id: response.data.idNhanVien || response.data.IDNhanVien || response.data.id,
                            username: response.data.tenDangNhap || response.data.TenDangNhap || response.data.username,
                            name: userName,
                            role: getRoleName(response.data.loaiTaikhoan || response.data.loaiTaiKhoan || response.data.LoaiTaiKhoan)
                        };
                        
                        console.log('✅ User mapped:', user);
                        console.log('   - ID:', user.id);
                        console.log('   - Username:', user.username);
                        console.log('   - Display Name:', user.name);
                        console.log('   - Role:', user.role);
                        console.log('✅ Token received:', response.data.token.substring(0, 20) + '...');
                        
                        // Store token and user info
                        setToken(response.data.token);
                        setCurrentUser(user);
                        
                        deferred.resolve({ 
                            user: user, 
                            token: response.data.token,
                            message: response.data.message || 'Đăng nhập thành công'
                        });
                    } else {
                        // Login failed - backend returned success: false
                        console.warn('⚠️ Login failed from backend:', response.data);
                        var errorMsg = response.data && response.data.message 
                            ? response.data.message 
                            : 'Đăng nhập thất bại';
                        deferred.reject(errorMsg);
                    }
                })
                .catch(function(error) {
                    // Error handling
                    console.error('❌ API login failed:', error);
                    console.log('Error details:', {
                        status: error.status,
                        statusText: error.statusText,
                        data: error.data
                    });
                    
                    var errorMsg = 'Đăng nhập thất bại. Vui lòng thử lại.';
                    
                    // Handle different error types
                    if (error.data) {
                        if (typeof error.data === 'string') {
                            errorMsg = error.data;
                        } else if (error.data.message) {
                            errorMsg = error.data.message;
                        }
                    } else if (error.status === -1) {
                        errorMsg = '🔌 Không thể kết nối đến server. Vui lòng kiểm tra:\n' +
                                  '1. Backend đang chạy (port 5092)\n' +
                                  '2. Gateway đang chạy (port 5000)\n' +
                                  '3. Kiểm tra CORS configuration';
                    } else if (error.status === 401) {
                        errorMsg = '🔒 Tên đăng nhập hoặc mật khẩu không đúng';
                    } else if (error.status === 500) {
                        errorMsg = '⚠️ Lỗi server. Vui lòng liên hệ quản trị viên.';
                    } else if (error.status === 0) {
                        errorMsg = '🔌 Network error. Không thể kết nối đến server.';
                    }
                    
                    deferred.reject(errorMsg);
                });

            return deferred.promise;
        }

        /**
         * Logout user
         * @returns {Promise}
         */
        function logout() {
            var deferred = $q.defer();

            // Call API logout (optional)
            // $http.post(API_CONFIG.BASE_URL + '/admin/api/Authentication/logout')
            
            // Clear local storage
            clearAuth();
            deferred.resolve();

            return deferred.promise;
        }

        /**
         * Check if user is authenticated
         * @returns {boolean}
         */
        function isAuthenticated() {
            var token = getToken();
            var user = getCurrentUser();
            return !!(token && user);
        }

        /**
         * Get current user from localStorage
         * @returns {Object|null}
         */
        function getCurrentUser() {
            if (cachedUser) {
                return cachedUser;
            }
            var userJson = localStorage.getItem('currentUser');
            cachedUser = userJson ? JSON.parse(userJson) : null;
            return cachedUser;
        }

        /**
         * Set current user to localStorage
         * @param {Object} user 
         */
        function setCurrentUser(user) {
            cachedUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
        }

        /**
         * Get auth token from localStorage
         * @returns {string|null}
         */
        function getToken() {
            return localStorage.getItem('authToken');
        }

        /**
         * Set auth token to localStorage
         * @param {string} token 
         */
        function setToken(token) {
            localStorage.setItem('authToken', token);
        }

        /**
         * Clear all authentication data
         */
        function clearAuth() {
            cachedUser = null;
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
        }

        /**
         * Convert loaiTaikhoan (number) to role name
         * @param {number} loaiTaikhoan 
         * @returns {string}
         */
        function getRoleName(loaiTaikhoan) {
            var roles = {
                1: 'Quản lý',
                2: 'Thu ngân',
                3: 'Pha chế',
                4: 'Phục vụ'
            };
            return roles[loaiTaikhoan] || 'Nhân viên';
        }

        /**
         * Check if current user has specific role
         * @param {string} roleName - Role name to check (e.g., 'Quản lý')
         * @returns {boolean}
         */
        function hasRole(roleName) {
            var user = getCurrentUser();
            if (!user || !user.role) {
                return false;
            }
            return user.role === roleName;
        }

        /**
         * Check if current user is manager
         * @returns {boolean}
         */
        function isManager() {
            return hasRole('Quản lý');
        }

        /**
         * Check if current user can edit/add/delete (Manager only)
         * @returns {boolean}
         */
        function canEdit() {
            return isManager();
        }
    }

})();
