(function() {
    'use strict';

    angular.module('coffeeShopApp')
        .controller('ReportsController', ReportsController);

    ReportsController.$inject = ['$scope', '$timeout', 'AuthService', 'ApiService', 'NotificationService'];

    function ReportsController($scope, $timeout, AuthService, ApiService, NotificationService) {
        var vm = this;

        // Properties
        vm.currentUser = AuthService.getCurrentUser();
        vm.isLoading = false;
        vm.startDate = null;
        vm.endDate = null;
        vm.reportData = {
            totalRevenue: 0,
            totalOrders: 0,
            avgOrder: 0,
            totalProducts: 0,
            netRevenue: 0
        };
        vm.topProducts = [];

        // Methods
        vm.logout = logout;
        vm.toggleSidebar = toggleSidebar;
        vm.toggleTheme = toggleTheme;
        vm.generateReport = generateReport;
        vm.exportReport = exportReport;

        // Initialize
        activate();

        function activate() {
            setDefaultDates();
            generateReport();
        }

        function setDefaultDates() {
            var today = new Date();
            var firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            
            vm.startDate = firstDay;
            vm.endDate = today;
        }

        function logout() {
            AuthService.logout();
        }

        function toggleSidebar() {
            document.querySelector('.sidebar')?.classList.toggle('collapsed');
        }

        function toggleTheme() {
            var currentTheme = localStorage.getItem('theme') || 'light';
            var newTheme = currentTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            document.body.classList.toggle('dark-mode');
            NotificationService.info('Đã chuyển sang chế độ ' + (newTheme === 'dark' ? 'tối' : 'sáng'));
        }

        function generateReport() {
            console.log('🔥 generateReport() called');
            
            if (!vm.startDate || !vm.endDate) {
                NotificationService.error('Vui lòng chọn khoảng thời gian');
                return;
            }

            if (new Date(vm.startDate) > new Date(vm.endDate)) {
                NotificationService.error('Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
                return;
            }

            vm.isLoading = true;

            // Format dates for API
            var startDateStr = formatDateForAPI(vm.startDate);
            
            // ✅ Cộng thêm 1 ngày cho endDate để bao gồm cả ngày kết thúc
            var endDate = new Date(vm.endDate);
            endDate.setDate(endDate.getDate() + 1);
            var endDateStr = formatDateForAPI(endDate);

            console.log('🔥 Generating report from', startDateStr, 'to', endDateStr);
            console.log('🔥 Original endDate:', formatDateForAPI(vm.endDate), '→ Adjusted:', endDateStr);

            // Call API to get dashboard report data
            ApiService.get('/admin/api/Reports/dashboard', {
                tuNgay: startDateStr,
                denNgay: endDateStr
            })
            .then(function(response) {
                console.log('📊 ========== REPORT API RESPONSE ==========');
                console.log('📊 Full response:', response);
                console.log('📊 Response type:', typeof response);
                console.log('📊 Response.data:', response.data);
                console.log('📊 ==========================================');
                
                // API returns: { success, message, data }
                var apiData = response.data || response;
                var data = apiData.data || apiData;
                
                console.log('📊 Extracted data:', data);
                console.log('📊 tongDoanhThu:', data.tongDoanhThu);
                console.log('📊 TongDoanhThu:', data.TongDoanhThu);
                console.log('📊 tongSoDonHang:', data.tongSoDonHang);
                console.log('📊 TongSoDonHang:', data.TongSoDonHang);
                
                // Map from DashboardReportModel
                vm.reportData = {
                    totalRevenue: data.tongDoanhThu || data.TongDoanhThu || 0,
                    totalOrders: data.tongSoDonHang || data.TongSoDonHang || 0,
                    totalProducts: data.tongSoLuongBan || data.TongSoLuongBan || 0,
                    avgOrder: data.trungBinhDonHang || data.TrungBinhDonHang || 0,
                    netRevenue: data.tongDoanhThu || data.TongDoanhThu || 0
                };
                
                console.log('📊 Mapped reportData:', vm.reportData);
                console.log('📊 totalRevenue =', vm.reportData.totalRevenue);
                console.log('📊 totalOrders =', vm.reportData.totalOrders);
                console.log('📊 totalProducts =', vm.reportData.totalProducts);
                console.log('📊 avgOrder =', vm.reportData.avgOrder);
                
                console.log('📊 Top Products:', data.top5SanPhamBanChay, data.Top5SanPhamBanChay);
                
                // Map Top5SanPhamBanChay to topProducts
                var top5 = data.top5SanPhamBanChay || data.Top5SanPhamBanChay || [];
                vm.topProducts = top5.map(function(item) {
                    return {
                        name: item.tenMonAn || item.TenMonAn || '',
                        quantity: item.tongSoLuongBan || item.TongSoLuongBan || 0,
                        revenue: item.tongDoanhThu || item.TongDoanhThu || 0,
                        price: item.giaBan || item.GiaBan || 0
                    };
                });
                
                console.log('Mapped reportData:', vm.reportData);
                console.log('Mapped topProducts:', vm.topProducts);
                
                // Force Angular to update view using $timeout
                $timeout(function() {
                    console.log('📊 $timeout triggered - forcing digest');
                }, 0);
            })
            .catch(function(error) {
                console.error('Error generating report:', error);
                NotificationService.error('Không thể tạo báo cáo');
                
                // Set default values on error
                vm.reportData = {
                    totalRevenue: 0,
                    totalOrders: 0,
                    avgOrder: 0,
                    totalProducts: 0
                };
                vm.topProducts = [];
            })
            .finally(function() {
                vm.isLoading = false;
            });
        }

        function formatDateForAPI(date) {
            var d = new Date(date);
            var month = '' + (d.getMonth() + 1);
            var day = '' + d.getDate();
            var year = d.getFullYear();

            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;

            return [year, month, day].join('-');
        }

        function exportReport() {
            NotificationService.info('Chức năng xuất báo cáo đang được phát triển');
        }
        
        /**
         * Export report to different formats
         */
        function exportReport(format) {
            if (!vm.reportData || vm.reportData.totalOrders === 0) {
                NotificationService.error('Không có dữ liệu để xuất. Vui lòng tạo báo cáo trước!');
                return;
            }
            
            var filename = 'BaoCao_' + formatDateForAPI(vm.startDate) + '_' + formatDateForAPI(vm.endDate);
            
            switch(format) {
                case 'csv':
                    exportToCSV(filename);
                    break;
                case 'excel':
                    exportToExcel(filename);
                    break;
                case 'pdf':
                    exportToPDF(filename);
                    break;
                default:
                    NotificationService.error('Định dạng không hợp lệ');
            }
        }
        
        /**
         * Export to CSV
         */
        function exportToCSV(filename) {
            var csv = [];
            
            // Header
            csv.push('BÁO CÁO DOANH THU');
            csv.push('Từ ngày: ' + formatDateForAPI(vm.startDate) + ' đến ' + formatDateForAPI(vm.endDate));
            csv.push('');
            
            // Summary
            csv.push('TỔNG QUAN');
            csv.push('Tổng doanh thu,' + vm.reportData.totalRevenue);
            csv.push('Tổng đơn hàng,' + vm.reportData.totalOrders);
            csv.push('Tổng sản phẩm bán,' + vm.reportData.totalProducts);
            csv.push('Trung bình/đơn,' + vm.reportData.avgOrder);
            csv.push('');
            
            // Top Products
            csv.push('TOP 5 SẢN PHẨM BÁN CHẠY');
            csv.push('#,Sản phẩm,Đơn giá,Số lượng,Doanh thu');
            
            vm.topProducts.forEach(function(product, index) {
                csv.push([
                    index + 1,
                    product.name,
                    product.price,
                    product.quantity,
                    product.revenue
                ].join(','));
            });
            
            // Download
            var csvContent = '\uFEFF' + csv.join('\n'); // UTF-8 BOM
            var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            downloadFile(blob, filename + '.csv');
            
            NotificationService.success('Đã xuất báo cáo CSV');
        }
        
        /**
         * Export to Excel (HTML table trick)
         */
        function exportToExcel(filename) {
            var html = '<html xmlns:x="urn:schemas-microsoft-com:office:excel">';
            html += '<head><meta charset="UTF-8"><style>table {border-collapse: collapse;} td, th {border: 1px solid #ddd; padding: 8px;}</style></head>';
            html += '<body>';
            html += '<h2>BÁO CÁO DOANH THU</h2>';
            html += '<p>Từ ngày: ' + formatDateForAPI(vm.startDate) + ' đến ' + formatDateForAPI(vm.endDate) + '</p>';
            
            // Summary table
            html += '<h3>TỔNG QUAN</h3>';
            html += '<table>';
            html += '<tr><td><b>Tổng doanh thu</b></td><td>' + vm.reportData.totalRevenue.toLocaleString('vi-VN') + ' đ</td></tr>';
            html += '<tr><td><b>Tổng đơn hàng</b></td><td>' + vm.reportData.totalOrders + '</td></tr>';
            html += '<tr><td><b>Tổng sản phẩm bán</b></td><td>' + vm.reportData.totalProducts + '</td></tr>';
            html += '<tr><td><b>Trung bình/đơn</b></td><td>' + vm.reportData.avgOrder.toLocaleString('vi-VN') + ' đ</td></tr>';
            html += '</table>';
            
            // Top products table
            html += '<h3>TOP 5 SẢN PHẨM BÁN CHẠY</h3>';
            html += '<table>';
            html += '<tr><th>#</th><th>Sản phẩm</th><th>Đơn giá</th><th>Số lượng</th><th>Doanh thu</th></tr>';
            
            vm.topProducts.forEach(function(product, index) {
                html += '<tr>';
                html += '<td>' + (index + 1) + '</td>';
                html += '<td>' + product.name + '</td>';
                html += '<td>' + product.price.toLocaleString('vi-VN') + ' đ</td>';
                html += '<td>' + product.quantity + '</td>';
                html += '<td>' + product.revenue.toLocaleString('vi-VN') + ' đ</td>';
                html += '</tr>';
            });
            
            html += '</table>';
            html += '</body></html>';
            
            var blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
            downloadFile(blob, filename + '.xls');
            
            NotificationService.success('Đã xuất báo cáo Excel');
        }
        
        /**
         * Export to PDF (using browser print)
         */
        function exportToPDF(filename) {
            var printWindow = window.open('', '_blank');
            
            var html = '<html><head><title>Báo cáo doanh thu</title>';
            html += '<style>';
            html += 'body { font-family: Arial, sans-serif; padding: 20px; }';
            html += 'h2 { color: #2c3e50; }';
            html += 'table { width: 100%; border-collapse: collapse; margin: 20px 0; }';
            html += 'th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }';
            html += 'th { background: #3498db; color: white; }';
            html += '.summary { background: #ecf0f1; padding: 15px; border-radius: 8px; margin: 20px 0; }';
            html += '.summary-item { display: flex; justify-content: space-between; padding: 8px 0; }';
            html += '@media print { button { display: none; } }';
            html += '</style>';
            html += '</head><body>';
            
            html += '<h2>BÁO CÁO DOANH THU</h2>';
            html += '<p><b>Thời gian:</b> ' + formatDateForAPI(vm.startDate) + ' đến ' + formatDateForAPI(vm.endDate) + '</p>';
            html += '<p><b>Ngày xuất:</b> ' + new Date().toLocaleString('vi-VN') + '</p>';
            
            // Summary
            html += '<div class="summary">';
            html += '<h3>TỔNG QUAN</h3>';
            html += '<div class="summary-item"><span>Tổng doanh thu:</span><b>' + vm.reportData.totalRevenue.toLocaleString('vi-VN') + ' đ</b></div>';
            html += '<div class="summary-item"><span>Tổng đơn hàng:</span><b>' + vm.reportData.totalOrders + '</b></div>';
            html += '<div class="summary-item"><span>Tổng sản phẩm bán:</span><b>' + vm.reportData.totalProducts + '</b></div>';
            html += '<div class="summary-item"><span>Trung bình/đơn:</span><b>' + vm.reportData.avgOrder.toLocaleString('vi-VN') + ' đ</b></div>';
            html += '</div>';
            
            // Top products
            html += '<h3>TOP 5 SẢN PHẨM BÁN CHẠY</h3>';
            html += '<table>';
            html += '<tr><th>#</th><th>Sản phẩm</th><th>Đơn giá</th><th>Số lượng</th><th>Doanh thu</th></tr>';
            
            vm.topProducts.forEach(function(product, index) {
                html += '<tr>';
                html += '<td>' + (index + 1) + '</td>';
                html += '<td>' + product.name + '</td>';
                html += '<td>' + product.price.toLocaleString('vi-VN') + ' đ</td>';
                html += '<td>' + product.quantity + '</td>';
                html += '<td>' + product.revenue.toLocaleString('vi-VN') + ' đ</td>';
                html += '</tr>';
            });
            
            html += '</table>';
            html += '<button onclick="window.print()" style="padding: 12px 24px; background: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; margin-top: 20px;">In / Lưu PDF</button>';
            html += '</body></html>';
            
            printWindow.document.write(html);
            printWindow.document.close();
            
            NotificationService.success('Đã mở cửa sổ in. Chọn "Lưu dưới dạng PDF" để xuất file PDF');
        }
        
        /**
         * Download file helper
         */
        function downloadFile(blob, filename) {
            if (window.navigator.msSaveOrOpenBlob) {
                // IE support
                window.navigator.msSaveOrOpenBlob(blob, filename);
            } else {
                var link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }
})();
