// ===== TABLES PAGE =====

let currentEditingTableId = null;

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    initializeDefaultTables();
    setupEventListeners();
    initializeTheme();
    renderTables();
    updateStats();
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
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            removeLocalStorage('currentUser');
            window.location.href = '../index.html';
        });
    }
    
    const toggleSidebar = document.getElementById('toggleSidebar');
    if (toggleSidebar) {
        toggleSidebar.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) sidebar.classList.toggle('active');
        });
    }
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    
    const addTableBtn = document.getElementById('addTableBtn');
    console.log('addTableBtn:', addTableBtn);
    if (addTableBtn) {
        addTableBtn.addEventListener('click', openAddTableModal);
        console.log('Event listener added to addTableBtn');
    } else {
        console.error('addTableBtn not found!');
    }
    
    const closeModal = document.getElementById('closeModal');
    if (closeModal) closeModal.addEventListener('click', closeTableModal);
    
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', closeTableModal);
    
    const closeDetailModalBtn = document.getElementById('closeDetailModal');
    if (closeDetailModalBtn) closeDetailModalBtn.addEventListener('click', closeDetailModal);
    
    const tableForm = document.getElementById('tableForm');
    if (tableForm) tableForm.addEventListener('submit', handleTableFormSubmit);
    
    const areaFilter = document.getElementById('areaFilter');
    if (areaFilter) areaFilter.addEventListener('change', renderTables);
    
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) statusFilter.addEventListener('change', renderTables);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.id === 'tableModal') closeTableModal();
        if (e.target.id === 'tableDetailModal') closeDetailModal();
    });
}

// Initialize default tables if none exist
function initializeDefaultTables() {
    const tables = getLocalStorage('tables', []);
    if (tables.length === 0) {
        const defaultTables = [
            { id: 'T001', name: 'Bàn 1', capacity: 2, area: 'indoor', status: 'available', note: '', createdAt: new Date().toISOString() },
            { id: 'T002', name: 'Bàn 2', capacity: 4, area: 'indoor', status: 'available', note: '', createdAt: new Date().toISOString() },
            { id: 'T003', name: 'Bàn 3', capacity: 4, area: 'indoor', status: 'available', note: '', createdAt: new Date().toISOString() },
            { id: 'T004', name: 'Bàn 4', capacity: 6, area: 'outdoor', status: 'available', note: '', createdAt: new Date().toISOString() },
            { id: 'T005', name: 'Bàn 5', capacity: 6, area: 'outdoor', status: 'available', note: '', createdAt: new Date().toISOString() },
            { id: 'T006', name: 'Bàn VIP 1', capacity: 8, area: 'vip', status: 'available', note: '', createdAt: new Date().toISOString() },
            { id: 'T007', name: 'Bàn VIP 2', capacity: 10, area: 'vip', status: 'available', note: '', createdAt: new Date().toISOString() },
        ];
        setLocalStorage('tables', defaultTables);
    }
}

// Render tables
function renderTables() {
    const tables = getLocalStorage('tables', []);
    const areaFilter = document.getElementById('areaFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    const filteredTables = tables.filter(table => {
        const matchArea = areaFilter === 'all' || table.area === areaFilter;
        const matchStatus = statusFilter === 'all' || table.status === statusFilter;
        return matchArea && matchStatus;
    });
    
    const tablesGrid = document.getElementById('tablesGrid');
    
    if (filteredTables.length === 0) {
        tablesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-table"></i>
                <p>Không tìm thấy bàn nào</p>
            </div>
        `;
        return;
    }
    
    tablesGrid.innerHTML = filteredTables.map(table => createTableCard(table)).join('');
    
    // Add click events to table cards
    filteredTables.forEach(table => {
        const card = document.getElementById(`table-${table.id}`);
        card?.addEventListener('click', () => openTableDetail(table.id));
    });
    
    updateStats();
}

// Create table card HTML
function createTableCard(table) {
    const statusConfig = {
        available: { class: 'available', icon: 'check-circle', label: 'Trống' },
        occupied: { class: 'occupied', icon: 'users', label: 'Đang phục vụ' },
        reserved: { class: 'reserved', icon: 'clock', label: 'Đã đặt' }
    };
    
    const areaLabels = {
        indoor: 'Trong nhà',
        outdoor: 'Ngoài trời',
        vip: 'VIP'
    };
    
    const config = statusConfig[table.status] || statusConfig.available;
    
    return `
        <div class="table-card ${config.class}" id="table-${table.id}" data-table-id="${table.id}">
            <div class="table-card-header">
                <h3>${table.name}</h3>
                <span class="table-status-badge ${config.class}">
                    <i class="fas fa-${config.icon}"></i> ${config.label}
                </span>
            </div>
            <div class="table-card-body">
                <div class="table-info-item">
                    <i class="fas fa-chair"></i>
                    <span>${table.capacity} chỗ</span>
                </div>
                <div class="table-info-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${areaLabels[table.area]}</span>
                </div>
                ${table.currentOrder ? `
                    <div class="table-info-item">
                        <i class="fas fa-receipt"></i>
                        <span>Đơn: ${table.currentOrder}</span>
                    </div>
                ` : ''}
                ${table.note ? `
                    <div class="table-info-item">
                        <i class="fas fa-sticky-note"></i>
                        <span>${table.note}</span>
                    </div>
                ` : ''}
            </div>
            <div class="table-card-footer">
                <button class="btn-table-action" onclick="event.stopPropagation(); changeTableStatus('${table.id}')">
                    <i class="fas fa-sync-alt"></i> Đổi trạng thái
                </button>
            </div>
        </div>
    `;
}

// Update statistics
function updateStats() {
    const tables = getLocalStorage('tables', []);
    
    const stats = {
        available: tables.filter(t => t.status === 'available').length,
        occupied: tables.filter(t => t.status === 'occupied').length,
        reserved: tables.filter(t => t.status === 'reserved').length,
        total: tables.length
    };
    
    document.getElementById('availableTables').textContent = stats.available;
    document.getElementById('occupiedTables').textContent = stats.occupied;
    document.getElementById('reservedTables').textContent = stats.reserved;
    document.getElementById('totalTables').textContent = stats.total;
}

// Open table detail modal
function openTableDetail(tableId) {
    const tables = getLocalStorage('tables', []);
    const table = tables.find(t => t.id === tableId);
    
    if (!table) return;
    
    const statusConfig = {
        available: { class: 'success', icon: 'check-circle', label: 'Trống' },
        occupied: { class: 'danger', icon: 'users', label: 'Đang phục vụ' },
        reserved: { class: 'warning', icon: 'clock', label: 'Đã đặt' }
    };
    
    const areaLabels = {
        indoor: 'Trong nhà',
        outdoor: 'Ngoài trời',
        vip: 'VIP'
    };
    
    const config = statusConfig[table.status] || statusConfig.available;
    
    document.getElementById('detailModalTitle').innerHTML = `
        <i class="fas fa-table"></i> ${table.name}
    `;
    
    const content = `
        <div class="table-detail-content">
            <div class="detail-section">
                <h4>Thông tin cơ bản</h4>
                <div class="detail-row">
                    <span class="detail-label">Trạng thái:</span>
                    <span class="badge badge-${config.class}">
                        <i class="fas fa-${config.icon}"></i> ${config.label}
                    </span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Số chỗ ngồi:</span>
                    <span>${table.capacity} người</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Khu vực:</span>
                    <span>${areaLabels[table.area]}</span>
                </div>
                ${table.note ? `
                    <div class="detail-row">
                        <span class="detail-label">Ghi chú:</span>
                        <span>${table.note}</span>
                    </div>
                ` : ''}
            </div>
            
            ${table.currentOrder ? `
                <div class="detail-section">
                    <h4>Đơn hàng hiện tại</h4>
                    <div class="detail-row">
                        <span class="detail-label">Mã đơn:</span>
                        <span>${table.currentOrder}</span>
                    </div>
                    <button class="btn btn-info btn-block" onclick="viewOrder('${table.currentOrder}')">
                        <i class="fas fa-eye"></i> Xem chi tiết đơn hàng
                    </button>
                    <button class="btn btn-primary btn-block" onclick="addMoreItems('${table.id}', '${table.currentOrder}')">
                        <i class="fas fa-plus"></i> Thêm món
                    </button>
                </div>
            ` : ''}
            
            <div class="detail-actions">
                ${table.status === 'available' ? `
                    <button class="btn btn-success btn-block" onclick="createOrderForTable('${table.id}')">
                        <i class="fas fa-plus-circle"></i> Tạo đơn hàng
                    </button>
                    <button class="btn btn-warning btn-block" onclick="reserveTable('${table.id}')">
                        <i class="fas fa-clock"></i> Đặt bàn
                    </button>
                ` : ''}
                
                ${table.status === 'occupied' ? `
                    <button class="btn btn-success btn-block" onclick="completeTable('${table.id}')">
                        <i class="fas fa-money-bill-wave"></i> Thanh toán
                    </button>
                ` : ''}
                
                ${table.status === 'reserved' ? `
                    <button class="btn btn-primary btn-block" onclick="startService('${table.id}')">
                        <i class="fas fa-play"></i> Bắt đầu phục vụ
                    </button>
                    <button class="btn btn-secondary btn-block" onclick="cancelReservation('${table.id}')">
                        <i class="fas fa-times"></i> Hủy đặt bàn
                    </button>
                ` : ''}
                
                <button class="btn btn-primary btn-block" onclick="editTable('${table.id}')">
                    <i class="fas fa-edit"></i> Chỉnh sửa bàn
                </button>
                <button class="btn btn-danger btn-block" onclick="deleteTable('${table.id}')">
                    <i class="fas fa-trash"></i> Xóa bàn
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('tableDetailContent').innerHTML = content;
    const modal = document.getElementById('tableDetailModal');
    modal.style.display = 'flex';
    modal.classList.add('show');
}

// Change table status (Quick action)
function changeTableStatus(tableId) {
    const tables = getLocalStorage('tables', []);
    const tableIndex = tables.findIndex(t => t.id === tableId);
    
    if (tableIndex === -1) return;
    
    const statusCycle = ['available', 'reserved', 'occupied'];
    const currentStatusIndex = statusCycle.indexOf(tables[tableIndex].status);
    const nextStatus = statusCycle[(currentStatusIndex + 1) % statusCycle.length];
    
    tables[tableIndex].status = nextStatus;
    setLocalStorage('tables', tables);
    
    renderTables();
    
    const statusLabels = {
        available: 'Trống',
        occupied: 'Đang phục vụ',
        reserved: 'Đã đặt'
    };
    
    showNotification(`Đã đổi trạng thái bàn thành: ${statusLabels[nextStatus]}`, 'success');
}

// Create order for table
function createOrderForTable(tableId) {
    const tables = getLocalStorage('tables', []);
    const tableIndex = tables.findIndex(t => t.id === tableId);
    
    if (tableIndex === -1) return;
    
    // Check if table is already occupied
    if (tables[tableIndex].status === 'occupied') {
        showNotification('Bàn này đang phục vụ! Vui lòng dùng chức năng "Thêm món" để thêm món vào đơn hàng hiện tại.', 'error');
        return;
    }
    
    // Generate order ID
    const orderId = 'ORD' + Date.now().toString().slice(-8);
    
    // Update table status
    tables[tableIndex].status = 'occupied';
    tables[tableIndex].currentOrder = orderId;
    setLocalStorage('tables', tables);
    
    // Create new order
    const orders = getLocalStorage('orders', []);
    const newOrder = {
        id: orderId,
        tableId: tableId,
        tableName: tables[tableIndex].name,
        items: [],
        total: 0,
        status: 'pending',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
    };
    orders.push(newOrder);
    setLocalStorage('orders', orders);
    
    closeDetailModal();
    showNotification(`Đã tạo đơn hàng ${orderId} cho ${tables[tableIndex].name}`, 'success');
    
    // Redirect to orders page
    setTimeout(() => {
        window.location.href = 'orders.html';
    }, 1000);
}

// Add more items to existing order
function addMoreItems(tableId, orderId) {
    // Store table and order info in sessionStorage
    setLocalStorage('addMoreItemsTable', { tableId, orderId });
    
    // Redirect to orders page to add items
    window.location.href = `orders.html?addItems=${orderId}`;
}

// Reserve table
function reserveTable(tableId) {
    const tables = getLocalStorage('tables', []);
    const tableIndex = tables.findIndex(t => t.id === tableId);
    
    if (tableIndex === -1) return;
    
    tables[tableIndex].status = 'reserved';
    setLocalStorage('tables', tables);
    
    closeDetailModal();
    renderTables();
    showNotification(`Đã đặt bàn ${tables[tableIndex].name}`, 'success');
}

// Start service for reserved table
function startService(tableId) {
    const tables = getLocalStorage('tables', []);
    const tableIndex = tables.findIndex(t => t.id === tableId);
    
    if (tableIndex === -1) return;
    
    tables[tableIndex].status = 'occupied';
    setLocalStorage('tables', tables);
    
    closeDetailModal();
    renderTables();
    showNotification(`Đã bắt đầu phục vụ ${tables[tableIndex].name}. Click vào bàn để tạo đơn hàng.`, 'success', 4000);
}

// Cancel reservation
function cancelReservation(tableId) {
    const tables = getLocalStorage('tables', []);
    const tableIndex = tables.findIndex(t => t.id === tableId);
    
    if (tableIndex === -1) return;
    
    tables[tableIndex].status = 'available';
    setLocalStorage('tables', tables);
    
    closeDetailModal();
    renderTables();
    showNotification(`Đã hủy đặt bàn ${tables[tableIndex].name}`, 'success');
}

// Complete service and payment
function completeTable(tableId) {
    const tables = getLocalStorage('tables', []);
    const tableIndex = tables.findIndex(t => t.id === tableId);
    
    if (tableIndex === -1) return;
    
    const table = tables[tableIndex];
    
    // Check if there's an order
    if (!table.currentOrder) {
        showNotification('Bàn này không có đơn hàng!', 'error');
        return;
    }
    
    const orders = getLocalStorage('orders', []);
    const orderIndex = orders.findIndex(o => o.id === table.currentOrder);
    
    if (orderIndex === -1) {
        showNotification('Không tìm thấy đơn hàng!', 'error');
        return;
    }
    
    const order = orders[orderIndex];
    
    // Confirm payment
    if (!confirm(`Xác nhận thanh toán cho bàn ${table.name}?\nTổng tiền: ${formatCurrency(order.total)}`)) {
        return;
    }
    
    // Update order status to paid
    orders[orderIndex].status = 'paid';
    orders[orderIndex].paidAt = new Date().toISOString();
    setLocalStorage('orders', orders);
    
    // Reset table to available
    tables[tableIndex].status = 'available';
    tables[tableIndex].currentOrder = null;
    setLocalStorage('tables', tables);
    
    closeDetailModal();
    renderTables();
    showNotification(`Thanh toán thành công! Bàn ${table.name} đã trống.`, 'success', 4000);
}

// View order
function viewOrder(orderId) {
    window.location.href = `orders.html?orderId=${orderId}`;
}

// Modal functions
window.openAddTableModal = function() {
    console.log('openAddTableModal called');
    currentEditingTableId = null;
    const modal = document.getElementById('tableModal');
    console.log('Modal element:', modal);
    
    if (!modal) {
        console.error('Modal not found!');
        alert('Không tìm thấy modal!');
        return;
    }
    
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) {
        modalTitle.innerHTML = '<i class="fas fa-plus"></i> Thêm bàn mới';
    }
    
    const tableForm = document.getElementById('tableForm');
    if (tableForm) {
        tableForm.reset();
    }
    
    modal.style.display = 'flex';
    modal.classList.add('show');
    console.log('Modal display:', modal.style.display);
    console.log('Modal classList:', modal.classList);
    console.log('Modal should be visible now');
}

window.closeTableModal = function() {
    const modal = document.getElementById('tableModal');
    modal.style.display = 'none';
    modal.classList.remove('show');
    currentEditingTableId = null;
}

window.closeDetailModal = function() {
    const modal = document.getElementById('tableDetailModal');
    modal.style.display = 'none';
    modal.classList.remove('show');
}

// Edit table
function editTable(tableId) {
    const tables = getLocalStorage('tables', []);
    const table = tables.find(t => t.id === tableId);
    
    if (!table) return;
    
    currentEditingTableId = tableId;
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Chỉnh sửa bàn';
    document.getElementById('tableName').value = table.name;
    document.getElementById('tableCapacity').value = table.capacity;
    document.getElementById('tableArea').value = table.area;
    document.getElementById('tableNote').value = table.note || '';
    
    closeDetailModal();
    const modal = document.getElementById('tableModal');
    modal.style.display = 'flex';
    modal.classList.add('show');
}

// Delete table
function deleteTable(tableId) {
    const tables = getLocalStorage('tables', []);
    const table = tables.find(t => t.id === tableId);
    
    if (!table) return;
    
    if (table.status === 'occupied') {
        showNotification('Không thể xóa bàn đang có khách!', 'error');
        return;
    }
    
    if (!confirm(`Bạn có chắc muốn xóa ${table.name}?`)) return;
    
    const updatedTables = tables.filter(t => t.id !== tableId);
    setLocalStorage('tables', updatedTables);
    
    closeDetailModal();
    renderTables();
    showNotification('Đã xóa bàn thành công!', 'success');
}

// Handle form submit
function handleTableFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('tableName').value.trim();
    const capacity = parseInt(document.getElementById('tableCapacity').value);
    const area = document.getElementById('tableArea').value;
    const note = document.getElementById('tableNote').value.trim();
    
    if (!name || !capacity || !area) {
        showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }
    
    const tables = getLocalStorage('tables', []);
    
    if (currentEditingTableId) {
        // Edit existing table
        const tableIndex = tables.findIndex(t => t.id === currentEditingTableId);
        if (tableIndex !== -1) {
            tables[tableIndex].name = name;
            tables[tableIndex].capacity = capacity;
            tables[tableIndex].area = area;
            tables[tableIndex].note = note;
            setLocalStorage('tables', tables);
            showNotification('Đã cập nhật bàn thành công!', 'success');
        }
    } else {
        // Add new table
        const newTable = {
            id: 'T' + Date.now().toString().slice(-6),
            name,
            capacity,
            area,
            status: 'available',
            note,
            createdAt: new Date().toISOString()
        };
        tables.push(newTable);
        setLocalStorage('tables', tables);
        showNotification('Đã thêm bàn mới thành công!', 'success');
    }
    
    closeTableModal();
    renderTables();
}

// Theme functions
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
