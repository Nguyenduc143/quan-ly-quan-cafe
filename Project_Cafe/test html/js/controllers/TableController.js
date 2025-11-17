(function() {
    'use strict';

    angular.module('coffeeShopApp')
        .controller('TableController', TableController);

    TableController.$inject = ['$scope', '$location', '$timeout', 'ApiService', 'NotificationService', 'AuthService'];

    function TableController($scope, $location, $timeout, ApiService, NotificationService, AuthService) {
        var vm = this;

        // ViewModel properties
        vm.currentUser = AuthService.getCurrentUser();
        console.log('TableController - Current User:', vm.currentUser);
        vm.tables = [];
        vm.filteredTables = [];
        vm.stats = {
            available: 0,
            occupied: 0,
            reserved: 0,
            total: 0
        };
        vm.filters = {
            area: 'all',
            status: 'all'
        };
        vm.searchTerm = ''; // Add search term
        vm.currentTable = null;
        vm.isEditing = false;
        vm.showAddModal = false;
        vm.showDetailModal = false;
        vm.currentDateTime = '';

        // Update current date/time
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

        // Update time every minute
        updateDateTime();
        setInterval(function() {
            updateDateTime();
            $scope.$apply();
        }, 60000);

        // Table form model
        vm.tableForm = {
            id: null,
            name: '',
            capacity: 4,
            area: 'indoor',
            status: 'available',
            note: ''
        };

        // Area and status options
        vm.areaOptions = [
            { value: 'all', label: 'Tất cả khu vực' },
            { value: 'indoor', label: 'Trong nhà' },
            { value: 'outdoor', label: 'Ngoài trời' },
            { value: 'vip', label: 'VIP' }
        ];

        vm.statusOptions = [
            { value: 'all', label: 'Tất cả trạng thái' },
            { value: 'available', label: 'Trống' },
            { value: 'occupied', label: 'Đang phục vụ' },
            { value: 'reserved', label: 'Đã đặt' }
        ];

        // Area labels for display
        vm.areaLabels = {
            indoor: 'Trong nhà',
            outdoor: 'Ngoài trời',
            vip: 'VIP'
        };

        // Status configuration
        vm.statusConfig = {
            available: { 
                class: 'success', 
                icon: 'check-circle', 
                label: 'Trống',
                color: '#28a745'
            },
            occupied: { 
                class: 'danger', 
                icon: 'users', 
                label: 'Đang phục vụ',
                color: '#dc3545'
            },
            reserved: { 
                class: 'warning', 
                icon: 'clock', 
                label: 'Đã đặt',
                color: '#ffc107'
            }
        };

        // ViewModel methods
        vm.loadTables = loadTables;
        vm.filterTables = filterTables;
        vm.updateStats = updateStats;
        vm.openAddModal = openAddModal;
        vm.openEditModal = openEditModal;
        vm.openDetailModal = openDetailModal;
        vm.closeModal = closeModal;
        vm.closeDetailModal = closeDetailModal;
        vm.saveTable = saveTable;
        vm.deleteTable = deleteTable;
        vm.changeTableStatus = changeTableStatus;
        vm.createOrderForTable = createOrderForTable;
        vm.reserveTable = reserveTable;
        vm.startService = startService;
        vm.cancelReservation = cancelReservation;
        vm.completeTable = completeTable;
        vm.getStatusConfig = getStatusConfig;
        vm.logout = logout;

        // Initialize
        init();

        function init() {
            loadTables();
        }

        /**
         * Load tables from API
         */
        function loadTables() {
            ApiService.get('/admin/api/Ban')
                .then(function(response) {
                    // ApiService now returns response.data directly
                    var apiData = Array.isArray(response) ? response : (response.data || response || []);
                    
                    // Map API response to view model format
                    vm.tables = apiData.map(function(item) {
                        return {
                            id: item.id,
                            name: item.tenban || item.tenBan || 'Bàn ' + item.id,
                            capacity: 4, // Default capacity
                            area: 'indoor', // Default area
                            status: mapStatus(item.trangthai || item.trangThai),
                            note: '',
                            // Keep original data
                            _original: item
                        };
                    });
                    
                    filterTables();
                    updateStats();
                })
                .catch(function(error) {
                    console.error('Error loading tables:', error);
                    NotificationService.error('Không thể tải danh sách bàn. Đang sử dụng dữ liệu mẫu.');
                    
                    // Fallback to mock data for demo
                    vm.tables = getMockTables();
                    filterTables();
                    updateStats();
                });
        }

        /**
         * Map Vietnamese status to English status
         */
        function mapStatus(vietStatus) {
            if (!vietStatus) return 'available';
            
            var status = vietStatus.toLowerCase().trim();
            
            if (status === 'trống' || status === 'trong') {
                return 'available';
            } else if (status === 'có người' || status === 'co nguoi' || status === 'đang phục vụ') {
                return 'occupied';
            } else if (status === 'đã đặt' || status === 'da dat') {
                return 'reserved';
            }
            
            return 'available';
        }

        /**
         * Map English status back to Vietnamese for API
         */
        function mapStatusToVietnamese(engStatus) {
            var statusMap = {
                'available': 'Trống',
                'occupied': 'Có người',
                'reserved': 'Đã đặt'
            };
            return statusMap[engStatus] || 'Trống';
        }

        /**
         * Filter tables based on selected filters and search term
         */
        function filterTables() {
            vm.filteredTables = vm.tables.filter(function(table) {
                // Filter by area
                var matchArea = vm.filters.area === 'all' || table.area === vm.filters.area;
                
                // Filter by status
                var matchStatus = vm.filters.status === 'all' || table.status === vm.filters.status;
                
                // Filter by search term (search in table name)
                var matchSearch = true;
                if (vm.searchTerm && vm.searchTerm.trim() !== '') {
                    var searchLower = vm.searchTerm.toLowerCase().trim();
                    var tableName = (table.name || '').toLowerCase();
                    matchSearch = tableName.indexOf(searchLower) !== -1;
                }
                
                return matchArea && matchStatus && matchSearch;
            });
        }

        /**
         * Update statistics
         */
        function updateStats() {
            vm.stats = {
                available: vm.tables.filter(function(t) { return t.status === 'available'; }).length,
                occupied: vm.tables.filter(function(t) { return t.status === 'occupied'; }).length,
                reserved: vm.tables.filter(function(t) { return t.status === 'reserved'; }).length,
                total: vm.tables.length
            };
        }

        /**
         * Open add table modal
         */
        function openAddModal() {
            vm.isEditing = false;
            vm.tableForm = {
                id: null,
                name: '',
                capacity: 4,
                area: 'indoor',
                status: 'available',
                note: ''
            };
            vm.showAddModal = true;
        }

        /**
         * Open edit table modal
         */
        function openEditModal(table) {
            vm.isEditing = true;
            vm.tableForm = angular.copy(table);
            vm.showDetailModal = false;
            vm.showAddModal = true;
        }

        /**
         * Open table detail modal
         */
        function openDetailModal(table) {
            vm.currentTable = table;
            vm.showDetailModal = true;
        }

        /**
         * Close add/edit modal
         */
        function closeModal() {
            vm.showAddModal = false;
            vm.isEditing = false;
            vm.tableForm = {
                id: null,
                name: '',
                capacity: 4,
                area: 'indoor',
                status: 'available',
                note: ''
            };
        }

        /**
         * Close detail modal
         */
        function closeDetailModal() {
            vm.showDetailModal = false;
            vm.currentTable = null;
        }

        /**
         * Save table (add or update)
         */
        function saveTable() {
            // Validation
            if (!vm.tableForm.name || !vm.tableForm.capacity || !vm.tableForm.area) {
                NotificationService.error('Vui lòng điền đầy đủ thông tin!');
                return;
            }

            if (vm.tableForm.capacity < 1 || vm.tableForm.capacity > 20) {
                NotificationService.error('Số chỗ ngồi phải từ 1 đến 20!');
                return;
            }

            // Map to API format (UPPERCASE properties)
            var tableData = {
                TENBAN: vm.tableForm.name,
                TRANGTHAI: mapStatusToVietnamese(vm.tableForm.status || 'available')
            };

            if (vm.isEditing && vm.tableForm.id) {
                // Update existing table
                tableData.ID = vm.tableForm.id;
                
                ApiService.put('/admin/api/Ban', tableData)
                    .then(function(response) {
                        NotificationService.success('Đã cập nhật bàn thành công!');
                        closeModal();
                        loadTables();
                    })
                    .catch(function(error) {
                        console.error('Error updating table:', error);
                        var errorMsg = 'Không thể cập nhật bàn';
                        if (error.data && error.data.Message) {
                            errorMsg = error.data.Message;
                        }
                        NotificationService.error(errorMsg);
                    });
            } else {
                // Create new table
                ApiService.post('/admin/api/Ban', tableData)
                    .then(function(response) {
                        NotificationService.success('Đã thêm bàn mới thành công!');
                        closeModal();
                        loadTables();
                    })
                    .catch(function(error) {
                        console.error('Error creating table:', error);
                        var errorMsg = 'Không thể thêm bàn mới';
                        if (error.data && error.data.Message) {
                            errorMsg = error.data.Message;
                        }
                        NotificationService.error(errorMsg);
                    });
            }
        }

        /**
         * Delete table
         */
        function deleteTable(tableId) {
            var table = vm.tables.find(function(t) { return t.id === tableId; });
            
            if (!table) return;

            if (table.status === 'occupied') {
                NotificationService.error('Không thể xóa bàn đang có khách!');
                return;
            }

            if (!confirm('Bạn có chắc muốn xóa ' + table.name + '?')) {
                return;
            }

            ApiService.delete('/admin/api/Ban/' + tableId)
                .then(function(response) {
                    NotificationService.success('Đã xóa bàn thành công!');
                    closeDetailModal();
                    loadTables();
                })
                .catch(function(error) {
                    console.error('Error deleting table:', error);
                    NotificationService.error('Không thể xóa bàn');
                });
        }

        /**
         * Change table status (cycle through statuses)
         */
        function changeTableStatus(tableId) {
            var table = vm.tables.find(function(t) { return t.id === tableId; });
            
            if (!table) {
                NotificationService.error('Không tìm thấy bàn!');
                return;
            }

            var statusCycle = ['available', 'reserved', 'occupied'];
            var currentIndex = statusCycle.indexOf(table.status);
            var nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
            var nextVietnameseStatus = mapStatusToVietnamese(nextStatus);

            // Backend model properties: ID, TENBAN, TRANGTHAI (UPPERCASE)
            var updateData = {
                ID: tableId,
                TENBAN: table.name,
                TRANGTHAI: nextVietnameseStatus
            };

            console.log('Updating table status:', updateData);

            ApiService.put('/admin/api/Ban', updateData)
                .then(function(response) {
                    var statusLabels = {
                        available: 'Trống',
                        occupied: 'Đang phục vụ',
                        reserved: 'Đã đặt'
                    };
                    NotificationService.success('Đã đổi trạng thái bàn thành: ' + statusLabels[nextStatus]);
                    loadTables();
                })
                .catch(function(error) {
                    console.error('Error changing table status:', error);
                    var errorMsg = 'Không thể đổi trạng thái bàn';
                    if (error.data && error.data.Message) {
                        errorMsg = error.data.Message;
                    }
                    NotificationService.error(errorMsg);
                });
        }

        /**
         * Create order for table
         */
        function createOrderForTable(tableId) {
            var table = vm.tables.find(function(t) { return t.id === tableId; });
            
            if (!table) return;

            if (table.status === 'occupied') {
                NotificationService.error('Bàn này đang phục vụ! Vui lòng dùng chức năng "Thêm món" để thêm món vào đơn hàng hiện tại.');
                return;
            }

            // Create new order
            var orderData = {
                tableId: tableId,
                tableName: table.name,
                items: [],
                total: 0,
                status: 'pending'
            };

            ApiService.post('/admin/api/Order', orderData)
                .then(function(response) {
                    // ApiService returns response.data directly
                    var orderId = (response && response.id) || null;
                    
                    // Update table status to occupied
                    return ApiService.patch('/admin/api/Ban/' + tableId + '/status', { 
                        status: 'occupied',
                        currentOrderId: orderId
                    }).then(function() {
                        NotificationService.success('Đã tạo đơn hàng ' + orderId + ' cho ' + table.name);
                        closeDetailModal();
                        
                        // Redirect to orders page
                        $timeout(function() {
                            $location.path('/orders').search({ orderId: orderId });
                        }, 1000);
                    });
                })
                .catch(function(error) {
                    console.error('Error creating order:', error);
                    NotificationService.error('Không thể tạo đơn hàng');
                });
        }

        /**
         * Reserve table
         */
        function reserveTable(tableId) {
            var table = vm.tables.find(function(t) { return t.id === tableId; });
            
            if (!table) return;

            ApiService.patch('/admin/api/Ban/' + tableId + '/status', { status: 'reserved' })
                .then(function(response) {
                    NotificationService.success('Đã đặt bàn ' + table.name);
                    closeDetailModal();
                    loadTables();
                })
                .catch(function(error) {
                    console.error('Error reserving table:', error);
                    NotificationService.error('Không thể đặt bàn');
                });
        }

        /**
         * Start service for reserved table
         */
        function startService(tableId) {
            var table = vm.tables.find(function(t) { return t.id === tableId; });
            
            if (!table) return;

            ApiService.patch('/admin/api/Ban/' + tableId + '/status', { status: 'occupied' })
                .then(function(response) {
                    NotificationService.success('Đã bắt đầu phục vụ ' + table.name + '. Click vào bàn để tạo đơn hàng.', 4000);
                    closeDetailModal();
                    loadTables();
                })
                .catch(function(error) {
                    console.error('Error starting service:', error);
                    NotificationService.error('Không thể bắt đầu phục vụ');
                });
        }

        /**
         * Cancel reservation
         */
        function cancelReservation(tableId) {
            var table = vm.tables.find(function(t) { return t.id === tableId; });
            
            if (!table) return;

            ApiService.patch('/admin/api/Ban/' + tableId + '/status', { status: 'available' })
                .then(function(response) {
                    NotificationService.success('Đã hủy đặt bàn ' + table.name);
                    closeDetailModal();
                    loadTables();
                })
                .catch(function(error) {
                    console.error('Error cancelling reservation:', error);
                    NotificationService.error('Không thể hủy đặt bàn');
                });
        }

        /**
         * Complete service and payment
         */
        function completeTable(tableId) {
            var table = vm.tables.find(function(t) { return t.id === tableId; });
            
            if (!table) return;

            if (!table.currentOrderId) {
                NotificationService.error('Bàn này không có đơn hàng!');
                return;
            }

            // Get order details
            ApiService.get('/admin/api/Order/' + table.currentOrderId)
                .then(function(response) {
                    // ApiService returns response.data directly
                    var order = response;
                    
                    if (!confirm('Xác nhận thanh toán cho bàn ' + table.name + '?\nTổng tiền: ' + formatCurrency(order.total))) {
                        return;
                    }

                    // Update order status to paid
                    return ApiService.patch('/admin/api/Order/' + order.id + '/status', { 
                        status: 'paid' 
                    }).then(function() {
                        // Reset table to available
                        return ApiService.patch('/admin/api/Ban/' + tableId + '/status', { 
                            status: 'available',
                            currentOrderId: null
                        });
                    }).then(function() {
                        NotificationService.success('Thanh toán thành công! Bàn ' + table.name + ' đã trống.', 4000);
                        closeDetailModal();
                        loadTables();
                    });
                })
                .catch(function(error) {
                    console.error('Error completing table:', error);
                    NotificationService.error('Không thể thanh toán');
                });
        }

        /**
         * Get status configuration
         */
        function getStatusConfig(status) {
            return vm.statusConfig[status] || vm.statusConfig.available;
        }

        /**
         * Format currency
         */
        function formatCurrency(amount) {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(amount);
        }

        /**
         * Get mock tables for demo
         */
        function getMockTables() {
            return [
                { 
                    id: 1, 
                    name: 'Bàn 1', 
                    capacity: 2, 
                    area: 'indoor', 
                    status: 'available', 
                    note: '', 
                    currentOrderId: null 
                },
                { 
                    id: 2, 
                    name: 'Bàn 2', 
                    capacity: 4, 
                    area: 'indoor', 
                    status: 'occupied', 
                    note: '', 
                    currentOrderId: 'ORD12345' 
                },
                { 
                    id: 3, 
                    name: 'Bàn 3', 
                    capacity: 4, 
                    area: 'indoor', 
                    status: 'available', 
                    note: '', 
                    currentOrderId: null 
                },
                { 
                    id: 4, 
                    name: 'Bàn 4', 
                    capacity: 6, 
                    area: 'outdoor', 
                    status: 'reserved', 
                    note: 'Đặt trước 2 tiếng', 
                    currentOrderId: null 
                },
                { 
                    id: 5, 
                    name: 'Bàn 5', 
                    capacity: 6, 
                    area: 'outdoor', 
                    status: 'available', 
                    note: '', 
                    currentOrderId: null 
                },
                { 
                    id: 6, 
                    name: 'Bàn VIP 1', 
                    capacity: 8, 
                    area: 'vip', 
                    status: 'available', 
                    note: 'Phòng riêng', 
                    currentOrderId: null 
                },
                { 
                    id: 7, 
                    name: 'Bàn VIP 2', 
                    capacity: 10, 
                    area: 'vip', 
                    status: 'occupied', 
                    note: 'Phòng riêng có view', 
                    currentOrderId: 'ORD12346' 
                }
            ];
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
    }
})();
