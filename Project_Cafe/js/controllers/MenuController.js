(function() {
    'use strict';

    angular.module('coffeeShopApp')
        .controller('MenuController', MenuController);

    MenuController.$inject = ['$scope', '$timeout', '$interval', 'ApiService', 'NotificationService', 'AuthService', 'ProductService'];

    function MenuController($scope, $timeout, $interval, ApiService, NotificationService, AuthService, ProductService) {
        var vm = this;

        // Properties
        vm.currentUser = AuthService.getCurrentUser();
        vm.products = [];
        vm.categories = [];
        vm.filteredProducts = [];
        vm.currentProduct = null;
        vm.isModalOpen = false;
        vm.isLoading = true;
        vm.searchTerm = '';
        vm.selectedCategory = 'all';
        vm.currentDateTime = '';
        vm.canEdit = AuthService.canEdit();
        vm.isManager = AuthService.isManager();

        // Methods
        vm.loadProducts = loadProducts;
        vm.loadCategories = loadCategories;
        vm.openProductModal = openProductModal;
        vm.closeProductModal = closeProductModal;
        vm.saveProduct = saveProduct;
        vm.editProduct = editProduct;
        vm.deleteProduct = deleteProduct;
        vm.onImageSelected = onImageSelected;
        vm.filterProducts = filterProducts;
        vm.formatCurrency = formatCurrency;
        vm.getProductImage = getProductImage;
        vm.toggleTheme = toggleTheme;
        vm.logout = logout;

        // Initialize
        activate();

        // ==================== FUNCTIONS ====================

        function activate() {
            updateDateTime();
            loadCategories();
            loadProducts();
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
         * Load all categories
         */
        function loadCategories() {
            ApiService.get('/admin/api/Product/danhmuc')
                .then(function(response) {
                    // Handle different response formats
                    if (Array.isArray(response)) {
                        vm.categories = response;
                    } else if (response.data && Array.isArray(response.data)) {
                        vm.categories = response.data;
                    }
                })
                .catch(function(error) {
                    console.error('Failed to load categories:', error);
                    NotificationService.error('Không thể tải danh mục');
                    vm.categories = [];
                });
        }

        /**
         * Load all products
         */
        function loadProducts() {
            vm.isLoading = true;
            
            ApiService.get('/admin/api/Product/monan')
                .then(function(response) {
                    
                    // Handle different response formats
                    var products = [];
                    if (Array.isArray(response)) {
                        products = response;
                    } else if (response.data && Array.isArray(response.data)) {
                        products = response.data;
                    }
                    
                    // Map backend structure to frontend
                    vm.products = products.map(function(product) {
                        // Get category ID from name if ID not available
                        var categoryId = product.idDanhmuc || product.IDDanhmuc;
                        var categoryName = product.tendanhmuc || product.TENDANHMUC || 'Chưa phân loại';
                        
                        // If no categoryId but have categoryName, find ID from categories list
                        if (!categoryId && categoryName) {
                            var foundCategory = vm.categories.find(function(cat) {
                                return (cat.tendanhmuc || cat.TENDANHMUC) === categoryName;
                            });
                            if (foundCategory) {
                                categoryId = foundCategory.idDanhmuc || foundCategory.IDDanhmuc;
                            }
                        }
                        
                        return {
                            id: product.idMonAn || product.IDMonAn,
                            name: product.tenmonan || product.TENMONAN,
                            price: product.giatien || product.GIATIEN,
                            categoryId: categoryId,
                            categoryName: categoryName,
                            imagePath: product.hinhAnh || product.hinhanh || product.HINHANH || null
                        };
                    });
                    
                    filterProducts();
                })
                .catch(function(error) {
                    console.error('Failed to load products:', error);
                    NotificationService.error('Không thể tải danh sách món ăn');
                    vm.products = [];
                })
                .finally(function() {
                    vm.isLoading = false;
                });
        }

        /**
         * Get category name by ID
         */
        function getCategoryName(categoryId) {
            var category = vm.categories.find(function(cat) {
                return (cat.idDanhmuc || cat.IDDanhmuc) === categoryId;
            });
            return category ? (category.tendanhmuc || category.TENDANHMUC) : 'Chưa phân loại';
        }

        /**
         * Filter products based on search and category
         */
        function filterProducts() {
            vm.filteredProducts = vm.products.filter(function(product) {
                var matchSearch = true;
                var matchCategory = true;
                
                // Search filter
                if (vm.searchTerm) {
                    var search = vm.searchTerm.toLowerCase();
                    matchSearch = product.name && product.name.toLowerCase().includes(search) ||
                                  product.categoryName && product.categoryName.toLowerCase().includes(search);
                }
                
                // Category filter
                if (vm.selectedCategory !== 'all' && vm.selectedCategory !== null && vm.selectedCategory !== undefined) {
                    // Ensure both values are numbers for comparison
                    var selectedCatId = parseInt(vm.selectedCategory);
                    var productCatId = parseInt(product.categoryId);
                    
                    // Only match if both are valid numbers
                    if (!isNaN(selectedCatId) && !isNaN(productCatId)) {
                        matchCategory = productCatId === selectedCatId;
                    } else {
                        matchCategory = false;
                    }
                }
                
                return matchSearch && matchCategory;
            });
        }

        /**
         * Open product modal for add/edit
         */
        function openProductModal(product) {
            if (!vm.canEdit) {
                NotificationService.error('⚠️ Bạn không có quyền thực hiện thao tác này!');
                return;
            }
            
            if (product) {
                // Edit mode
                vm.currentProduct = angular.copy(product);
            } else {
                // Add mode
                vm.currentProduct = {
                    id: null,
                    name: '',
                    price: 0,
                    categoryId: vm.categories.length > 0 ? (vm.categories[0].idDanhmuc || vm.categories[0].IDDanhmuc) : null,
                    image: ''
                };
            }
            vm.isModalOpen = true;
        }

        /**
         * Close product modal
         */
        function closeProductModal() {
            vm.isModalOpen = false;
            vm.currentProduct = null;
        }

        /**
         * Save product (create or update)
         */
        /**
         * Handle image file selection
         */
        function onImageSelected(file) {
            if (!file) return;
            
            // Validate file type
            var validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                NotificationService.error('Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                NotificationService.error('Kích thước ảnh không được vượt quá 5MB');
                return;
            }
            
            // Store file for later upload
            vm.currentProduct.imageFile = file;
            vm.currentProduct.imagePath = file.name;
            
            // Preview image
            var reader = new FileReader();
            reader.onload = function(e) {
                $scope.$apply(function() {
                    vm.currentProduct.imagePreview = e.target.result;
                });
            };
            reader.readAsDataURL(file);
            
            NotificationService.info('Đã chọn ảnh: ' + file.name);
        }

        function saveProduct() {
            if (!vm.canEdit) {
                NotificationService.error('⚠️ Bạn không có quyền thực hiện thao tác này!');
                return;
            }
            
            if (!vm.currentProduct.name || !vm.currentProduct.price || !vm.currentProduct.categoryId) {
                NotificationService.error('Vui lòng điền đầy đủ thông tin!');
                return;
            }

            // Prepare data for API
            var productData = {
                IDMonAn: vm.currentProduct.id,
                TENMONAN: vm.currentProduct.name,
                GIATIEN: parseFloat(vm.currentProduct.price),
                IDDanhmuc: parseInt(vm.currentProduct.categoryId)
            };

            if (vm.currentProduct.id) {
                // Update existing product
                ApiService.put('/admin/api/Product/monan', productData)
                    .then(function(response) {
                        NotificationService.success('Cập nhật món ăn thành công!');
                        closeProductModal();
                        loadProducts();
                    })
                    .catch(function(error) {
                        console.error('Failed to update product:', error);
                        var errorMsg = error.Message || error.message || 'Không thể cập nhật món ăn';
                        NotificationService.error(errorMsg);
                    });
            } else {
                // Create new product
                delete productData.IDMonAn; // Remove ID for new product
                
                ApiService.post('/admin/api/Product/monan', productData)
                    .then(function(response) {
                        NotificationService.success('Thêm món ăn thành công!');
                        closeProductModal();
                        loadProducts();
                    })
                    .catch(function(error) {
                        console.error('Failed to create product:', error);
                        var errorMsg = error.Message || error.message || 'Không thể thêm món ăn';
                        NotificationService.error(errorMsg);
                    });
            }
        }

        /**
         * Edit product
         */
        function editProduct(product) {
            openProductModal(product);
        }

        /**
         * Delete product
         */
        function deleteProduct(productId) {
            if (!vm.canEdit) {
                NotificationService.error('⚠️ Bạn không có quyền thực hiện thao tác này!');
                return;
            }
            
            if (!confirm('Bạn có chắc chắn muốn xóa món ăn này?')) {
                return;
            }

            ApiService.delete('/admin/api/Product/monan/' + productId)
                .then(function(response) {
                    NotificationService.success('Xóa món ăn thành công!');
                    loadProducts();
                })
                .catch(function(error) {
                    console.error('Failed to delete product:', error);
                    var errorMsg = error.Message || error.message || 'Không thể xóa món ăn';
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
         * Get product image URL
         */
        function getProductImage(imagePath) {
            return ProductService.getImageUrl(imagePath);
        }

        /**
         * Toggle theme (dark/light mode)
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
    }

})();

