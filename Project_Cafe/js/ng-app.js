(function() {
    'use strict';

    // Initialize AngularJS App
    angular.module('coffeeShopApp', ['ngRoute', 'ngSanitize'])
        .config(configRoutes)
        .run(runBlock);

    configRoutes.$inject = ['$routeProvider', '$locationProvider'];
    runBlock.$inject = ['$rootScope', '$location', 'AuthService'];

    /**
     * Configure Routes
     */
    function configRoutes($routeProvider, $locationProvider) {
        $routeProvider
            // Login
            .when('/login', {
                templateUrl: 'views/login.html',
                controller: 'AuthController',
                controllerAs: 'vm'
            })
            // Dashboard
            .when('/dashboard', {
                templateUrl: 'views/dashboard.html',
                controller: 'DashboardController',
                controllerAs: 'vm',
                requireAuth: true
            })
            // Menu
            .when('/menu', {
                templateUrl: 'views/menu.html',
                controller: 'MenuController',
                controllerAs: 'vm',
                requireAuth: true
            })
            // Orders
            .when('/orders', {
                templateUrl: 'views/orders.html',
                controller: 'OrdersController',
                controllerAs: 'vm',
                requireAuth: true
            })
            // Tables
            .when('/tables', {
                templateUrl: 'pages/tables.html',
                controller: 'TableController',
                controllerAs: 'vm',
                requireAuth: true
            })
            // Inventory
            .when('/inventory', {
                templateUrl: 'pages/inventory.html',
                controller: 'InventoryController',
                controllerAs: 'vm',
                requireAuth: true
            })
            // Employees
            .when('/employees', {
                templateUrl: 'pages/employees.html',
                controller: 'EmployeeController',
                controllerAs: 'vm',
                requireAuth: true
            })
            // Reports
            .when('/reports', {
                templateUrl: 'pages/reports.html',
                controller: 'ReportController',
                controllerAs: 'vm',
                requireAuth: true
            })
            // Default redirect
            .otherwise({
                redirectTo: '/login'
            });

        // Optional: Enable HTML5 mode (remove # from URL)
        // $locationProvider.html5Mode(true);
    }

    /**
     * Run block - executed after Angular bootstrap
     */
    function runBlock($rootScope, $location, AuthService) {
        // Loading indicator
        $rootScope.isLoading = false;

        // Listen to route change events
        $rootScope.$on('$routeChangeStart', function(event, next, current) {
            // Show loading
            $rootScope.isLoading = true;

            // Check if route requires authentication
            if (next.requireAuth && !AuthService.isAuthenticated()) {
                event.preventDefault();
                $rootScope.isLoading = false;
                $location.path('/login');
            }

            // If user is authenticated and trying to access login page
            if (next.originalPath === '/login' && AuthService.isAuthenticated()) {
                event.preventDefault();
                $rootScope.isLoading = false;
                $location.path('/dashboard');
            }
        });

        // Route change success - hide loading
        $rootScope.$on('$routeChangeSuccess', function() {
            $rootScope.isLoading = false;
        });

        // Route change error - hide loading
        $rootScope.$on('$routeChangeError', function() {
            $rootScope.isLoading = false;
        });

        // Initialize theme
        initializeTheme();

        // Set current user in rootScope for easy access
        $rootScope.currentUser = AuthService.getCurrentUser();

        // Watch for auth changes
        $rootScope.$watch(
            function() { return AuthService.getCurrentUser(); },
            function(newUser) {
                $rootScope.currentUser = newUser;
            }
        );
    }

    /**
     * Initialize theme from localStorage
     */
    function initializeTheme() {
        var savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }
    }

})();
