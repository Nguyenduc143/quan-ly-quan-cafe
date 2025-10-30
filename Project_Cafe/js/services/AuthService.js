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
            setToken: setToken
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
                    console.log('Login response:', response);
                    
                    // Check if login successful
                    if (response.data && response.data.success && response.data.token) {
                        // Map API response to our user object
                        var user = {
                            id: response.data.idNhanVien,
                            username: response.data.tenDangNhap,
                            name: response.data.tenNhanVien,
                            role: getRoleName(response.data.loaiTaikhoan)
                        };
                        
                        // Store token and user info
                        setToken(response.data.token);
                        setCurrentUser(user);
                        deferred.resolve({ user: user, token: response.data.token });
                    } else {
                        // Login failed
                        var errorMsg = response.data && response.data.message 
                            ? response.data.message 
                            : 'Đăng nhập thất bại';
                        deferred.reject(errorMsg);
                    }
                })
                .catch(function(error) {
                    // Error handling
                    console.error('API login failed:', error);
                    console.log('Error details:', {
                        status: error.status,
                        statusText: error.statusText,
                        data: error.data
                    });
                    
                    var errorMsg = 'Đăng nhập thất bại. Vui lòng thử lại.';
                    
                    if (error.data && error.data.message) {
                        errorMsg = error.data.message;
                    } else if (error.status === -1) {
                        errorMsg = 'Không thể kết nối đến server. Vui lòng kiểm tra API.';
                    } else if (error.status === 401) {
                        errorMsg = 'Tên đăng nhập hoặc mật khẩu không đúng';
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
    }

})();
