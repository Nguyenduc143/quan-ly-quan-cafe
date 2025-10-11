// ===== REPORTS PAGE =====

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupEventListeners();
    initializeTheme();
    setDefaultDates();
    generateReport();
});

function checkAuth() {
    const currentUser = getLocalStorage('currentUser');
    if (!currentUser) {
        window.location.href = '../index.html';
        return;
    }
    document.getElementById('currentUser').textContent = currentUser.name;
}

function setupEventListeners() {
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        removeLocalStorage('currentUser');
        window.location.href = '../index.html';
    });
    
    document.getElementById('toggleSidebar')?.addEventListener('click', () => {
        document.querySelector('.sidebar')?.classList.toggle('active');
    });
    
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    document.getElementById('generateReportBtn')?.addEventListener('click', generateReport);
    document.getElementById('exportBtn')?.addEventListener('click', exportReport);
    document.getElementById('exportFormat')?.addEventListener('change', exportReport);
}

function setDefaultDates() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days
    
    document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
}

function generateReport() {
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);
    endDate.setHours(23, 59, 59, 999); // End of day
    
    if (startDate > endDate) {
        showNotification('Ngày bắt đầu phải nhỏ hơn ngày kết thúc!', 'error');
        return;
    }
    
    const orders = getLocalStorage('orders', []).filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= startDate && orderDate <= endDate;
    });
    
    calculateStatistics(orders);
    displayTopProducts(orders);
    displayOrdersByStatus(orders);
}

function calculateStatistics(orders) {
    // Include both 'completed' and 'paid' orders for revenue calculation
    const paidOrders = orders.filter(o => o.status === 'completed' || o.status === 'paid');
    
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = paidOrders.length;
    const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    let totalProductsSold = 0;
    paidOrders.forEach(order => {
        if (order.items) {
            totalProductsSold += order.items.reduce((sum, item) => sum + item.quantity, 0);
        }
    });
    
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('avgOrder').textContent = formatCurrency(avgOrder);
    document.getElementById('totalProducts').textContent = totalProductsSold;
}

function displayTopProducts(orders) {
    const productSales = {};
    
    orders.forEach(order => {
        if ((order.status === 'completed' || order.status === 'paid') && order.items) {
            order.items.forEach(item => {
                if (!productSales[item.name]) {
                    productSales[item.name] = { quantity: 0, revenue: 0 };
                }
                productSales[item.name].quantity += item.quantity;
                productSales[item.name].revenue += item.price * item.quantity;
            });
        }
    });
    
    const topProducts = Object.entries(productSales)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    
    const tbody = document.querySelector('#topProductsTable tbody');
    
    if (topProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Chưa có dữ liệu</td></tr>';
        return;
    }
    
    tbody.innerHTML = topProducts.map((product, index) => `
        <tr>
            <td><strong>#${index + 1}</strong></td>
            <td>${product.name}</td>
            <td><span class="badge badge-primary">${product.quantity}</span></td>
            <td><strong>${formatCurrency(product.revenue)}</strong></td>
        </tr>
    `).join('');
}

function displayOrdersByStatus(orders) {
    const statusCount = {
        pending: 0,
        processing: 0,
        completed: 0,
        paid: 0,
        cancelled: 0
    };
    
    orders.forEach(order => {
        if (statusCount.hasOwnProperty(order.status)) {
            statusCount[order.status]++;
        }
    });
    
    const container = document.getElementById('ordersByStatus');
    
    const statusData = [
        { status: 'paid', label: 'Đã thanh toán', count: statusCount.paid, color: '#8B4513' },
        { status: 'completed', label: 'Hoàn thành', count: statusCount.completed, color: '#28a745' },
        { status: 'processing', label: 'Đang pha chế', count: statusCount.processing, color: '#17a2b8' },
        { status: 'pending', label: 'Chờ xử lý', count: statusCount.pending, color: '#ffc107' },
        { status: 'cancelled', label: 'Đã hủy', count: statusCount.cancelled, color: '#dc3545' }
    ];
    
    const total = Object.values(statusCount).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) {
        container.innerHTML = '<p class="text-center" style="padding: 2rem; color: var(--text-secondary);">Chưa có dữ liệu đơn hàng</p>';
        return;
    }
    
    container.innerHTML = statusData.map(item => {
        const percentage = total > 0 ? (item.count / total * 100).toFixed(1) : 0;
        return `
            <div style="margin-bottom: 1.5rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span><strong>${item.label}</strong></span>
                    <span><strong>${item.count}</strong> đơn (${percentage}%)</span>
                </div>
                <div style="height: 30px; background-color: var(--bg-color); border-radius: 15px; overflow: hidden;">
                    <div style="height: 100%; width: ${percentage}%; background-color: ${item.color}; transition: width 0.3s ease; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                        ${percentage > 10 ? percentage + '%' : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function exportReport() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const exportFormat = document.getElementById('exportFormat').value;
    
    const orders = getLocalStorage('orders', []).filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
    });
    
    if (orders.length === 0) {
        showNotification('Không có dữ liệu để xuất!', 'warning');
        return;
    }
    
    if (exportFormat === 'csv') {
        // Create CSV content
        let csv = 'Mã đơn,Ngày,Trạng thái,Tổng tiền\n';
        orders.forEach(order => {
            csv += `${order.id},${formatDate(order.date)},${getStatusText(order.status)},${order.total}\n`;
        });
        
        // Download CSV
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `bao-cao-${startDate}-${endDate}.csv`;
        link.click();
    } else if (exportFormat === 'excel') {
        // Create Excel content
        const worksheetData = [
            ['Mã đơn', 'Ngày', 'Trạng thái', 'Tổng tiền'],
            ...orders.map(order => [
                order.id,
                formatDate(order.date),
                getStatusText(order.status),
                order.total
            ])
        ];
        
        const ws = XLSX.utils.aoa_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo');
        
        // Download Excel
        XLSX.writeFile(wb, `bao-cao-${startDate}-${endDate}.xlsx`);
    } else if (exportFormat === 'pdf') {
        // Create PDF with proper Vietnamese font support using html2canvas
        exportToPDF(orders, startDate, endDate);
    }
    
    showNotification(`Đã xuất báo cáo thành công dưới dạng ${exportFormat.toUpperCase()}!`, 'success');
}

// Export to PDF with Vietnamese font support
async function exportToPDF(orders, startDate, endDate) {
    try {
        // Show loading notification
        showNotification('Đang tạo file PDF...', 'info', 3000);
        
        // Create a temporary container for PDF content
        const pdfContainer = document.createElement('div');
        pdfContainer.style.position = 'absolute';
        pdfContainer.style.left = '-9999px';
        pdfContainer.style.top = '0';
        pdfContainer.style.width = '800px';
        pdfContainer.style.backgroundColor = 'white';
        pdfContainer.style.padding = '40px';
        pdfContainer.style.fontFamily = 'Arial, sans-serif';
        
        // Build PDF content HTML
        pdfContainer.innerHTML = `
            <div style="margin-bottom: 30px;">
                <h1 style="color: #8B4513; margin: 0 0 10px 0; font-size: 24px;">Báo Cáo Doanh Thu</h1>
                <p style="margin: 5px 0; font-size: 14px; color: #666;">Từ ngày: <strong>${startDate}</strong></p>
                <p style="margin: 5px 0; font-size: 14px; color: #666;">Đến ngày: <strong>${endDate}</strong></p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                    <tr style="background-color: #8B4513; color: white;">
                        <th style="padding: 12px 8px; text-align: left; border: 1px solid #ddd;">Mã đơn</th>
                        <th style="padding: 12px 8px; text-align: left; border: 1px solid #ddd;">Ngày</th>
                        <th style="padding: 12px 8px; text-align: left; border: 1px solid #ddd;">Trạng thái</th>
                        <th style="padding: 12px 8px; text-align: right; border: 1px solid #ddd;">Tổng tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map((order, index) => `
                        <tr style="background-color: ${index % 2 === 0 ? '#f9f9f9' : 'white'};">
                            <td style="padding: 10px 8px; border: 1px solid #ddd;">${order.id}</td>
                            <td style="padding: 10px 8px; border: 1px solid #ddd;">${formatDate(order.date)}</td>
                            <td style="padding: 10px 8px; border: 1px solid #ddd;">${getStatusText(order.status)}</td>
                            <td style="padding: 10px 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(order.total)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd;">
                <p style="font-size: 14px; color: #666; margin: 5px 0;">
                    <strong>Tổng số đơn hàng:</strong> ${orders.length}
                </p>
                <p style="font-size: 14px; color: #666; margin: 5px 0;">
                    <strong>Tổng doanh thu:</strong> ${formatCurrency(orders.filter(o => o.status === 'completed' || o.status === 'paid').reduce((sum, o) => sum + o.total, 0))}
                </p>
            </div>
        `;
        
        document.body.appendChild(pdfContainer);
        
        // Convert to canvas using html2canvas
        const canvas = await html2canvas(pdfContainer, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        // Remove temporary container
        document.body.removeChild(pdfContainer);
        
        // Create PDF from canvas
        const { jsPDF } = window.jspdf;
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        // Download PDF
        pdf.save(`bao-cao-${startDate}-${endDate}.pdf`);
        
        showNotification('Đã xuất PDF thành công!', 'success');
    } catch (error) {
        console.error('Error generating PDF:', error);
        showNotification('Lỗi khi tạo PDF. Vui lòng thử lại!', 'error');
    }
}

function getStatusText(status) {
    const texts = {
        pending: 'Chờ xử lý',
        processing: 'Đang pha chế',
        completed: 'Hoàn thành',
        paid: 'Đã thanh toán',
        cancelled: 'Đã hủy'
    };
    return texts[status] || status;
}

function initializeTheme() {
    const theme = getLocalStorage('theme', 'light');
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    setLocalStorage('theme', newTheme);
    updateThemeIcon(newTheme);
    showNotification(`Đã chuyển sang chế độ ${newTheme === 'light' ? 'sáng' : 'tối'}`, 'info', 2000);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#themeToggle i');
    if (icon) icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}