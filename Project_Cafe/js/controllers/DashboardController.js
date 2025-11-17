(function() {
    'use strict';

    angular.module('coffeeShopApp')
        .controller('DashboardController', DashboardController);

    DashboardController.$inject = ['$scope', '$timeout', '$interval', 'AuthService', 'ApiService', 'NotificationService'];

    function DashboardController($scope, $timeout, $interval, AuthService, ApiService, NotificationService) {
        var vm = this;

        // Properties
        vm.currentUser = AuthService.getCurrentUser();
        vm.stats = {
            todayRevenue: 0,    // Actually total revenue from backend
            todayOrders: 0,     // Actually total orders from backend
            totalProducts: 0,
            totalEmployees: 0
        };
        vm.recentOrders = [];
        vm.topProducts = [];
        vm.rawTopProducts = []; // Raw data from dashboard API
        vm.currentDateTime = '';
        vm.isLoading = true;

        // Methods
        vm.logout = logout;
        vm.toggleSidebar = toggleSidebar;
        vm.toggleTheme = toggleTheme;
        vm.formatCurrency = formatCurrency;
        vm.getStatusBadge = getStatusBadge;
        vm.getStatusText = getStatusText;

        // Initialize
        activate();

        // ==================== FUNCTIONS ====================

        function activate() {
            updateDateTime();
            loadDashboardData();
            loadTheme();
            
            // Update time every minute
            $interval(updateDateTime, 60000);
        }

        /**
         * Load saved theme from localStorage
         */
        function loadTheme() {
            var savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-mode');
            }
        }

        /**
         * Load all dashboard data
         */
        function loadDashboardData() {
            vm.isLoading = true;

            // Load stats
            loadStats();
            
            // Load recent orders
            loadRecentOrders();
            
            // Load top products
            loadTopProducts();
        }

        /**
         * Load dashboard statistics
         */
        function loadStats() {
            // Call API for dashboard report
            ApiService.get('/admin/api/Reports/dashboard')
                .then(function(response) {
                    // Map backend response to frontend stats
                    if (response.success && response.data) {
                        // Update only revenue and orders, don't overwrite products/employees
                        vm.stats.todayRevenue = response.data.tongDoanhThu || 0;
                        vm.stats.todayOrders = response.data.tongSoDonHang || 0;
                        
                        // Store top products for later use
                        vm.rawTopProducts = response.data.top5SanPhamBanChay || [];
                    }
                })
                .catch(function(error) {
                    console.error('Failed to load stats:', error);
                    // Use demo data - only update revenue and orders
                    vm.stats.todayRevenue = 0;
                    vm.stats.todayOrders = 0;
                })
                .finally(function() {
                    vm.isLoading = false;
                });
            
            // Get employee count separately
            loadEmployeeCount();
            
            // Get product count separately
            loadProductCount();
        }
        
        /**
         * Load employee count
         */
        function loadEmployeeCount() {
            ApiService.get('/admin/api/Employees')
                .then(function(response) {
                    console.log('Employees API response:', response);
                    if (response.success && response.data && Array.isArray(response.data)) {
                        vm.stats.totalEmployees = response.data.length;
                    } else if (Array.isArray(response)) {
                        vm.stats.totalEmployees = response.length;
                    }
                })
                .catch(function(error) {
                    console.error('Failed to load employees:', error);
                });
        }
        
        /**
         * Load product count
         */
        function loadProductCount() {
            ApiService.get('/admin/api/Product/monan')
                .then(function(response) {
                    // API returns array directly, not wrapped
                    if (Array.isArray(response)) {
                        vm.stats.totalProducts = response.length;
                    } else if (response.data && Array.isArray(response.data)) {
                        vm.stats.totalProducts = response.data.length;
                    } else if (response.success && response.data && Array.isArray(response.data)) {
                        vm.stats.totalProducts = response.data.length;
                    } else {
                        vm.stats.totalProducts = 0;
                    }
                    
                    // Force UI update
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                })
                .catch(function(error) {
                    console.error('Failed to load products:', error);
                    vm.stats.totalProducts = 0;
                });
        }

        /**
         * Load recent orders
         */
        function loadRecentOrders() {
            // Get all orders and filter/sort on frontend
            ApiService.get('/admin/api/Order')
                .then(function(response) {
                    var orders = [];
                    
                    // Handle different response formats
                    if (response.success && response.data && Array.isArray(response.data)) {
                        orders = response.data;
                    } else if (Array.isArray(response)) {
                        orders = response;
                    }
                    
                    console.log('📦 Total orders:', orders.length);
                    
                    // ✅ SẮP XẾP theo thời gian MỚI NHẤT trước
                    orders.sort(function(a, b) {
                        var dateA = new Date(a.thoiDiemVao || a.ngayBan || 0);
                        var dateB = new Date(b.thoiDiemVao || b.ngayBan || 0);
                        return dateB - dateA; // Descending (mới nhất trước)
                    });
                    
                    // Take only 5 most recent orders
                    var recentOrders = orders.slice(0, 5);
                    
                    console.log('📦 Recent 5 orders:', recentOrders.map(function(o) {
                        return {
                            id: o.id,
                            date: o.thoiDiemVao || o.ngayBan,
                            status: o.trangThaiHD
                        };
                    }));
                    
                    // Load order details with product prices asynchronously
                    var orderPromises = recentOrders.map(function(order) {
                        return loadOrderWithTotal(order);
                    });
                    
                    Promise.all(orderPromises).then(function(ordersWithTotals) {
                        vm.recentOrders = ordersWithTotals;
                        $scope.$apply();
                    });
                })
                .catch(function(error) {
                    console.error('Failed to load recent orders:', error);
                    vm.recentOrders = [];
                });
        }
        
        /**
         * Load order with calculated total from product prices
         */
        function loadOrderWithTotal(order) {
            return new Promise(function(resolve) {
                if (!order.chiTietHoaDonBan || !Array.isArray(order.chiTietHoaDonBan) || order.chiTietHoaDonBan.length === 0) {
                    resolve({
                        id: order.id || order.idHoaDonBan,
                        date: new Date(order.thoiDiemVao || order.ngayBan),
                        total: 0,
                        status: mapOrderStatus(order.trangThaiHD)
                    });
                    return;
                }
                
                // Load product info for each item
                var itemPromises = order.chiTietHoaDonBan.map(function(detail) {
                    return getProductPrice(detail.idMonAn).then(function(price) {
                        return {
                            quantity: detail.soLuong,
                            price: price
                        };
                    });
                });
                
                Promise.all(itemPromises).then(function(items) {
                    var total = items.reduce(function(sum, item) {
                        return sum + (item.price * item.quantity);
                    }, 0);
                    
                    resolve({
                        id: order.id || order.idHoaDonBan,
                        date: new Date(order.thoiDiemVao || order.ngayBan),
                        total: total,
                        status: mapOrderStatus(order.trangThaiHD)
                    });
                });
            });
        }
        
        /**
         * Get product price by ID
         */
        function getProductPrice(productId) {
            return new Promise(function(resolve) {
                ApiService.get('/admin/api/Product/monan')
                    .then(function(response) {
                        var products = [];
                        if (Array.isArray(response)) {
                            products = response;
                        } else if (response.data && Array.isArray(response.data)) {
                            products = response.data;
                        }

                        var foundProduct = products.find(function(p) {
                            return (p.idMonAn || p.IDMonAn || p.id) === productId;
                        });

                        if (foundProduct) {
                            var price = foundProduct.giatien || foundProduct.GIATIEN || 
                                       foundProduct.giaTien || foundProduct.GiaTien || 
                                       foundProduct.price || foundProduct.Price || 0;
                            resolve(price);
                        } else {
                            resolve(0);
                        }
                    })
                    .catch(function() {
                        resolve(0);
                    });
            });
        }
        
        /**
         * Map backend order status to frontend status
         */
        function mapOrderStatus(trangThaiHD) {
            // Backend: 0 = Chưa thanh toán, 1 = Đã thanh toán
            if (trangThaiHD === 0) return 'pending';
            if (trangThaiHD === 1) return 'completed';
            return 'pending';
        }

        /**
         * Load top selling products
         */
        function loadTopProducts() {
            ApiService.get('/admin/api/Reports/top-selling-products')
                .then(function(response) {
                    var products = [];
                    
                    // Handle different response formats
                    if (response.success && response.data && Array.isArray(response.data)) {
                        products = response.data;
                    } else if (Array.isArray(response)) {
                        products = response;
                    } else if (response.data) {
                        products = [response.data];
                    } else if (vm.rawTopProducts && vm.rawTopProducts.length > 0) {
                        // Use data from dashboard API if available
                        products = vm.rawTopProducts;
                    }
                    
                    // Map backend product structure to frontend
                    vm.topProducts = products
                        .slice(0, 5)
                        .map(function(product) {
                            return {
                                name: product.tenMonAn || product.TENMONAN || product.name || 'Sản phẩm',
                                sold: product.tongSoLuongBan || product.TONGSOLUONGBAN || product.sold || 0,
                                revenue: product.tongDoanhThu || product.TONGDOANHTHU || product.revenue || 0,
                                maxSold: Math.max.apply(Math, products.map(function(p) {
                                    return p.tongSoLuongBan || p.TONGSOLUONGBAN || p.sold || 0;
                                }))
                            };
                        });
                })
                .catch(function(error) {
                    console.error('Failed to load top products:', error);
                    
                    // Try to use data from dashboard API if available
                    if (vm.rawTopProducts && vm.rawTopProducts.length > 0) {
                        var maxSold = Math.max.apply(Math, vm.rawTopProducts.map(function(p) {
                            return p.tongSoLuongBan || p.TONGSOLUONGBAN || p.sold || 0;
                        }));
                        
                        vm.topProducts = vm.rawTopProducts.map(function(product) {
                            return {
                                name: product.tenMonAn || product.TENMONAN || product.name || 'Sản phẩm',
                                sold: product.tongSoLuongBan || product.TONGSOLUONGBAN || product.sold || 0,
                                revenue: product.tongDoanhThu || product.TONGDOANHTHU || product.revenue || 0,
                                maxSold: maxSold
                            };
                        });
                    } else {
                        vm.topProducts = [];
                    }
                });
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
                            }, 1000);
                        });
                }, 100);
            }
        }

        /**
         * Toggle sidebar
         */
        function toggleSidebar() {
            var sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.toggle('collapsed');
            }
        }

        /**
         * Toggle theme
         */
        function toggleTheme() {
            var body = document.body;
            body.classList.toggle('dark-mode');
            
            var theme = body.classList.contains('dark-mode') ? 'dark' : 'light';
            localStorage.setItem('theme', theme);
            
            NotificationService.info('Đã chuyển sang chế độ ' + (theme === 'dark' ? 'tối' : 'sáng'), 2000);
        }

        /**
         * Update current date time
         */
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

        /**
         * Format currency
         */
        function formatCurrency(amount) {
            if (!amount) return '0 đ';
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(amount);
        }

        /**
         * Get status badge class
         */
        function getStatusBadge(status) {
            var badges = {
                'pending': 'warning',
                'processing': 'info',
                'completed': 'success',
                'cancelled': 'danger'
            };
            return badges[status] || 'info';
        }

        /**
         * Get status text
         */
        function getStatusText(status) {
            var texts = {
                'pending': 'Chờ xử lý',
                'processing': 'Đang pha chế',
                'completed': 'Hoàn thành',
                'cancelled': 'Đã hủy'
            };
            return texts[status] || status;
        }

        /**
         * Get product color for chart
         */
        function getProductColor(index) {
            var colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
            return colors[index % colors.length];
        }
    }

})();
