(function() {
    'use strict';

    angular.module('coffeeShopApp')
        .controller('OrdersController', OrdersController);

    OrdersController.$inject = ['$scope', '$timeout', '$interval', 'ApiService', 'NotificationService', 'AuthService'];

    function OrdersController($scope, $timeout, $interval, ApiService, NotificationService, AuthService) {
        var vm = this;

        // Properties
        vm.currentUser = AuthService.getCurrentUser();
        console.log('OrdersController - Current User:', vm.currentUser);
        vm.orders = [];
        vm.filteredOrders = [];
        vm.products = [];
        vm.tables = [];
        vm.cart = [];
        vm.selectedOrder = null;
        vm.newOrder = {
            tableId: '',
            items: []
        };
        vm.isLoading = true;
        vm.isDetailsModalOpen = false;
        vm.isCreateModalOpen = false;
        vm.searchTerm = '';
        vm.selectedStatus = 'all';
        vm.currentDateTime = '';

        // Methods
        vm.loadOrders = loadOrders;
        vm.loadProducts = loadProducts;
        vm.loadTables = loadTables;
        vm.filterOrders = filterOrders;
        vm.openOrderModal = openOrderModal;
        vm.closeCreateModal = closeCreateModal;
        vm.viewOrderDetails = viewOrderDetails;
        vm.closeDetailsModal = closeDetailsModal;
        vm.addToCart = addToCart;
        vm.removeFromCart = removeFromCart;
        vm.increaseQuantity = increaseQuantity;
        vm.decreaseQuantity = decreaseQuantity;
        vm.calculateTotal = calculateTotal;
        vm.createOrder = createOrder;
        vm.payOrder = payOrder;
        vm.deleteOrder = deleteOrder;
        vm.formatCurrency = formatCurrency;
        vm.formatDateTime = formatDateTime;
        vm.toggleTheme = toggleTheme;
        vm.logout = logout;

        // Initialize
        activate();

        // ==================== FUNCTIONS ====================

        function activate() {
            updateDateTime();
            loadOrders();
            loadProducts();
            loadTables();
            loadTheme();
            
            // Update time every minute
            $interval(updateDateTime, 60000);
        }

        /**
         * Update current date and time
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
         * Load saved theme from localStorage
         */
        function loadTheme() {
            var savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-mode');
            }
        }

        /**
         * Load all orders
         */
        function loadOrders() {
            vm.isLoading = true;
            
            ApiService.get('/admin/api/Order')
                .then(function(response) {
                    var orders = [];
                    
                    // Handle different response formats
                    if (response.value && Array.isArray(response.value)) {
                        orders = response.value;
                    } else if (Array.isArray(response)) {
                        orders = response;
                    } else if (response.data && Array.isArray(response.data)) {
                        orders = response.data;
                    }
                    
                    // Map backend structure to frontend - with proper async product loading
                    var orderPromises = orders.map(function(order) {
                        return loadOrderDetails(order);
                    });
                    
                    Promise.all(orderPromises).then(function(mappedOrders) {
                        vm.orders = mappedOrders;
                        filterOrders();
                        vm.isLoading = false;
                        $scope.$apply();
                    });
                })
                .catch(function(error) {
                    console.error('Failed to load orders:', error);
                    NotificationService.error('Không thể tải danh sách đơn hàng');
                    vm.orders = [];
                    vm.isLoading = false;
                });
        }

        /**
         * Load order details with product info
         */
        function loadOrderDetails(order) {
            return new Promise(function(resolve) {
                var mappedOrder = {
                    id: order.id,
                    tableId: order.idBan,
                    tableName: order.idBan ? 'Bàn ' + order.idBan : null,
                    timeIn: order.thoiDiemVao,
                    timeOut: order.thoiDiemRa,
                    status: order.trangThaiHD,
                    employeeId: order.idNhanVien,
                    items: [],
                    total: 0
                };

                // Load product details for each item
                if (order.chiTietHoaDonBan && Array.isArray(order.chiTietHoaDonBan)) {
                    var itemPromises = order.chiTietHoaDonBan.map(function(detail) {
                        return getProductInfo(detail.idMonAn).then(function(product) {
                            if (product) {
                                return {
                                    productId: detail.idMonAn,
                                    productName: product.name,
                                    quantity: detail.soLuong,
                                    price: product.price
                                };
                            }
                            return null;
                        });
                    });

                    Promise.all(itemPromises).then(function(items) {
                        mappedOrder.items = items.filter(function(item) { return item !== null; });
                        mappedOrder.total = mappedOrder.items.reduce(function(sum, item) {
                            return sum + (item.price * item.quantity);
                        }, 0);
                        resolve(mappedOrder);
                    });
                } else {
                    resolve(mappedOrder);
                }
            });
        }

        /**
         * Get product info by ID
         */
        function getProductInfo(productId) {
            return new Promise(function(resolve) {
                // Check if already loaded
                var product = vm.products.find(function(p) { return p.id === productId; });
                if (product) {
                    resolve(product);
                    return;
                }

                // Load from API if not in cache
                ApiService.get('/admin/api/Product/monan')
                    .then(function(response) {
                        var products = [];
                        if (Array.isArray(response)) {
                            products = response;
                        } else if (response.data && Array.isArray(response.data)) {
                            products = response.data;
                        }

                        var foundProduct = products.find(function(p) {
                            return (p.idMonAn || p.IDMonAn) === productId;
                        });

                        if (foundProduct) {
                            var productInfo = {
                                id: foundProduct.idMonAn || foundProduct.IDMonAn,
                                name: foundProduct.tenmonan || foundProduct.TENMONAN || foundProduct.tenMonAn || foundProduct.TenMonAn,
                                price: foundProduct.giatien || foundProduct.GIATIEN || foundProduct.giaTien || foundProduct.GiaTien || 0
                            };
                            resolve(productInfo);
                        } else {
                            resolve(null);
                        }
                    })
                    .catch(function() {
                        resolve(null);
                    });
            });
        }

        /**
         * Load all products
         */
        function loadProducts() {
            ApiService.get('/admin/api/Product/monan')
                .then(function(response) {
                    var products = [];
                    if (Array.isArray(response)) {
                        products = response;
                    } else if (response.data && Array.isArray(response.data)) {
                        products = response.data;
                    }

                    vm.products = products.map(function(product) {
                        return {
                            id: product.idMonAn || product.IDMonAn,
                            name: product.tenmonan || product.TENMONAN,
                            price: product.giatien || product.GIATIEN,
                            categoryId: product.idDanhmuc || product.IDDanhmuc,
                            categoryName: product.tendanhmuc || product.TENDANHMUC
                        };
                    });
                })
                .catch(function(error) {
                    console.error('Failed to load products:', error);
                    vm.products = [];
                });
        }

        /**
         * Load all tables
         */
        function loadTables() {
            ApiService.get('/admin/api/Ban')
                .then(function(response) {
                    var tables = [];
                    if (Array.isArray(response)) {
                        tables = response;
                    } else if (response.data && Array.isArray(response.data)) {
                        tables = response.data;
                    }

                    vm.tables = tables.map(function(table) {
                        return {
                            id: table.id || table.idBan || table.IDBan,
                            name: table.tenban || table.tenBan || table.TENBAN || 'Bàn ' + (table.id || table.idBan || table.IDBan),
                            status: table.trangthai || table.trangThai || table.TRANGTHAI || 'Trống'
                        };
                    });
                })
                .catch(function(error) {
                    console.error('Failed to load tables:', error);
                    vm.tables = [];
                });
        }

        /**
         * Filter orders
         */
        function filterOrders() {
            vm.filteredOrders = vm.orders.filter(function(order) {
                var matchSearch = true;
                var matchStatus = true;

                // Search filter
                if (vm.searchTerm) {
                    var search = vm.searchTerm.toLowerCase();
                    matchSearch = order.id.toString().includes(search) ||
                                  (order.tableName && order.tableName.toLowerCase().includes(search));
                }

                // Status filter
                if (vm.selectedStatus !== 'all') {
                    matchStatus = order.status === parseInt(vm.selectedStatus);
                }

                return matchSearch && matchStatus;
            });
        }

        /**
         * Open create order modal
         */
        function openOrderModal() {
            console.log('[DEBUG] Opening create order modal');
            console.log('[DEBUG] Products available:', vm.products.length);
            console.log('[DEBUG] Tables available:', vm.tables.length);
            
            vm.cart = [];
            vm.newOrder = {
                tableId: '',
                items: []
            };
            vm.isCreateModalOpen = true;
        }

        /**
         * Close create modal
         */
        function closeCreateModal() {
            vm.isCreateModalOpen = false;
            vm.cart = [];
        }

        /**
         * View order details
         */
        function viewOrderDetails(order) {
            vm.selectedOrder = angular.copy(order);
            vm.isDetailsModalOpen = true;
        }

        /**
         * Close details modal
         */
        function closeDetailsModal() {
            vm.isDetailsModalOpen = false;
            vm.selectedOrder = null;
        }

        /**
         * Add product to cart
         */
        function addToCart(product) {
            var existingItem = vm.cart.find(function(item) {
                return item.id === product.id;
            });

            if (existingItem) {
                existingItem.quantity++;
            } else {
                vm.cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1
                });
            }
        }

        /**
         * Remove from cart
         */
        function removeFromCart(item) {
            var index = vm.cart.indexOf(item);
            if (index > -1) {
                vm.cart.splice(index, 1);
            }
        }

        /**
         * Increase quantity
         */
        function increaseQuantity(item) {
            item.quantity++;
        }

        /**
         * Decrease quantity
         */
        function decreaseQuantity(item) {
            if (item.quantity > 1) {
                item.quantity--;
            } else {
                removeFromCart(item);
            }
        }

        /**
         * Calculate cart total
         */
        function calculateTotal() {
            return vm.cart.reduce(function(sum, item) {
                return sum + (item.price * item.quantity);
            }, 0);
        }

        /**
         * Create new order
         */
        function createOrder() {
            console.log('[DEBUG] createOrder() called');
            console.log('[DEBUG] Cart:', vm.cart);
            console.log('[DEBUG] Current user:', vm.currentUser);
            
            if (vm.cart.length === 0) {
                NotificationService.error('Vui lòng thêm sản phẩm vào đơn hàng!');
                return;
            }

            if (!vm.newOrder.tableId || vm.newOrder.tableId === '') {
                NotificationService.error('Vui lòng chọn bàn cho đơn hàng!');
                return;
            }

            // Prepare order data
            var orderData = {
                idBan: vm.newOrder.tableId ? parseInt(vm.newOrder.tableId) : 0, // 0 for takeaway
                idNhanVien: vm.currentUser.id || 1, // Use current user ID
                trangThaiHD: 0, // Unpaid
                chiTietHoaDonBan: vm.cart.map(function(item) {
                    return {
                        idMonAn: item.id,
                        soLuong: item.quantity
                    };
                })
            };

            console.log('[DEBUG] Order data to send:', JSON.stringify(orderData, null, 2));

            ApiService.post('/admin/api/Order', orderData)
                .then(function(response) {
                    console.log('[DEBUG] Order created successfully:', response);
                    NotificationService.success('Đặt hàng thành công!');
                    closeCreateModal();
                    loadOrders();
                })
                .catch(function(error) {
                    console.error('[ERROR] Failed to create order:', error);
                    console.error('[ERROR] Error details:', JSON.stringify(error, null, 2));
                    var errorMsg = error.Message || error.message || error.data || 'Không thể tạo đơn hàng';
                    NotificationService.error(errorMsg);
                });
        }

        /**
         * Pay order
         */
        function payOrder(order) {
            if (!confirm('Xác nhận thanh toán đơn hàng #' + order.id + '?')) {
                return;
            }

            // Update order status using PATCH endpoint
            var updateData = {
                trangThaiHD: 1, // Paid
                thoiDiemRa: new Date().toISOString()
            };

            console.log('[DEBUG] Paying order:', order.id, updateData);

            // Use PATCH endpoint: PATCH /api/Order/{id}/status
            ApiService.patch('/admin/api/Order/' + order.id + '/status', updateData)
                .then(function(response) {
                    console.log('[DEBUG] Order paid successfully:', response);
                    NotificationService.success('Thanh toán thành công!');
                    closeDetailsModal();
                    loadOrders();
                })
                .catch(function(error) {
                    console.error('Failed to pay order:', error);
                    var errorMsg = error.Message || error.message || 'Không thể thanh toán đơn hàng';
                    NotificationService.error(errorMsg);
                });
        }

        /**
         * Delete order
         */
        function deleteOrder(orderId) {
            // Find the order to check status
            var order = vm.filteredOrders.find(function(o) {
                return o.id === orderId;
            });

            // Check if order is already paid
            if (order && order.status === 1) {
                NotificationService.error('Không thể xóa đơn hàng đã thanh toán!');
                return;
            }

            if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
                return;
            }

            ApiService.delete('/admin/api/Order/' + orderId)
                .then(function(response) {
                    NotificationService.success('Xóa đơn hàng thành công!');
                    loadOrders();
                })
                .catch(function(error) {
                    console.error('Failed to delete order:', error);
                    var errorMsg = error.Message || error.message || 'Không thể xóa đơn hàng';
                    NotificationService.error(errorMsg);
                });
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
         * Format date time
         */
        function formatDateTime(dateString) {
            if (!dateString) return '';
            var date = new Date(dateString);
            return date.toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
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
         * Logout
         */
        function logout() {
            if (confirm('Bạn có chắc muốn đăng xuất?')) {
                NotificationService.success('Đang đăng xuất...', 1500);
                
                $timeout(function() {
                    AuthService.logout()
                        .then(function() {
                            $timeout(function() {
                                window.location.href = '#!/login';
                            }, 1500);
                        })
                        .catch(function(error) {
                            console.error('Logout error:', error);
                            $timeout(function() {
                                window.location.href = '#!/login';
                            }, 1000);
                        });
                }, 100);
            }
        }
    }

})();

