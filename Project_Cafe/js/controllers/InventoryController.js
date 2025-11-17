(function() {
    'use strict';

    angular.module('coffeeShopApp')
        .controller('InventoryController', InventoryController);

    InventoryController.$inject = ['$scope', '$interval', 'AuthService', 'NotificationService', 'ApiService'];

    function InventoryController($scope, $interval, AuthService, NotificationService, ApiService) {
        var vm = this;

        // Properties
        vm.currentUser = AuthService.getCurrentUser();
        vm.activeTab = 'materials';
        vm.materials = [];
        vm.suppliers = [];
        vm.purchases = [];
        vm.isLoading = false;
        vm.isLoadingSuppliers = false;
        vm.isLoadingInvoices = false;
        vm.currentDateTime = '';
        vm.searchTerm = '';
        vm.statusFilter = 'all';
        vm.supplierSearch = '';
        vm.purchaseSearch = '';
        vm.purchaseDate = null;
        vm.canEdit = AuthService.canEdit();
        vm.isManager = AuthService.isManager();

        // Modal states
        vm.showMaterialModal = false;
        vm.showSupplierModal = false;
        vm.showPurchaseModal = false;
        vm.currentMaterial = null;
        vm.currentSupplier = null;
        vm.currentPurchase = null;

        // Methods
        vm.switchTab = switchTab;
        vm.logout = logout;
        vm.toggleSidebar = toggleSidebar;
        vm.toggleTheme = toggleTheme;
        vm.formatCurrency = formatCurrency;
        vm.getTotalInventoryValue = getTotalInventoryValue;
        vm.getLowStockCount = getLowStockCount;
        vm.getOutOfStockCount = getOutOfStockCount;
        vm.getTotalPurchaseValue = getTotalPurchaseValue;
        
        // Material methods
        vm.openMaterialModal = openMaterialModal;
        vm.closeMaterialModal = closeMaterialModal;
        vm.saveMaterial = saveMaterial;
        vm.editMaterial = editMaterial;
        vm.deleteMaterial = deleteMaterial;
        vm.filterMaterials = filterMaterials;
        
        // Supplier methods
        vm.openSupplierModal = openSupplierModal;
        vm.closeSupplierModal = closeSupplierModal;
        vm.saveSupplier = saveSupplier;
        vm.editSupplier = editSupplier;
        vm.deleteSupplier = deleteSupplier;
        
        // Invoice methods
        vm.openPurchaseModal = openPurchaseModal;
        vm.closePurchaseModal = closePurchaseModal;
        vm.savePurchase = savePurchase;
        vm.viewPurchaseDetails = viewPurchaseDetails;
        vm.deletePurchase = deletePurchase;
        vm.addItemToInvoice = addItemToInvoice;
        vm.removeItemFromInvoice = removeItemFromInvoice;
        vm.getMaterialName = getMaterialName;
        vm.calculateItemTotal = calculateItemTotal;

        // Initialize
        activate();

        function activate() {
            updateDateTime();
            loadMaterials();
            loadSuppliers();
            loadPurchases();
            loadTheme();
            
            // Update time every minute
            $interval(updateDateTime, 60000);
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

        function switchTab(tab) {
            vm.activeTab = tab;
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

        function toggleSidebar() {
            var sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.toggle('collapsed');
            }
        }

        function toggleTheme() {
            var currentTheme = localStorage.getItem('theme') || 'light';
            var newTheme = currentTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            document.body.classList.toggle('dark-mode');
            NotificationService.info('Đã chuyển sang chế độ ' + (newTheme === 'dark' ? 'tối' : 'sáng'));
        }

        function formatCurrency(amount) {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(amount || 0);
        }

        function getTotalInventoryValue() {
            // Since backend doesn't have price, return 0
            return 0;
        }

        function getLowStockCount() {
            // Since backend doesn't have minQuantity, consider items with quantity < 10 as low stock
            return vm.materials.filter(function(material) {
                return material.quantity < 10 && material.quantity > 0;
            }).length;
        }

        function getOutOfStockCount() {
            return vm.materials.filter(function(material) {
                return material.quantity === 0;
            }).length;
        }

        function getTotalPurchaseValue() {
            return vm.purchases.reduce(function(total, purchase) {
                return total + (purchase.totalAmount || 0);
            }, 0);
        }

        function filterMaterials(material) {
            // Filter by search term
            if (vm.searchTerm) {
                var searchLower = vm.searchTerm.toLowerCase();
                var matchesSearch = (material.name && material.name.toLowerCase().indexOf(searchLower) !== -1) ||
                                  (material.unit && material.unit.toLowerCase().indexOf(searchLower) !== -1) ||
                                  (material.note && material.note.toLowerCase().indexOf(searchLower) !== -1);
                if (!matchesSearch) {
                    return false;
                }
            }
            
            // Filter by status
            if (vm.statusFilter === 'all') {
                return true;
            } else if (vm.statusFilter === 'in-stock') {
                return material.quantity >= 10;
            } else if (vm.statusFilter === 'low-stock') {
                return material.quantity < 10 && material.quantity > 0;
            } else if (vm.statusFilter === 'out-of-stock') {
                return material.quantity === 0;
            }
            
            return true;
        }

        // ===== MATERIAL FUNCTIONS =====
        function loadMaterials() {
            vm.isLoading = true;
            
            ApiService.get('/admin/api/Inventory')
                .then(function(response) {
                    console.log('Inventory API response:', response);
                    var materials = [];
                    
                    // Handle different response formats
                    if (response.success && response.data && Array.isArray(response.data)) {
                        materials = response.data;
                    } else if (Array.isArray(response)) {
                        materials = response;
                    } else if (response.data && Array.isArray(response.data)) {
                        materials = response.data;
                    }
                    
                    // Map backend structure to frontend
                    vm.materials = materials.map(function(material) {
                        return {
                            id: material.id || material.Id,
                            name: material.tenNguyenLieu || material.TenNguyenLieu || '',
                            unit: material.donViTinh || material.DonViTinh || '',
                            quantity: material.soLuongTon || material.SoLuongTon || 0,
                            note: material.ghiChu || material.GhiChu || '',
                            // Frontend-only fields for display
                            minQuantity: 0,
                            price: 0,
                            supplierId: null,
                            supplierName: ''
                        };
                    });
                    
                    console.log('Mapped materials:', vm.materials);
                })
                .catch(function(error) {
                    console.error('Failed to load materials:', error);
                    NotificationService.error('Không thể tải danh sách nguyên liệu');
                    vm.materials = [];
                })
                .finally(function() {
                    vm.isLoading = false;
                });
        }

        function openMaterialModal(material) {
            if (!vm.canEdit) {
                NotificationService.error('⚠️ Bạn không có quyền thực hiện thao tác này!');
                return;
            }
            
            if (material) {
                vm.currentMaterial = {
                    id: material.id,
                    name: material.name,
                    unit: material.unit,
                    quantity: material.quantity || 0,
                    note: material.note || ''
                };
            } else {
                vm.currentMaterial = {
                    name: '',
                    unit: '',
                    quantity: 0,
                    note: ''
                };
            }
            vm.showMaterialModal = true;
        }

        function closeMaterialModal() {
            vm.showMaterialModal = false;
            vm.currentMaterial = null;
        }

        function saveMaterial() {
            if (!vm.canEdit) {
                NotificationService.error('⚠️ Bạn không có quyền thực hiện thao tác này!');
                return;
            }
            
            if (!vm.currentMaterial.name || !vm.currentMaterial.unit) {
                NotificationService.error('Vui lòng nhập đầy đủ thông tin');
                return;
            }

            // Prepare data for API (match backend model exactly)
            var materialData = {
                tenNguyenLieu: vm.currentMaterial.name,
                donViTinh: vm.currentMaterial.unit,
                soLuongTon: vm.currentMaterial.quantity || 0,
                ghiChu: vm.currentMaterial.note || ''
            };

            if (vm.currentMaterial.id) {
                // Update existing material
                ApiService.put('/admin/api/Inventory/' + vm.currentMaterial.id, materialData)
                    .then(function(response) {
                        NotificationService.success('Cập nhật nguyên liệu thành công');
                        loadMaterials();
                        closeMaterialModal();
                    })
                    .catch(function(error) {
                        console.error('Failed to update material:', error);
                        NotificationService.error('Không thể cập nhật nguyên liệu');
                    });
            } else {
                // Add new material
                ApiService.post('/admin/api/Inventory', materialData)
                    .then(function(response) {
                        NotificationService.success('Thêm nguyên liệu thành công');
                        loadMaterials();
                        closeMaterialModal();
                    })
                    .catch(function(error) {
                        console.error('Failed to add material:', error);
                        NotificationService.error('Không thể thêm nguyên liệu');
                    });
            }
        }

        function editMaterial(material) {
            openMaterialModal(material);
        }

        function deleteMaterial(materialId) {
            if (!vm.canEdit) {
                NotificationService.error('⚠️ Bạn không có quyền thực hiện thao tác này!');
                return;
            }
            
            if (confirm('Bạn có chắc muốn xóa nguyên liệu này?')) {
                ApiService.delete('/admin/api/Inventory/' + materialId)
                    .then(function(response) {
                        NotificationService.success('Xóa nguyên liệu thành công');
                        loadMaterials();
                    })
                    .catch(function(error) {
                        console.error('Failed to delete material:', error);
                        NotificationService.error('Không thể xóa nguyên liệu');
                    });
            }
        }

        // ===== SUPPLIER FUNCTIONS =====
        function loadSuppliers() {
            vm.isLoadingSuppliers = true;
            
            ApiService.get('/admin/api/Suppliers')
                .then(function(response) {
                    console.log('Suppliers API response:', response);
                    var suppliers = [];
                    
                    // Handle different response formats
                    if (Array.isArray(response)) {
                        suppliers = response;
                    } else if (response.data && Array.isArray(response.data)) {
                        suppliers = response.data;
                    } else if (response.success && response.data && Array.isArray(response.data)) {
                        suppliers = response.data;
                    }
                    
                    console.log('Raw suppliers:', suppliers);
                    
                    // Map backend structure to frontend
                    vm.suppliers = suppliers.map(function(supplier) {
                        console.log('Mapping supplier:', supplier);
                        return {
                            id: supplier.id || supplier.Id,
                            name: supplier.tenNhaCungCap || supplier.TenNhaCungCap || '',
                            phone: supplier.sdt || supplier.Sdt || '',
                            email: supplier.email || supplier.Email || '',
                            address: supplier.diaChi || supplier.DiaChi || ''
                        };
                    });
                    
                    console.log('Mapped suppliers:', vm.suppliers);
                })
                .catch(function(error) {
                    console.error('Failed to load suppliers:', error);
                    NotificationService.error('Không thể tải danh sách nhà cung cấp');
                    vm.suppliers = [];
                })
                .finally(function() {
                    vm.isLoadingSuppliers = false;
                });
        }

        function openSupplierModal(supplier) {
            if (!vm.canEdit) {
                NotificationService.error('⚠️ Bạn không có quyền thực hiện thao tác này!');
                return;
            }
            
            if (supplier) {
                vm.currentSupplier = angular.copy(supplier);
            } else {
                vm.currentSupplier = {
                    name: '',
                    phone: '',
                    email: '',
                    address: ''
                };
            }
            vm.showSupplierModal = true;
        }

        function closeSupplierModal() {
            vm.showSupplierModal = false;
            vm.currentSupplier = null;
        }

        function saveSupplier() {
            if (!vm.canEdit) {
                NotificationService.error('⚠️ Bạn không có quyền thực hiện thao tác này!');
                return;
            }
            
            // Validation
            if (!vm.currentSupplier.name || !vm.currentSupplier.name.trim()) {
                NotificationService.error('Vui lòng nhập tên nhà cung cấp');
                return;
            }
            
            if (!vm.currentSupplier.phone || !vm.currentSupplier.phone.trim()) {
                NotificationService.error('Vui lòng nhập số điện thoại');
                return;
            }
            
            if (!vm.currentSupplier.address || !vm.currentSupplier.address.trim()) {
                NotificationService.error('Vui lòng nhập địa chỉ');
                return;
            }

            // Prepare data for API (match backend SupplierModel)
            var supplierData = {
                tenNhaCungCap: vm.currentSupplier.name.trim(),
                sdt: vm.currentSupplier.phone.trim(),
                email: vm.currentSupplier.email ? vm.currentSupplier.email.trim() : null,
                diaChi: vm.currentSupplier.address.trim()
            };

            if (vm.currentSupplier.id) {
                // Update existing supplier
                ApiService.put('/admin/api/Suppliers/' + vm.currentSupplier.id, supplierData)
                    .then(function(response) {
                        NotificationService.success('Cập nhật nhà cung cấp thành công');
                        loadSuppliers();
                        closeSupplierModal();
                    })
                    .catch(function(error) {
                        console.error('Failed to update supplier:', error);
                        NotificationService.error('Không thể cập nhật nhà cung cấp');
                    });
            } else {
                // Add new supplier
                ApiService.post('/admin/api/Suppliers', supplierData)
                    .then(function(response) {
                        NotificationService.success('Thêm nhà cung cấp thành công');
                        loadSuppliers();
                        closeSupplierModal();
                    })
                    .catch(function(error) {
                        console.error('Failed to add supplier:', error);
                        NotificationService.error('Không thể thêm nhà cung cấp');
                    });
            }
        }

        function editSupplier(supplier) {
            openSupplierModal(supplier);
        }

        function deleteSupplier(supplierId) {
            if (!vm.canEdit) {
                NotificationService.error('⚠️ Bạn không có quyền thực hiện thao tác này!');
                return;
            }
            
            var supplier = vm.suppliers.find(function(s) { return s.id === supplierId; });
            var supplierName = supplier ? supplier.name : 'nhà cung cấp này';
            
            if (confirm('Bạn có chắc muốn xóa "' + supplierName + '"?\n\nThao tác này không thể hoàn tác!')) {
                ApiService.delete('/admin/api/Suppliers/' + supplierId)
                    .then(function(response) {
                        NotificationService.success('Đã xóa nhà cung cấp thành công');
                        loadSuppliers();
                    })
                    .catch(function(error) {
                        console.error('Failed to delete supplier:', error);
                        NotificationService.error('Không thể xóa nhà cung cấp. Có thể nhà cung cấp đang được sử dụng trong hóa đơn.');
                    });
            }
        }

        // ===== INVOICE FUNCTIONS =====
        function loadPurchases() {
            vm.isLoadingInvoices = true;
            
            // First, get list of invoices
            ApiService.get('/admin/api/Importedinvoice')
                .then(function(response) {
                    console.log('Invoices API response:', response);
                    var invoices = [];
                    
                    // Handle different response formats
                    if (Array.isArray(response)) {
                        invoices = response;
                    } else if (response.data && Array.isArray(response.data)) {
                        invoices = response.data;
                    } else if (response.success && response.data && Array.isArray(response.data)) {
                        invoices = response.data;
                    }
                    
                    console.log('Raw invoices:', invoices);
                    
                    // Map basic invoice info first
                    vm.purchases = invoices.map(function(invoice) {
                        console.log('Mapping single invoice:', invoice);
                        
                        var id = invoice.id || invoice.Id;
                        var supplierId = invoice.idNhaCungCap || invoice.IdNhaCungCap;
                        var supplierName = invoice.tenNhaCungCap || invoice.TenNhaCungCap;
                        
                        // If supplier name not in response, try to find from suppliers list
                        if (!supplierName && supplierId) {
                            var supplier = vm.suppliers.find(function(s) { return s.id == supplierId; });
                            supplierName = supplier ? supplier.name : 'N/A';
                        }
                        
                        var mapped = {
                            id: id,
                            invoiceCode: 'HD' + String(id).padStart(6, '0'),
                            date: invoice.ngayNhap || invoice.NgayNhap || new Date(),
                            supplierId: supplierId,
                            supplierName: supplierName || 'N/A',
                            totalAmount: invoice.tongTien || invoice.TongTien || 0,
                            employeeId: invoice.idNhanVien || invoice.IdNhanVien,
                            employeeName: invoice.tenNhanVien || invoice.TenNhanVien || 'N/A'
                        };
                        console.log('Mapped invoice:', mapped);
                        return mapped;
                    });
                    
                    console.log('Mapped invoices:', vm.purchases);
                })
                .catch(function(error) {
                    console.error('Failed to load invoices:', error);
                    NotificationService.error('Không thể tải danh sách hóa đơn nhập');
                    vm.purchases = [];
                })
                .finally(function() {
                    vm.isLoadingInvoices = false;
                });
        }

        function openPurchaseModal(purchase) {
            if (!vm.canEdit) {
                NotificationService.error('⚠️ Bạn không có quyền thực hiện thao tác này!');
                return;
            }
            
            if (purchase) {
                vm.currentPurchase = angular.copy(purchase);
                // Convert date string to Date object for input[type=date]
                if (vm.currentPurchase.date) {
                    vm.currentPurchase.date = new Date(vm.currentPurchase.date);
                }
                
                // Load chi tiết hóa đơn from API
                if (vm.currentPurchase.id) {
                    ApiService.get('/admin/api/Importedinvoice/' + vm.currentPurchase.id + '/details')
                        .then(function(response) {
                            console.log('Invoice details response:', response);
                            var details = response.data || response;
                            
                            // Map chi tiết
                            var items = details.chiTiet || details.ChiTiet || [];
                            if (!Array.isArray(items)) {
                                items = [];
                            }
                            
                            vm.currentPurchase.items = items.map(function(item) {
                                return {
                                    idNguyenLieu: item.idNguyenLieu || item.IdNguyenLieu || item.IDNguyenLieu,
                                    soLuong: item.soLuong || item.SoLuong || 0,
                                    donGia: item.donGia || item.DonGia || 0
                                };
                            });
                            
                            console.log('Loaded invoice items:', vm.currentPurchase.items);
                        })
                        .catch(function(error) {
                            console.error('Failed to load invoice details:', error);
                            vm.currentPurchase.items = [];
                        });
                } else {
                    vm.currentPurchase.items = [];
                }
            } else {
                // Generate invoice code based on next ID
                var nextId = vm.purchases.length > 0 ? Math.max.apply(Math, vm.purchases.map(function(p) { return p.id || 0; })) + 1 : 1;
                var invoiceCode = 'HD' + String(nextId).padStart(6, '0');
                
                vm.currentPurchase = {
                    invoiceCode: invoiceCode,
                    date: new Date(),
                    supplierId: null,
                    totalAmount: 0,
                    status: 'Hoàn thành',
                    note: '',
                    items: []
                };
            }
            
            // Initialize new item form
            vm.newItem = {
                materialId: null,
                quantity: 0,
                price: 0
            };
            
            vm.showPurchaseModal = true;
        }
        
        function addItemToInvoice() {
            if (!vm.newItem.materialId) {
                NotificationService.error('Vui lòng chọn nguyên liệu');
                return;
            }
            
            if (!vm.newItem.quantity || vm.newItem.quantity <= 0) {
                NotificationService.error('Vui lòng nhập số lượng hợp lệ');
                return;
            }
            
            if (!vm.newItem.price || vm.newItem.price <= 0) {
                NotificationService.error('Vui lòng nhập đơn giá hợp lệ');
                return;
            }
            
            // Check if material already exists in items
            var existingItem = vm.currentPurchase.items.find(function(item) {
                return item.idNguyenLieu == vm.newItem.materialId;
            });
            
            if (existingItem) {
                NotificationService.error('Nguyên liệu này đã có trong danh sách');
                return;
            }
            
            // Get material info to get unit
            var material = vm.materials.find(function(m) {
                return m.id == vm.newItem.materialId;
            });
            
            if (!material) {
                NotificationService.error('Không tìm thấy thông tin nguyên liệu');
                return;
            }
            
            // Add item to list with unit from material
            vm.currentPurchase.items.push({
                idNguyenLieu: parseInt(vm.newItem.materialId),
                soLuong: parseFloat(vm.newItem.quantity),
                donGia: parseFloat(vm.newItem.price),
                donViTinh: material.unit
            });
            
            // Update total amount
            updateTotalAmount();
            
            // Reset form
            vm.newItem = {
                materialId: null,
                quantity: 0,
                price: 0
            };
        }
        
        function calculateItemTotal() {
            // This function is called when quantity or price changes
            // It doesn't need to do anything because the total is shown in the table
            // But we keep it for potential future use
        }
        
        function removeItemFromInvoice(index) {
            vm.currentPurchase.items.splice(index, 1);
            updateTotalAmount();
        }
        
        function updateTotalAmount() {
            vm.currentPurchase.totalAmount = vm.currentPurchase.items.reduce(function(total, item) {
                return total + (item.soLuong * item.donGia);
            }, 0);
        }
        
        function getMaterialName(materialId) {
            var material = vm.materials.find(function(m) { return m.id == materialId; });
            return material ? material.name : 'N/A';
        }

        function closePurchaseModal() {
            vm.showPurchaseModal = false;
            vm.currentPurchase = null;
        }

        function savePurchase() {
            if (!vm.canEdit) {
                NotificationService.error('⚠️ Bạn không có quyền thực hiện thao tác này!');
                return;
            }
            
            console.log('=== SAVE PURCHASE CALLED ===');
            console.log('Current purchase object:', vm.currentPurchase);
            console.log('Items in purchase:', vm.currentPurchase.items);
            console.log('Items count:', vm.currentPurchase.items ? vm.currentPurchase.items.length : 0);
            
            // Validation
            if (!vm.currentPurchase.supplierId) {
                console.log('Validation failed: No supplier selected');
                NotificationService.error('Vui lòng chọn nhà cung cấp');
                return;
            }
            
            if (!vm.currentPurchase.items || vm.currentPurchase.items.length === 0) {
                console.log('Validation failed: No items in invoice');
                NotificationService.error('Phải có ít nhất 1 chi tiết hóa đơn. Vui lòng thêm nguyên liệu vào hóa đơn.');
                return;
            }
            
            // Recalculate total amount before validation
            updateTotalAmount();
            
            if (!vm.currentPurchase.totalAmount || vm.currentPurchase.totalAmount <= 0) {
                console.log('Validation failed: Invalid total amount');
                NotificationService.error('Tổng tiền phải lớn hơn 0');
                return;
            }

            console.log('All validations passed');
            
            // Get current user ID from localStorage
            var currentUser = null;
            try {
                var userStr = localStorage.getItem('currentUser');
                currentUser = userStr ? JSON.parse(userStr) : null;
            } catch (e) {
                console.error('Error getting current user:', e);
            }
            
            if (!currentUser || !currentUser.id) {
                console.log('Validation failed: No user logged in');
                NotificationService.error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
                return;
            }
            
            console.log('Current user:', currentUser);
            
            // Prepare data for API (match backend model exactly)
            var invoiceData = {
                idNhanVien: parseInt(currentUser.id),
                idNhaCungCap: parseInt(vm.currentPurchase.supplierId),
                ngayNhap: vm.currentPurchase.date || new Date().toISOString(),
                chiTiet: vm.currentPurchase.items.map(function(item) {
                    return {
                        idNguyenLieu: parseInt(item.idNguyenLieu),
                        soLuong: parseInt(item.soLuong),
                        donViTinh: item.donViTinh,
                        donGia: parseFloat(item.donGia)
                    };
                })
            };
            
            console.log('=== PREPARED INVOICE DATA ===');
            console.log('Invoice data to send:', JSON.stringify(invoiceData, null, 2));

            if (vm.currentPurchase.id) {
                // Update existing invoice
                ApiService.put('/admin/api/Importedinvoice/' + vm.currentPurchase.id, invoiceData)
                    .then(function(response) {
                        console.log('Update invoice response:', response);
                        NotificationService.success('Cập nhật hóa đơn thành công');
                        loadPurchases();
                        closePurchaseModal();
                    })
                    .catch(function(error) {
                        console.error('Failed to update invoice:', error);
                        console.error('Error details:', error.data || error.message);
                        NotificationService.error('Không thể cập nhật hóa đơn: ' + (error.data?.message || error.message || 'Lỗi không xác định'));
                    });
            } else {
                // Add new invoice
                console.log('=== CREATING NEW INVOICE ===');
                console.log('Invoice data being sent:', invoiceData);
                
                ApiService.post('/admin/api/Importedinvoice', invoiceData)
                    .then(function(response) {
                        console.log('=== CREATE INVOICE RESPONSE ===');
                        console.log('Full response:', response);
                        console.log('Response data:', response.data);
                        console.log('Response structure keys:', Object.keys(response.data || response));
                        
                        // Log the returned invoice object
                        var returnedInvoice = response.data || response;
                        console.log('Returned invoice object:', returnedInvoice);
                        console.log('Invoice fields:', {
                            id: returnedInvoice.id || returnedInvoice.Id,
                            maHoaDon: returnedInvoice.maHoaDon,
                            MaHoaDon: returnedInvoice.MaHoaDon,
                            invoiceCode: returnedInvoice.invoiceCode
                        });
                        
                        // Update material quantities manually
                        var updatePromises = vm.currentPurchase.items.map(function(item) {
                            return ApiService.get('/admin/api/Materials/' + item.idNguyenLieu)
                                .then(function(materialResponse) {
                                    var material = materialResponse.data || materialResponse;
                                    var currentQty = material.soLuongTon || material.SoLuongTon || 0;
                                    var newQty = currentQty + parseInt(item.soLuong);
                                    
                                    console.log('Updating material', item.idNguyenLieu, 'from', currentQty, 'to', newQty);
                                    
                                    return ApiService.put('/admin/api/Materials/' + item.idNguyenLieu, {
                                        tenNguyenLieu: material.tenNguyenLieu || material.TenNguyenLieu,
                                        donViTinh: material.donViTinh || material.DonViTinh,
                                        soLuongTon: newQty,
                                        donGia: material.donGia || material.DonGia || 0
                                    });
                                })
                                .catch(function(error) {
                                    console.error('Failed to update material quantity:', error);
                                });
                        });
                        
                        // Wait for all updates to complete
                        Promise.all(updatePromises).then(function() {
                            NotificationService.success('Thêm hóa đơn và cập nhật số lượng tồn thành công');
                            loadPurchases();
                            loadMaterials(); // Reload materials to show updated quantities
                            closePurchaseModal();
                        }).catch(function(error) {
                            NotificationService.warning('Đã thêm hóa đơn nhưng có lỗi khi cập nhật số lượng tồn');
                            loadPurchases();
                            loadMaterials();
                            closePurchaseModal();
                        });
                    })
                    .catch(function(error) {
                        console.error('Failed to add invoice:', error);
                        console.error('Error details:', error.data || error.message);
                        console.error('Validation errors:', error.data?.errors);
                        
                        var errorMessage = 'Không thể thêm hóa đơn';
                        if (error.data && error.data.errors) {
                            var errors = [];
                            for (var field in error.data.errors) {
                                errors.push(field + ': ' + error.data.errors[field].join(', '));
                            }
                            errorMessage += ':\n' + errors.join('\n');
                        }
                        NotificationService.error(errorMessage);
                    });
            }
        }

        function viewPurchaseDetails(invoice) {
            console.log('=== VIEW PURCHASE DETAILS ===');
            console.log('Invoice to view:', invoice);
            
            // Load full invoice with details from /{id} endpoint
            ApiService.get('/admin/api/Importedinvoice/' + invoice.id)
                .then(function(response) {
                    console.log('=== INVOICE DETAILS RESPONSE ===');
                    console.log('Full response:', response);
                    
                    var details = response.data || response;
                    console.log('Details object:', details);
                    console.log('Details keys:', Object.keys(details));
                    
                    // Map chi tiết
                    var items = details.chiTiet || details.ChiTiet || [];
                    console.log('Raw items array:', items);
                    
                    if (!Array.isArray(items)) {
                        console.log('Items is not an array, converting...');
                        items = [];
                    }
                    
                    var mappedItems = items.map(function(item) {
                        console.log('Mapping item:', item);
                        var mapped = {
                            idNguyenLieu: item.idNguyenLieu || item.IdNguyenLieu,
                            soLuong: item.soLuong || item.SoLuong || 0,
                            donGia: item.donGia || item.DonGia || 0,
                            donViTinh: item.donViTinh || item.DonViTinh || ''
                        };
                        console.log('Mapped item:', mapped);
                        return mapped;
                    });
                    
                    console.log('All mapped items:', mappedItems);
                    
                    // Get supplier info
                    var supplierId = details.idNhaCungCap || details.IdNhaCungCap;
                    var supplierName = details.tenNhaCungCap || details.TenNhaCungCap;
                    
                    if (!supplierName && supplierId) {
                        var supplier = vm.suppliers.find(function(s) { return s.id == supplierId; });
                        supplierName = supplier ? supplier.name : 'N/A';
                    }
                    
                    // Open modal with full invoice data
                    vm.currentPurchase = {
                        id: details.id || details.Id,
                        invoiceCode: 'HD' + String(details.id || details.Id).padStart(6, '0'),
                        date: new Date(details.ngayNhap || details.NgayNhap),
                        supplierId: supplierId,
                        supplierName: supplierName,
                        totalAmount: details.tongTien || details.TongTien || 0,
                        items: mappedItems
                    };
                    
                    vm.newItem = {
                        materialId: null,
                        quantity: 0,
                        price: 0
                    };
                    
                    vm.showPurchaseModal = true;
                    
                    console.log('=== OPENED PURCHASE MODAL ===');
                    console.log('Current purchase:', vm.currentPurchase);
                    console.log('Items count:', vm.currentPurchase.items.length);
                })
                .catch(function(error) {
                    console.error('Failed to load invoice details:', error);
                    NotificationService.error('Không thể tải chi tiết hóa đơn');
                });
        }
        
        function deletePurchase(invoiceId) {
            if (!vm.canEdit) {
                NotificationService.error('⚠️ Bạn không có quyền thực hiện thao tác này!');
                return;
            }
            
            var invoice = vm.purchases.find(function(p) { return p.id === invoiceId; });
            var invoiceCode = invoice ? invoice.invoiceCode : 'hóa đơn này';
            
            if (confirm('Bạn có chắc muốn xóa "' + invoiceCode + '"?\n\nThao tác này không thể hoàn tác!')) {
                ApiService.delete('/admin/api/Importedinvoice/' + invoiceId)
                    .then(function(response) {
                        NotificationService.success('Đã xóa hóa đơn thành công');
                        loadPurchases();
                    })
                    .catch(function(error) {
                        console.error('Failed to delete invoice:', error);
                        NotificationService.error('Không thể xóa hóa đơn');
                    });
            }
        }
    }
})();
