(function() {
    'use strict';

    angular.module('coffeeShopApp')
        .service('ApiService', ApiService)
        .constant('API_CONFIG', {
            BASE_URL: 'http://localhost:5000', // Ocelot Gateway
            TIMEOUT: 30000
        });

    ApiService.$inject = ['$http', '$q', 'API_CONFIG', 'AuthService'];

    function ApiService($http, $q, API_CONFIG, AuthService) {
        var service = {
            get: get,
            post: post,
            put: put,
            patch: patch,
            delete: deleteRequest
        };

        return service;

        // ==================== FUNCTIONS ====================

        /**
         * GET request
         * @param {string} endpoint 
         * @param {Object} params 
         * @returns {Promise}
         */
        function get(endpoint, params) {
            return makeRequest('GET', endpoint, null, params);
        }

        /**
         * POST request
         * @param {string} endpoint 
         * @param {Object} data 
         * @returns {Promise}
         */
        function post(endpoint, data) {
            return makeRequest('POST', endpoint, data);
        }

        /**
         * PUT request
         * @param {string} endpoint 
         * @param {Object} data 
         * @returns {Promise}
         */
        function put(endpoint, data) {
            return makeRequest('PUT', endpoint, data);
        }

        /**
         * PATCH request
         * @param {string} endpoint 
         * @param {Object} data 
         * @returns {Promise}
         */
        function patch(endpoint, data) {
            return makeRequest('PATCH', endpoint, data);
        }

        /**
         * DELETE request
         * @param {string} endpoint 
         * @returns {Promise}
         */
        function deleteRequest(endpoint) {
            return makeRequest('DELETE', endpoint);
        }

        /**
         * Make HTTP request with common configuration
         * @param {string} method 
         * @param {string} endpoint 
         * @param {Object} data 
         * @param {Object} params 
         * @returns {Promise}
         */
        function makeRequest(method, endpoint, data, params) {
            var deferred = $q.defer();

            // Build full URL
            var url = API_CONFIG.BASE_URL + endpoint;

            // Prepare headers
            var headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };

            // Add auth token if available
            var token = AuthService.getToken();
            if (token) {
                headers['Authorization'] = 'Bearer ' + token;
            }

            // Configure request
            var config = {
                method: method,
                url: url,
                headers: headers,
                timeout: API_CONFIG.TIMEOUT
            };

            if (data) {
                config.data = data;
            }

            if (params) {
                config.params = params;
            }

            // Make request
            $http(config)
                .then(function(response) {
                    deferred.resolve(response.data);
                })
                .catch(function(error) {
                    var errorMessage = getErrorMessage(error);
                    console.error('API Error:', errorMessage, error);
                    deferred.reject(errorMessage);
                });

            return deferred.promise;
        }

        /**
         * Extract error message from response
         * @param {Object} error 
         * @returns {string}
         */
        function getErrorMessage(error) {
            if (error.data && error.data.message) {
                return error.data.message;
            }
            if (error.statusText) {
                return error.statusText;
            }
            if (error.status === -1) {
                return 'Không thể kết nối đến server';
            }
            if (error.status === 401) {
                return 'Phiên đăng nhập đã hết hạn';
            }
            if (error.status === 403) {
                return 'Bạn không có quyền truy cập';
            }
            if (error.status === 404) {
                return 'Không tìm thấy dữ liệu';
            }
            if (error.status === 500) {
                return 'Lỗi server';
            }
            return 'Đã xảy ra lỗi không xác định';
        }
    }

})();
