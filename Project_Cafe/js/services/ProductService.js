(function() {
    'use strict';

    angular.module('coffeeShopApp')
        .service('ProductService', ProductService);

    ProductService.$inject = ['ApiService', '$q'];

    function ProductService(ApiService, $q) {
        var service = {
            getAll: getAll,
            getById: getById,
            getByCategory: getByCategory,
            create: create,
            update: update,
            deleteProduct: deleteProduct,
            getImageUrl: getImageUrl,
            getAllCategories: getAllCategories
        };

        return service;

        // ==================== FUNCTIONS ====================

        /**
         * Get all products
         * @returns {Promise}
         */
        function getAll() {
            return ApiService.get('/admin/api/Product/monan');
        }

        /**
         * Get product by ID
         * @param {number} id 
         * @returns {Promise}
         */
        function getById(id) {
            return ApiService.get('/admin/api/Product/monan/' + id);
        }

        /**
         * Get products by category
         * @param {number} categoryId 
         * @returns {Promise}
         */
        function getByCategory(categoryId) {
            var deferred = $q.defer();

            // Gọi API lấy tất cả sản phẩm
            getAll()
                .then(function(response) {
                    if (!categoryId || categoryId === 'all') {
                        // Trả về tất cả nếu không có filter
                        deferred.resolve(response);
                    } else {
                        // Filter theo danh mục
                        var filtered = response.filter(function(product) {
                            return product.idDanhMuc === parseInt(categoryId);
                        });
                        deferred.resolve(filtered);
                    }
                })
                .catch(function(error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        }

        /**
         * Create new product
         * @param {Object} product 
         * @param {File} imageFile 
         * @returns {Promise}
         */
        function create(product, imageFile) {
            var formData = new FormData();
            formData.append('tenMonAn', product.tenMonAn);
            formData.append('idDanhMuc', product.idDanhMuc);
            formData.append('giaTien', product.giaTien);
            formData.append('moTa', product.moTa || '');
            
            if (imageFile) {
                formData.append('hinhAnh', imageFile);
            }

            // Gửi FormData với header đặc biệt
            return ApiService.post('/admin/api/Product/monan', formData, {
                headers: { 
                    'Content-Type': undefined 
                },
                transformRequest: angular.identity
            });
        }

        /**
         * Update product
         * @param {number} id 
         * @param {Object} product 
         * @param {File} imageFile 
         * @returns {Promise}
         */
        function update(id, product, imageFile) {
            var formData = new FormData();
            formData.append('tenMonAn', product.tenMonAn);
            formData.append('idDanhMuc', product.idDanhMuc);
            formData.append('giaTien', product.giaTien);
            formData.append('moTa', product.moTa || '');
            
            if (imageFile) {
                formData.append('hinhAnh', imageFile);
            }

            return ApiService.put('/admin/api/Product/monan/' + id, formData, {
                headers: { 
                    'Content-Type': undefined 
                },
                transformRequest: angular.identity
            });
        }

        /**
         * Delete product
         * @param {number} id 
         * @returns {Promise}
         */
        function deleteProduct(id) {
            return ApiService.delete('/admin/api/Product/monan/' + id);
        }

        /**
         * Get all categories
         * @returns {Promise}
         */
        function getAllCategories() {
            return ApiService.get('/admin/api/DanhMucMonAn');
        }

        /**
         * Get image URL with fallback
         * @param {string} imagePath 
         * @returns {string}
         */
        function getImageUrl(imagePath) {
            if (!imagePath) {
                return 'assets/images/cafenguyenchat.jpg'; // Dùng ảnh có sẵn làm default
            }
            
            // Nếu đã là URL đầy đủ (http/https)
            if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
                return imagePath;
            }
            
            // Nếu đã có đường dẫn đầy đủ (bắt đầu với assets/)
            if (imagePath.startsWith('assets/')) {
                return imagePath;
            }
            
            // Nếu chỉ là tên file (VD: coffee.jpg)
            // Tự động thêm prefix assets/images/
            return 'assets/images/' + imagePath;
        }
    }

})();
