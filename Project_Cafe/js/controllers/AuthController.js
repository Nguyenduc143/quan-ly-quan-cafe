(function() {
    'use strict';

    angular.module('coffeeShopApp')
        .controller('AuthController', AuthController);

    AuthController.$inject = ['$scope', '$location', 'AuthService', 'NotificationService'];

    function AuthController($scope, $location, AuthService, NotificationService) {
        var vm = this;

        // Properties
        vm.username = '';
        vm.password = '';
        vm.isLoading = false;
        vm.rememberMe = false;

        // Methods
        vm.login = login;
        vm.clearForm = clearForm;

        // Initialize
        activate();

        // ==================== FUNCTIONS ====================

        function activate() {
            // Check if already logged in
            if (AuthService.isAuthenticated()) {
                $location.path('/dashboard');
            }

            // Load saved username if remember me was checked
            var savedUsername = localStorage.getItem('rememberedUsername');
            if (savedUsername) {
                vm.username = savedUsername;
                vm.rememberMe = true;
            }
        }

        /**
         * Handle login form submission
         */
        function login() {
            // Validate inputs
            if (!vm.username || !vm.password) {
                NotificationService.error('Vui lòng nhập tên đăng nhập và mật khẩu');
                return;
            }

            // Trim whitespace
            vm.username = vm.username.trim();

            // Show loading state
            vm.isLoading = true;

            console.log('🔐 Attempting login with username:', vm.username);

            // Call AuthService
            AuthService.login(vm.username, vm.password)
                .then(function(response) {
                    // Success
                    console.log('✅ Login successful:', response.user);
                    
                    var message = response.message || 'Đăng nhập thành công!';
                    NotificationService.success(message);

                    // Remember username if checked
                    if (vm.rememberMe) {
                        localStorage.setItem('rememberedUsername', vm.username);
                    } else {
                        localStorage.removeItem('rememberedUsername');
                    }

                    // Clear password from memory
                    vm.password = '';

                    // Redirect to dashboard
                    console.log('➡️ Redirecting to dashboard...');
                    $location.path('/dashboard');
                })
                .catch(function(error) {
                    // Error
                    console.error('❌ Login failed:', error);
                    
                    var errorMessage = error || 'Đăng nhập thất bại. Vui lòng thử lại.';
                    NotificationService.error(errorMessage, 5000);
                    
                    // Clear password on error for security
                    vm.password = '';
                })
                .finally(function() {
                    vm.isLoading = false;
                });
        }

        /**
         * Clear login form
         */
        function clearForm() {
            vm.username = '';
            vm.password = '';
        }
    }

})();
