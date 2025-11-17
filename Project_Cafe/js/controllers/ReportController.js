(function() {
    'use strict';

    angular.module('coffeeShopApp')
        .controller('ReportController', ReportController);

    ReportController.$inject = ['$scope', 'AuthService', 'NotificationService'];

    function ReportController($scope, AuthService, NotificationService) {
        var vm = this;

        // Properties
        vm.currentUser = AuthService.getCurrentUser();
        vm.isLoading = false;
        vm.reportType = 'revenue';
        vm.dateRange = 'today';
        vm.startDate = new Date();
        vm.endDate = new Date();
        
        // Report data
        vm.revenueData = null;
        vm.productData = null;
        vm.employeeData = null;
        vm.inventoryData = null;

        // Methods
        vm.logout = logout;
        vm.switchReportType = switchReportType;
        vm.generateReport = generateReport;
        vm.exportToExcel = exportToExcel;
        vm.exportToPDF = exportToPDF;
        vm.printReport = printReport;

        // Initialize
        init();

        function init() {
            generateReport();
        }

        /**
         * Logout user
         */
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
                            }, 1500);
                        });
                }, 100);
            }
        }

        function switchReportType(type) {
            vm.reportType = type;
            generateReport();
        }

        function generateReport() {
            vm.isLoading = true;

            // Calculate date range
            var dates = calculateDateRange();
            vm.startDate = dates.start;
            vm.endDate = dates.end;

            // Generate report based on type
            switch (vm.reportType) {
                case 'revenue':
                    generateRevenueReport();
                    break;
                case 'products':
                    generateProductReport();
                    break;
                case 'employees':
                    generateEmployeeReport();
                    break;
                case 'inventory':
                    generateInventoryReport();
                    break;
            }

            vm.isLoading = false;
        }

        function calculateDateRange() {
            var start = new Date();
            var end = new Date();

            switch (vm.dateRange) {
                case 'today':
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);
                    break;
                case 'week':
                    start.setDate(start.getDate() - 7);
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);
                    break;
                case 'month':
                    start.setDate(1);
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);
                    break;
                case 'year':
                    start.setMonth(0, 1);
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);
                    break;
            }

            return { start: start, end: end };
        }

        function generateRevenueReport() {
            // Simulated data - replace with API call
            vm.revenueData = {
                totalRevenue: 25750000,
                totalOrders: 156,
                averageOrderValue: 165064,
                cashPayments: 15250000,
                cardPayments: 10500000,
                dailyRevenue: [
                    { date: '2024-01-15', revenue: 3250000, orders: 23 },
                    { date: '2024-01-16', revenue: 4100000, orders: 28 },
                    { date: '2024-01-17', revenue: 3850000, orders: 26 },
                    { date: '2024-01-18', revenue: 4550000, orders: 31 },
                    { date: '2024-01-19', revenue: 5200000, orders: 35 },
                    { date: '2024-01-20', revenue: 4800000, orders: 33 }
                ],
                topProducts: [
                    { name: 'Cà phê sữa đá', quantity: 45, revenue: 2250000 },
                    { name: 'Bạc xỉu', quantity: 38, revenue: 1900000 },
                    { name: 'Cappuccino', quantity: 32, revenue: 1920000 }
                ]
            };
        }

        function generateProductReport() {
            // Simulated data - replace with API call
            vm.productData = {
                totalProducts: 24,
                totalSold: 456,
                topSellingProducts: [
                    { 
                        id: 1,
                        name: 'Cà phê sữa đá', 
                        category: 'Cà phê',
                        quantitySold: 145, 
                        revenue: 7250000,
                        percentOfTotal: 28.1
                    },
                    { 
                        id: 2,
                        name: 'Bạc xỉu', 
                        category: 'Cà phê',
                        quantitySold: 120, 
                        revenue: 6000000,
                        percentOfTotal: 23.3
                    },
                    { 
                        id: 3,
                        name: 'Cappuccino', 
                        category: 'Cà phê',
                        quantitySold: 95, 
                        revenue: 5700000,
                        percentOfTotal: 22.1
                    },
                    { 
                        id: 4,
                        name: 'Trà sữa trân châu', 
                        category: 'Trà sữa',
                        quantitySold: 52, 
                        revenue: 3120000,
                        percentOfTotal: 12.1
                    },
                    { 
                        id: 5,
                        name: 'Sinh tố bơ', 
                        category: 'Sinh tố',
                        quantitySold: 44, 
                        revenue: 2640000,
                        percentOfTotal: 10.2
                    }
                ],
                categoryBreakdown: [
                    { category: 'Cà phê', quantity: 360, revenue: 18950000, percent: 73.6 },
                    { category: 'Trà sữa', quantity: 52, revenue: 3120000, percent: 12.1 },
                    { category: 'Sinh tố', quantity: 44, revenue: 2640000, percent: 10.2 }
                ]
            };
        }

        function generateEmployeeReport() {
            // Simulated data - replace with API call
            vm.employeeData = {
                totalEmployees: 8,
                activeEmployees: 6,
                totalOrders: 156,
                employeePerformance: [
                    {
                        id: 1,
                        name: 'Nguyễn Văn A',
                        role: 'Thu ngân',
                        ordersProcessed: 45,
                        revenue: 7650000,
                        averageOrderValue: 170000,
                        rating: 4.8
                    },
                    {
                        id: 2,
                        name: 'Trần Thị B',
                        role: 'Thu ngân',
                        ordersProcessed: 38,
                        revenue: 6270000,
                        averageOrderValue: 165000,
                        rating: 4.6
                    },
                    {
                        id: 3,
                        name: 'Lê Văn C',
                        role: 'Pha chế',
                        ordersProcessed: 73,
                        revenue: 0,
                        averageOrderValue: 0,
                        rating: 4.9
                    }
                ]
            };
        }

        function generateInventoryReport() {
            // Simulated data - replace with API call
            vm.inventoryData = {
                totalMaterials: 25,
                lowStockItems: 3,
                outOfStockItems: 0,
                totalValue: 45750000,
                materials: [
                    {
                        id: 1,
                        name: 'Cà phê Arabica',
                        quantity: 50,
                        unit: 'kg',
                        minQuantity: 10,
                        status: 'sufficient',
                        value: 12500000
                    },
                    {
                        id: 2,
                        name: 'Sữa tươi',
                        quantity: 5,
                        unit: 'lít',
                        minQuantity: 20,
                        status: 'low',
                        value: 125000
                    },
                    {
                        id: 3,
                        name: 'Đường trắng',
                        quantity: 30,
                        unit: 'kg',
                        minQuantity: 15,
                        status: 'sufficient',
                        value: 540000
                    },
                    {
                        id: 4,
                        name: 'Trân châu',
                        quantity: 8,
                        unit: 'kg',
                        minQuantity: 10,
                        status: 'low',
                        value: 640000
                    }
                ],
                recentPurchases: [
                    {
                        id: 1,
                        date: new Date('2024-01-15'),
                        supplier: 'Công ty Cà phê Việt Nam',
                        amount: 5000000,
                        items: 3
                    },
                    {
                        id: 2,
                        date: new Date('2024-01-12'),
                        supplier: 'Vinamilk',
                        amount: 1500000,
                        items: 2
                    }
                ]
            };
        }

        function exportToExcel() {
            NotificationService.info('Đang xuất báo cáo sang Excel...');
            // Implementation will use XLSX library
            setTimeout(function() {
                NotificationService.success('Xuất báo cáo Excel thành công!');
            }, 1000);
        }

        function exportToPDF() {
            NotificationService.info('Đang xuất báo cáo sang PDF...');
            // Implementation will use jsPDF library
            setTimeout(function() {
                NotificationService.success('Xuất báo cáo PDF thành công!');
            }, 1000);
        }

        function printReport() {
            window.print();
        }
    }
})();
