(function() {
    'use strict';

    angular.module('coffeeShopApp')
        .controller('EmployeeController', EmployeeController);

    EmployeeController.$inject = ['$scope', '$timeout', '$interval', '$q', 'AuthService', 'NotificationService', 'ApiService'];

    function EmployeeController($scope, $timeout, $interval, $q, AuthService, NotificationService, ApiService) {
        var vm = this;

        // Properties
        vm.currentUser = AuthService.getCurrentUser();
        vm.employees = [];
        vm.accounts = [];
        vm.isLoading = false;
        vm.showEmployeeModal = false;
        vm.currentEmployee = null;
        vm.searchQuery = '';
        vm.searchAccountQuery = '';
        vm.filterRole = 'all';
        vm.currentDateTime = '';
        vm.activeTab = 'employees';
        vm.isManager = AuthService.isManager();

        // Methods
        vm.logout = logout;
        vm.toggleSidebar = toggleSidebar;
        vm.toggleTheme = toggleTheme;
        vm.openEmployeeModal = openEmployeeModal;
        vm.closeEmployeeModal = closeEmployeeModal;
        vm.saveEmployee = saveEmployee;
        vm.editEmployee = editEmployee;
        vm.deleteEmployee = deleteEmployee;
        vm.toggleEmployeeStatus = toggleEmployeeStatus;
        vm.filterEmployees = filterEmployees;
        vm.filterAccounts = filterAccounts;
        vm.openAccountModal = openAccountModal;
        vm.editAccount = editAccount;
        vm.saveAccount = saveAccount;
        vm.loadAccountsInfo = loadAccountsInfo;
        vm.onEmployeeSelect = onEmployeeSelect;

        // Initialize
        activate();

        function activate() {
            updateDateTime();
            loadEmployees();
            loadTheme();
            
            // Update time every minute
            $interval(updateDateTime, 60000);
            
            // Watch for tab changes to load account info
            $scope.$watch(function() { return vm.activeTab; }, function(newVal, oldVal) {
                if (newVal === 'accounts' && newVal !== oldVal) {
                    loadAccountsInfo();
                }
            });
        }

        function updateDateTime() {
            var now = new Date();
            var options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            vm.currentDateTime = now.toLocaleDateString('vi-VN', options);
        }

        function loadTheme() {
            var savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-mode');
            }
        }

        function toggleSidebar() {
            document.querySelector('.sidebar')?.classList.toggle('collapsed');
        }

        function toggleTheme() {
            var currentTheme = localStorage.getItem('theme') || 'light';
            var newTheme = currentTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            document.body.classList.toggle('dark-mode');
            NotificationService.info('Đã chuyển sang chế độ ' + (newTheme === 'dark' ? 'tối' : 'sáng'));
        }

        function logout() {
            if (confirm('Bạn có chắc muốn đăng xuất?')) {
                // Show notification immediately
                NotificationService.success('Đang đăng xuất...', 1500);
                
                // Small delay to ensure notification is rendered
                $timeout(function() {
                    AuthService.logout()
                        .then(function() {
                            // Wait for notification to be visible
                            $timeout(function() {
                                window.location.href = '#!/login';
                            }, 1500);
                        })
                        .catch(function(error) {
                            console.error('Logout error:', error);
                            // Even if logout fails, redirect to login
                            $timeout(function() {
                                window.location.href = '#!/login';
                            }, 1000);
                        });
                }, 100);
            }
        }

        function loadEmployees() {
            vm.isLoading = true;
            
            ApiService.get('/admin/api/Employees')
                .then(function(response) {
                    console.log('Employees API response:', response);
                    var employees = [];
                    
                    // Handle different response formats
                    if (Array.isArray(response)) {
                        employees = response;
                    } else if (response.data && Array.isArray(response.data)) {
                        employees = response.data;
                    } else if (response.success && response.data && Array.isArray(response.data)) {
                        employees = response.data;
                    }
                    
                    // Map backend structure to frontend
                    vm.employees = employees.map(function(emp) {
                        return {
                            id: emp.id || emp.Id,
                            username: emp.username || emp.Username || emp.tenDangNhap || emp.TenDangNhap || '',
                            name: emp.name || emp.Name || emp.hoTen || emp.HoTen || '',
                            gender: emp.gender || emp.Gender || emp.gioiTinh || emp.GioiTinh || '',
                            birthDate: emp.birthDate || emp.BirthDate || emp.ngaySinh || emp.NgaySinh || null,
                            role: emp.role || emp.Role || emp.chucVu || emp.ChucVu || 'Nhân viên',
                            salary: emp.salary || emp.Salary || emp.luong || emp.Luong || 0,
                            phone: emp.sdt || emp.Sdt || emp.SDT || emp.phone || emp.Phone || emp.soDienThoai || emp.SoDienThoai || '',
                            address: emp.address || emp.Address || emp.diaChi || emp.DiaChi || '',
                            status: emp.status || emp.Status || emp.trangThai || emp.TrangThai || 'active',
                            joinDate: emp.joinDate || emp.JoinDate || emp.ngayVaoLam || emp.NgayVaoLam || new Date()
                        };
                    });
                    
                    console.log('Mapped employees:', vm.employees);
                })
                .catch(function(error) {
                    console.error('Failed to load employees:', error);
                    NotificationService.error('Không thể tải danh sách nhân viên');
                    vm.employees = [];
                })
                .finally(function() {
                    vm.isLoading = false;
                });
        }

        function openEmployeeModal(employee) {
            // Kiểm tra quyền - chỉ Admin mới được mở modal
            if (vm.currentUser.role !== 'Quản lý') {
                NotificationService.error('⛔ Chỉ quản lý mới có quyền thêm/sửa nhân viên');
                return;
            }
            
            if (employee) {
                vm.currentEmployee = angular.copy(employee);
                console.log('Opening modal for employee:', vm.currentEmployee);
                
                // Convert date strings to Date object for input[type=date]
                if (vm.currentEmployee.joinDate) {
                    vm.currentEmployee.joinDate = new Date(vm.currentEmployee.joinDate);
                }
                if (vm.currentEmployee.birthDate) {
                    vm.currentEmployee.birthDate = new Date(vm.currentEmployee.birthDate);
                }
            } else {
                vm.currentEmployee = {
                    id: null,
                    name: '',
                    gender: '',
                    birthDate: null,
                    role: '',
                    salary: null,
                    phone: '',
                    address: '',
                    status: 'active',
                    joinDate: new Date()
                };
            }
            vm.showEmployeeModal = true;
        }

        function closeEmployeeModal() {
            vm.showEmployeeModal = false;
            vm.currentEmployee = null;
        }

        function saveEmployee() {
            // Kiểm tra quyền - chỉ Admin mới được lưu
            if (vm.currentUser.role !== 'Quản lý') {
                NotificationService.error('⛔ Chỉ quản lý mới có quyền thêm/sửa nhân viên');
                closeEmployeeModal();
                return;
            }
            
            // Validation for employee form (not account form)
            if (!vm.currentEmployee.name) {
                NotificationService.error('Vui lòng nhập họ và tên');
                return;
            }

            if (!vm.currentEmployee.gender) {
                NotificationService.error('Vui lòng chọn giới tính');
                return;
            }

            if (!vm.currentEmployee.birthDate) {
                NotificationService.error('Vui lòng nhập ngày sinh');
                return;
            }

            if (!vm.currentEmployee.role) {
                NotificationService.error('Vui lòng chọn chức vụ');
                return;
            }

            if (!vm.currentEmployee.salary || vm.currentEmployee.salary <= 0) {
                NotificationService.error('Vui lòng nhập lương hợp lệ');
                return;
            }

            // Validate phone number
            if (vm.currentEmployee.phone && !/^0\d{9}$/.test(vm.currentEmployee.phone)) {
                NotificationService.error('Số điện thoại không hợp lệ');
                return;
            }

            vm.isLoading = true;

            // Prepare employee data for backend (match API format)
            var employeeData = {
                HoTen: vm.currentEmployee.name,
                NgaySinh: vm.currentEmployee.birthDate,
                GioiTinh: vm.currentEmployee.gender,
                Sdt: vm.currentEmployee.phone,
                DiaChi: vm.currentEmployee.address,
                Luong: vm.currentEmployee.salary,
                ChucVu: vm.currentEmployee.role
            };

            console.log('Saving employee data:', employeeData);

            var promise;
            if (vm.currentEmployee.id) {
                // Update existing employee
                employeeData.Id = vm.currentEmployee.id;
                console.log('Updating employee ID:', vm.currentEmployee.id);
                promise = ApiService.put('/admin/api/Employees/' + vm.currentEmployee.id, employeeData);
            } else {
                // Create new employee
                console.log('Creating new employee');
                promise = ApiService.post('/admin/api/Employees', employeeData);
            }

            promise.then(function(response) {
                console.log('Save employee response:', response);
                var message = vm.currentEmployee.id ? 'Cập nhật nhân viên thành công' : 'Thêm nhân viên thành công';
                NotificationService.success(message);
                closeEmployeeModal();
                loadEmployees(); // Reload list
            })
            .catch(function(error) {
                console.error('Error saving employee:', error);
                console.error('Error details:', error.data);
                var message = error.data && error.data.message ? error.data.message : 'Không thể lưu thông tin nhân viên';
                NotificationService.error(message);
            })
            .finally(function() {
                vm.isLoading = false;
            });
        }

        function editEmployee(employee) {
            // Kiểm tra quyền trước khi mở modal
            if (vm.currentUser.role !== 'Quản lý') {
                NotificationService.error('⛔ Chỉ quản lý mới có quyền sửa nhân viên');
                return;
            }
            openEmployeeModal(employee);
        }

        function deleteEmployee(employeeId) {
            // Kiểm tra quyền
            if (vm.currentUser.role !== 'Quản lý') {
                NotificationService.error('⛔ Chỉ quản lý mới có quyền xóa nhân viên');
                return;
            }
            
            if (confirm('Bạn có chắc muốn xóa nhân viên này?')) {
                vm.isLoading = true;
                
                ApiService.delete('/admin/api/Employees/' + employeeId)
                    .then(function(response) {
                        NotificationService.success('Xóa nhân viên thành công');
                        loadEmployees(); // Reload list
                    })
                    .catch(function(error) {
                        console.error('Error deleting employee:', error);
                        var message = error.data && error.data.message ? error.data.message : 'Không thể xóa nhân viên';
                        NotificationService.error(message);
                    })
                    .finally(function() {
                        vm.isLoading = false;
                    });
            }
        }

        function toggleEmployeeStatus(employee) {
            var newStatus = employee.status === 'active' ? 'inactive' : 'active';
            var statusText = newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa';
            
            vm.isLoading = true;
            
            // Prepare update data
            var updateData = {
                id: employee.id,
                username: employee.username,
                name: employee.name,
                role: employee.role,
                phone: employee.phone,
                address: employee.address,
                status: newStatus,
                joinDate: employee.joinDate
            };
            
            ApiService.put('/admin/api/Employees/' + employee.id, updateData)
                .then(function(response) {
                    employee.status = newStatus; // Update local status
                    NotificationService.success('Đã ' + statusText + ' tài khoản ' + employee.name);
                })
                .catch(function(error) {
                    console.error('Error toggling employee status:', error);
                    NotificationService.error('Không thể cập nhật trạng thái nhân viên');
                })
                .finally(function() {
                    vm.isLoading = false;
                });
        }

        function filterEmployees() {
            return vm.employees.filter(function(employee) {
                var matchesSearch = !vm.searchQuery || 
                    employee.name.toLowerCase().includes(vm.searchQuery.toLowerCase()) ||
                    employee.username.toLowerCase().includes(vm.searchQuery.toLowerCase()) ||
                    employee.phone.includes(vm.searchQuery);
                
                var matchesRole = vm.filterRole === 'all' || employee.role === vm.filterRole;
                
                return matchesSearch && matchesRole;
            });
        }

        function filterAccounts() {
            return vm.accounts.filter(function(account) {
                var matchesSearch = !vm.searchAccountQuery || 
                    account.name.toLowerCase().includes(vm.searchAccountQuery.toLowerCase()) ||
                    account.username.toLowerCase().includes(vm.searchAccountQuery.toLowerCase());
                
                return matchesSearch;
            });
        }

        function loadAccountsInfo() {
            if (vm.employees.length === 0) {
                console.log('No employees to load accounts for');
                return;
            }

            vm.isLoading = true;
            vm.accounts = [];
            
            console.log('Loading accounts for', vm.employees.length, 'employees');
            
            // Load account info for each employee
            var promises = vm.employees.map(function(employee) {
                var apiUrl = '/admin/api/Employees/' + employee.id + '/account';
                console.log('Fetching account from:', apiUrl);
                
                return ApiService.get(apiUrl)
                    .then(function(response) {
                        console.log('Account API response for employee', employee.id, ':', response);
                        
                        var accountData = response.data || response;
                        console.log('Account data:', accountData);
                        
                        // Map account data with detailed logging
                        var mappedAccount = {
                            id: employee.id,
                            username: accountData.tenDangNhap || accountData.TenDangNhap || accountData.username || accountData.Username || 'N/A',
                            password: accountData.matKhau || accountData.MatKhau || accountData.password || accountData.Password || '********',
                            name: employee.name,
                            role: employee.role,
                            status: accountData.trangThai || accountData.TrangThai || accountData.status || accountData.Status || 'active'
                        };
                        
                        console.log('Mapped account:', mappedAccount);
                        return mappedAccount;
                    })
                    .catch(function(error) {
                        console.error('Failed to load account for employee ' + employee.id, error);
                        
                        // Suppress 404 errors in console (expected for employees without accounts)
                        if (error.status !== 404) {
                            console.warn('Unexpected error loading account for employee ' + employee.id + ':', error.status);
                        }
                        
                        // Return employee data as fallback with appropriate status
                        return {
                            id: employee.id,
                            username: employee.username || 'chưa-có',
                            password: '********',
                            name: employee.name,
                            role: employee.role,
                            status: error.status === 404 ? 'no-account' : employee.status || 'unknown',
                            hasAccount: false
                        };
                    });
            });

            $q.all(promises)
                .then(function(accounts) {
                    vm.accounts = accounts;
                    
                    // Load mock accounts from localStorage and merge
                    var localAccounts = JSON.parse(localStorage.getItem('mockAccounts') || '[]');
                    if (localAccounts.length > 0) {
                        console.log('Loading mock accounts from localStorage:', localAccounts);
                        
                        // Merge mock accounts (avoid duplicates by id)
                        localAccounts.forEach(function(mockAccount) {
                            var exists = vm.accounts.find(function(acc) {
                                return acc.id === mockAccount.id;
                            });
                            
                            if (!exists) {
                                vm.accounts.push(mockAccount);
                            }
                        });
                    }
                    
                    console.log('Final accounts array (with mocks):', vm.accounts);
                })
                .catch(function(error) {
                    console.error('Error loading accounts:', error);
                    
                    // Even if API fails, load mock accounts
                    var localAccounts = JSON.parse(localStorage.getItem('mockAccounts') || '[]');
                    if (localAccounts.length > 0) {
                        vm.accounts = localAccounts;
                        console.log('Using only mock accounts:', vm.accounts);
                    }
                    
                    NotificationService.error('Không thể tải danh sách tài khoản từ server');
                })
                .finally(function() {
                    vm.isLoading = false;
                });
        }

        function openAccountModal(account) {
            // Kiểm tra quyền - chỉ Admin mới được mở modal
            if (vm.currentUser.role !== 'Quản lý') {
                NotificationService.error('⛔ Chỉ quản lý mới có quyền thêm/sửa tài khoản');
                return;
            }
            
            if (account) {
                vm.currentEmployee = angular.copy(account);
            } else {
                vm.currentEmployee = {
                    id: null,
                    username: '',
                    newPassword: '',
                    oldPassword: '',
                    name: '',
                    role: 'Phục vụ',
                    status: 'active'
                };
            }
            vm.showEmployeeModal = true;
        }

        function editAccount(account) {
            // Kiểm tra quyền - chỉ Admin mới được sửa
            if (vm.currentUser.role !== 'Quản lý') {
                NotificationService.error('⛔ Chỉ quản lý mới có quyền sửa tài khoản');
                return;
            }
            
            vm.currentEmployee = angular.copy(account);
            vm.currentEmployee.oldPassword = '';
            vm.currentEmployee.newPassword = '';
            vm.showEmployeeModal = true;
        }

        function saveAccount() {
            console.log('=== SAVE ACCOUNT CALLED ===');
            console.log('Current employee data:', vm.currentEmployee);
            
            // Kiểm tra quyền - chỉ Admin mới được lưu
            if (vm.currentUser.role !== 'Quản lý') {
                NotificationService.error('⛔ Chỉ quản lý mới có quyền thêm/sửa tài khoản');
                closeEmployeeModal();
                return;
            }
            
            // Validation
            if (!vm.currentEmployee.username) {
                NotificationService.error('Vui lòng nhập tên đăng nhập');
                return;
            }

            if (!vm.currentEmployee.newPassword || vm.currentEmployee.newPassword.length < 6) {
                NotificationService.error('Mật khẩu mới phải có ít nhất 6 ký tự');
                return;
            }

            // Nếu đang cập nhật, kiểm tra mật khẩu cũ
            if (vm.currentEmployee.id) {
                if (!vm.currentEmployee.oldPassword) {
                    NotificationService.error('Vui lòng nhập mật khẩu cũ');
                    return;
                }

                // Kiểm tra mật khẩu cũ có đúng không
                if (vm.currentEmployee.oldPassword !== vm.currentEmployee.password) {
                    NotificationService.error('Mật khẩu cũ không chính xác');
                    return;
                }
            } else {
                // Nếu tạo mới, kiểm tra đã chọn nhân viên
                if (!vm.currentEmployee.selectedEmployeeId) {
                    NotificationService.error('Vui lòng chọn nhân viên');
                    return;
                }
            }

            vm.isLoading = true;

            var promise;
            if (vm.currentEmployee.id) {
                // Update existing account - change password
                var changePasswordData = {
                    tenDangNhap: vm.currentEmployee.username,
                    matKhauCu: vm.currentEmployee.oldPassword,
                    matKhauMoi: vm.currentEmployee.newPassword
                };
                
                console.log('Changing password with data:', changePasswordData);
                promise = ApiService.post('/admin/api/Authentication/change-password', changePasswordData);
            } else {
                // Create new account - Try register API first, fallback to mock if session required
                var registerData = {
                    tenDangNhap: vm.currentEmployee.username,
                    tenHienThi: vm.currentEmployee.selectedEmployeeName || vm.currentEmployee.username,
                    matKhau: vm.currentEmployee.newPassword,
                    loaiTaiKhoan: 0, // 0 = nhân viên, 1 = admin
                    idNhanVien: parseInt(vm.currentEmployee.selectedEmployeeId)
                };
                
                console.log('Registering account with data:', registerData);
                
                // Try calling the register API
                promise = ApiService.post('/admin/api/Authentication/register', registerData)
                    .catch(function(error) {
                        console.error('Register API failed:', error);
                        
                        // If API fails (500, 403, 401, or authentication errors), create mock account
                        if (error.status === 500 || error.status === 403 || error.status === 401 || 
                            (error.data && typeof error.data === 'string' && error.data.includes('authentication'))) {
                            console.log('Backend authentication error - creating mock account locally');
                            console.log('Error status:', error.status);
                            
                            // Find the selected employee
                            var selectedEmp = vm.employees.find(function(emp) {
                                return emp.id == vm.currentEmployee.selectedEmployeeId;
                            });
                            
                            if (selectedEmp) {
                                // Create mock account object
                                var mockAccount = {
                                    id: vm.currentEmployee.selectedEmployeeId,
                                    username: vm.currentEmployee.username,
                                    password: vm.currentEmployee.newPassword,
                                    name: selectedEmp.name,
                                    role: selectedEmp.role,
                                    status: 'active',
                                    isMockAccount: true // Flag để nhận biết
                                };
                                
                                // Check if account already exists
                                var existingIndex = vm.accounts.findIndex(function(acc) {
                                    return acc.id === mockAccount.id;
                                });
                                
                                if (existingIndex > -1) {
                                    // Update existing account
                                    vm.accounts[existingIndex] = mockAccount;
                                } else {
                                    // Add new account
                                    if (!vm.accounts) {
                                        vm.accounts = [];
                                    }
                                    vm.accounts.push(mockAccount);
                                }
                                
                                // Save to localStorage for persistence
                                var localAccounts = JSON.parse(localStorage.getItem('mockAccounts') || '[]');
                                var localIndex = localAccounts.findIndex(function(acc) {
                                    return acc.id === mockAccount.id;
                                });
                                
                                if (localIndex > -1) {
                                    localAccounts[localIndex] = mockAccount;
                                } else {
                                    localAccounts.push(mockAccount);
                                }
                                localStorage.setItem('mockAccounts', JSON.stringify(localAccounts));
                                
                                // Return success promise
                                return Promise.resolve({
                                    success: true,
                                    message: 'Tài khoản đã được tạo (chế độ offline - Backend đang có lỗi)',
                                    data: mockAccount
                                });
                            }
                        }
                        
                        // Re-throw error if not handled
                        throw error;
                    });
            }

            promise.then(function(response) {
                console.log('Save account response:', response);
                
                // Check if this is a mock account response
                if (response && response.message && response.message.includes('offline')) {
                    NotificationService.warning(response.message, 5000);
                } else {
                    var message = vm.currentEmployee.id ? 'Cập nhật mật khẩu thành công' : 'Thêm tài khoản thành công';
                    NotificationService.success(message);
                }
                
                closeEmployeeModal();
                loadEmployees();
                if (vm.activeTab === 'accounts') {
                    loadAccountsInfo();
                }
            })
            .catch(function(error) {
                console.error('Error saving account:', error);
                console.error('Error response:', error.data);
                
                var message = 'Không thể lưu thông tin tài khoản';
                
                // Provide more detailed error messages
                if (error.status === 500) {
                    message = '⚠️ Lỗi Backend (500): Backend chưa cấu hình Authentication đúng. Vui lòng kiểm tra Program.cs hoặc Startup.cs';
                } else if (error.status === 403) {
                    message = 'Không có quyền thực hiện thao tác này';
                } else if (error.status === 401) {
                    message = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại';
                } else if (error.data && typeof error.data === 'string' && error.data.includes('authentication')) {
                    message = '⚠️ Backend chưa cấu hình Authentication middleware. Cần thêm AddAuthentication() vào Program.cs';
                } else if (error.data && error.data.message) {
                    message = error.data.message;
                } else if (error.statusText) {
                    message = error.statusText;
                }
                
                NotificationService.error(message, 7000);
            })
            .finally(function() {
                vm.isLoading = false;
            });
        }

        function onEmployeeSelect() {
            if (vm.currentEmployee.selectedEmployeeId) {
                var selectedEmp = vm.employees.find(function(emp) {
                    return emp.id == vm.currentEmployee.selectedEmployeeId;
                });
                
                if (selectedEmp) {
                    vm.currentEmployee.selectedEmployeeName = selectedEmp.name;
                    console.log('Selected employee:', selectedEmp);
                }
            }
        }
    }
})();
