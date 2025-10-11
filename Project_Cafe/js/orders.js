// ===== ORDERS PAGE INITIALIZATION =====

let currentCart = [];
let isAddingItems = false;
let currentOrderId = null;

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    checkAddItemsMode();
    loadOrders();
    setupEventListeners();
    initializeTheme();
});

// Check if in add items mode
function checkAddItemsMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const addItemsOrderId = urlParams.get('addItems');
    
    if (addItemsOrderId) {
        isAddingItems = true;
        currentOrderId = addItemsOrderId;
        
        // Auto open modal to add items
        setTimeout(() => {
            openAddItemsModal(addItemsOrderId);
        }, 500);
    }
}

// Check authentication
function checkAuth() {
    const currentUser = getLocalStorage('currentUser');
    if (!currentUser) {
        window.location.href = '../index.html';
        return;
    }
    
    const userElement = document.getElementById('currentUser');
    if (userElement) {
        userElement.textContent = currentUser.name;
    }
}

// ===== EVENT LISTENERS =====

function setupEventListeners() {
    // Logout button
    document.getElementById('logoutBtn')?.addEventListener('click', function() {
        removeLocalStorage('currentUser');
        window.location.href = '../index.html';
    });
    
    // Toggle sidebar
    const toggleSidebar = document.getElementById('toggleSidebar');
    const sidebar = document.querySelector('.sidebar');
    toggleSidebar?.addEventListener('click', () => sidebar?.classList.toggle('active'));
    
    // Theme toggle
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    
    // Create order button
    document.getElementById('createOrderBtn')?.addEventListener('click', openOrderModal);
    
    // Cancel order button
    document.getElementById('cancelOrderBtn')?.addEventListener('click', closeOrderModal);
    
    // Confirm order button
    document.getElementById('confirmOrderBtn')?.addEventListener('click', confirmOrder);
    
    // Search
    document.getElementById('searchOrder')?.addEventListener('input', debounce(loadOrders, 300));
    
    // Status filter
    document.getElementById('statusFilter')?.addEventListener('change', loadOrders);
}

// ===== LOAD ORDERS =====

function loadOrders() {
    let orders = getLocalStorage('orders', []);
    
    // Apply search filter
    const searchTerm = document.getElementById('searchOrder')?.value;
    if (searchTerm) {
        orders = searchInArray(orders, searchTerm, ['id']);
    }
    
    // Apply status filter
    const statusFilter = document.getElementById('statusFilter')?.value;
    if (statusFilter && statusFilter !== 'all') {
        orders = orders.filter(o => o.status === statusFilter);
    }
    
    // Sort by date (newest first)
    orders = sortArray(orders, 'date', 'desc');
    
    displayOrders(orders);
}

function displayOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-cart"></i>
                <p>Chưa có đơn hàng nào</p>
                <button class="btn btn-primary" onclick="openOrderModal()">
                    <i class="fas fa-plus"></i> Tạo đơn hàng đầu tiên
                </button>
            </div>
        `;
        return;
    }
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-item">
            <div class="order-item-header">
                <span class="order-item-id">#${order.id.slice(0, 8).toUpperCase()}</span>
                <span class="badge badge-${getStatusBadge(order.status)}">${getStatusText(order.status)}</span>
            </div>
            <div class="order-item-body">
                <div class="order-item-details">
                    ${order.tableName ? `
                        <div style="margin-bottom: 0.5rem;">
                            <i class="fas fa-table"></i> <strong>${order.tableName}</strong>
                        </div>
                    ` : `
                        <div style="margin-bottom: 0.5rem;">
                            <i class="fas fa-shopping-bag"></i> <strong>Mang đi</strong>
                        </div>
                    `}
                    <div style="margin-bottom: 0.5rem;">
                        <strong>Sản phẩm:</strong> ${order.items.length} món
                    </div>
                    <div class="order-item-time">
                        <i class="fas fa-clock"></i> ${formatDate(order.date)}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div class="order-item-total">${formatCurrency(order.total)}</div>
                    <div class="btn-group" style="margin-top: 0.5rem; flex-wrap: wrap;">
                        ${order.status === 'pending' || order.status === 'processing' ? `
                            <button class="btn btn-warning btn-sm" onclick="openAddItemsModal('${order.id}')" title="Thêm món">
                                <i class="fas fa-plus"></i> Thêm món
                            </button>
                        ` : ''}
                        ${order.status === 'pending' ? `
                            <button class="btn btn-info btn-sm" onclick="updateOrderStatus('${order.id}', 'processing')">
                                <i class="fas fa-play"></i> Bắt đầu
                            </button>
                        ` : ''}
                        ${order.status === 'processing' ? `
                            <button class="btn btn-success btn-sm" onclick="updateOrderStatus('${order.id}', 'completed')">
                                <i class="fas fa-check"></i> Hoàn thành
                            </button>
                        ` : ''}
                        ${order.status === 'completed' ? `
                            <button class="btn btn-primary btn-sm" onclick="payOrder('${order.id}')">
                                <i class="fas fa-money-bill-wave"></i> Thanh toán
                            </button>
                        ` : ''}
                        ${order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'paid' ? `
                            <button class="btn btn-danger btn-sm" onclick="updateOrderStatus('${order.id}', 'cancelled')">
                                <i class="fas fa-times"></i> Hủy
                            </button>
                        ` : ''}
                        <button class="btn btn-secondary btn-sm" onclick="viewOrderDetails('${order.id}')">
                            <i class="fas fa-eye"></i> Chi tiết
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== ORDER MODAL =====

function openOrderModal() {
    const modal = document.getElementById('orderModal');
    if (!modal) return;
    
    isAddingItems = false;
    currentOrderId = null;
    currentCart = [];
    
    // Update modal title
    const modalTitle = modal.querySelector('.card-header h3');
    if (modalTitle) {
        modalTitle.innerHTML = '<i class="fas fa-shopping-cart"></i> Tạo đơn hàng mới';
    }
    
    // Show table selection for new orders
    const tableSelectionDiv = modal.querySelector('.card-body > div:first-child');
    if (tableSelectionDiv) {
        tableSelectionDiv.style.display = 'block';
    }
    
    loadTablesForOrder();
    loadProductsForOrder();
    updateCartDisplay();
    modal.style.display = 'flex';
}

// Open modal to add items to existing order
function openAddItemsModal(orderId) {
    const orders = getLocalStorage('orders', []);
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        showNotification('Không tìm thấy đơn hàng!', 'error');
        return;
    }
    
    if (order.status === 'completed' || order.status === 'paid' || order.status === 'cancelled') {
        showNotification('Không thể thêm món cho đơn hàng đã hoàn thành/thanh toán/hủy!', 'error');
        return;
    }
    
    const modal = document.getElementById('orderModal');
    if (!modal) return;
    
    isAddingItems = true;
    currentOrderId = orderId;
    currentCart = [];
    
    // Update modal title
    const modalTitle = modal.querySelector('.card-header h3');
    if (modalTitle) {
        modalTitle.innerHTML = `<i class="fas fa-plus"></i> Thêm món cho đơn #${orderId.slice(0, 8).toUpperCase()}`;
    }
    
    // Hide table selection when adding items
    const tableSelectionDiv = modal.querySelector('.card-body > div:first-child');
    if (tableSelectionDiv) {
        tableSelectionDiv.style.display = 'none';
    }
    
    // Show current order info
    const orderInfoDiv = document.createElement('div');
    orderInfoDiv.id = 'currentOrderInfo';
    orderInfoDiv.style.cssText = 'margin-bottom: 1.5rem; padding: 1rem; background-color: var(--bg-color); border-radius: var(--border-radius); border-left: 4px solid var(--primary-color);';
    orderInfoDiv.innerHTML = `
        <h4 style="margin: 0 0 0.5rem 0;">Đơn hàng hiện tại</h4>
        <div><strong>Bàn:</strong> ${order.tableName || 'Mang đi'}</div>
        <div><strong>Món hiện có:</strong> ${order.items.length} món</div>
        <div><strong>Tổng hiện tại:</strong> ${formatCurrency(order.total)}</div>
    `;
    
    const cardBody = modal.querySelector('.card-body');
    const existingOrderInfo = document.getElementById('currentOrderInfo');
    if (existingOrderInfo) {
        existingOrderInfo.remove();
    }
    cardBody.insertBefore(orderInfoDiv, cardBody.firstChild);
    
    loadProductsForOrder();
    updateCartDisplay();
    modal.style.display = 'flex';
}

function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.style.display = 'none';
        currentCart = [];
        isAddingItems = false;
        currentOrderId = null;
        
        // Remove order info if exists
        const orderInfo = document.getElementById('currentOrderInfo');
        if (orderInfo) {
            orderInfo.remove();
        }
        
        // Clear URL parameter
        if (window.location.search.includes('addItems')) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
}

// Load available tables for order
function loadTablesForOrder() {
    const tables = getLocalStorage('tables', []);
    const tableSelect = document.getElementById('orderTableSelect');
    
    if (!tableSelect) return;
    
    // Keep the default "no table" option and add available/occupied tables
    const availableTables = tables.filter(t => t.status === 'available' || t.status === 'occupied');
    
    const tableOptions = availableTables.map(table => {
        const areaLabels = {
            indoor: 'Trong nhà',
            outdoor: 'Ngoài trời',
            vip: 'VIP'
        };
        const statusLabel = table.status === 'occupied' ? ' (Đang có khách)' : '';
        return `<option value="${table.id}">${table.name} - ${areaLabels[table.area]}${statusLabel}</option>`;
    }).join('');
    
    tableSelect.innerHTML = '<option value="">-- Không chọn bàn (Mang đi) --</option>' + tableOptions;
}

function loadProductsForOrder() {
    const products = getLocalStorage('products', []).filter(p => p.inStock);
    const productsGrid = document.getElementById('orderProductsGrid');
    
    if (!productsGrid) return;
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <p>Không có sản phẩm nào khả dụng</p>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" style="cursor: pointer;" onclick="addToCart('${product.id}')">
            <img src="${product.image || 'https://via.placeholder.com/250x200?text=' + encodeURIComponent(product.name)}" 
                 alt="${product.name}" 
                 class="product-image"
                 onerror="this.src='https://via.placeholder.com/250x200?text=No+Image'">
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">${formatCurrency(product.price)}</div>
                <button class="btn btn-primary btn-sm" style="width: 100%;" onclick="event.stopPropagation(); addToCart('${product.id}')">
                    <i class="fas fa-plus"></i> Chọn món
                </button>
            </div>
        </div>
    `).join('');
}

function addToCart(productId) {
    const products = getLocalStorage('products', []);
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    const existingItem = currentCart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        currentCart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    showNotification(`Đã thêm ${product.name} vào giỏ hàng`, 'success', 2000);
}

function removeFromCart(productId) {
    currentCart = currentCart.filter(item => item.id !== productId);
    updateCartDisplay();
}

function updateQuantity(productId, change) {
    const item = currentCart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartDisplay();
        }
    }
}

function updateCartDisplay() {
    const cartContainer = document.getElementById('orderCart');
    const totalElement = document.getElementById('orderTotal');
    
    if (!cartContainer) return;
    
    if (currentCart.length === 0) {
        cartContainer.innerHTML = `
            <p class="text-center" style="color: var(--text-secondary); padding: 2rem;">
                Chưa có sản phẩm nào trong giỏ hàng
            </p>
        `;
        if (totalElement) totalElement.textContent = '0 đ';
        return;
    }
    
    const total = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    cartContainer.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Sản phẩm</th>
                    <th style="text-align: center;">Số lượng</th>
                    <th style="text-align: right;">Đơn giá</th>
                    <th style="text-align: right;">Thành tiền</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                ${currentCart.map(item => `
                    <tr>
                        <td><strong>${item.name}</strong></td>
                        <td style="text-align: center;">
                            <div class="btn-group" style="display: inline-flex;">
                                <button class="btn btn-sm btn-secondary" onclick="updateQuantity('${item.id}', -1)">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span style="padding: 0.4rem 1rem; background: var(--bg-color); border-radius: 4px;">
                                    ${item.quantity}
                                </span>
                                <button class="btn btn-sm btn-secondary" onclick="updateQuantity('${item.id}', 1)">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </td>
                        <td style="text-align: right;">${formatCurrency(item.price)}</td>
                        <td style="text-align: right;"><strong>${formatCurrency(item.price * item.quantity)}</strong></td>
                        <td style="text-align: right;">
                            <button class="btn btn-danger btn-sm" onclick="removeFromCart('${item.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    if (totalElement) {
        totalElement.textContent = formatCurrency(total);
    }
}

function confirmOrder() {
    if (currentCart.length === 0) {
        showNotification('Giỏ hàng trống!', 'error');
        return;
    }
    
    // Check if adding items to existing order
    if (isAddingItems && currentOrderId) {
        addItemsToOrder();
        return;
    }
    
    // Create new order
    const total = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const selectedTableId = document.getElementById('orderTableSelect')?.value;
    
    // Create order object
    const newOrder = {
        id: generateId(),
        date: new Date().toISOString(),
        items: [...currentCart],
        total: total,
        status: 'pending',
        tableId: selectedTableId || null,
        tableName: null
    };
    
    // Handle table status update
    if (selectedTableId) {
        const tables = getLocalStorage('tables', []);
        const tableIndex = tables.findIndex(t => t.id === selectedTableId);
        
        if (tableIndex !== -1) {
            const table = tables[tableIndex];
            newOrder.tableName = table.name;
            
            // Check if table is already occupied - prevent creating new order
            if (table.status === 'occupied') {
                showNotification(`Bàn ${table.name} đang phục vụ! Vui lòng dùng chức năng "Thêm món" để thêm món vào đơn hàng hiện tại.`, 'error');
                return;
            }
            
            // Check table status and update accordingly
            if (table.status === 'available' || table.status === 'reserved') {
                // If table is available or reserved, change to occupied
                tables[tableIndex].status = 'occupied';
                tables[tableIndex].currentOrder = newOrder.id;
                showNotification(`Bàn ${table.name} đã chuyển sang trạng thái "Đang phục vụ"`, 'info', 3000);
            }
            
            setLocalStorage('tables', tables);
        }
    }
    
    // Save order
    const orders = getLocalStorage('orders', []);
    orders.push(newOrder);
    setLocalStorage('orders', orders);
    
    showNotification('Tạo đơn hàng thành công!', 'success');
    closeOrderModal();
    loadOrders();
}

// Add items to existing order
function addItemsToOrder() {
    const orders = getLocalStorage('orders', []);
    const orderIndex = orders.findIndex(o => o.id === currentOrderId);
    
    if (orderIndex === -1) {
        showNotification('Không tìm thấy đơn hàng!', 'error');
        return;
    }
    
    const order = orders[orderIndex];
    
    // Add new items to existing order
    currentCart.forEach(newItem => {
        const existingItem = order.items.find(item => item.id === newItem.id);
        
        if (existingItem) {
            // If item already exists, increase quantity
            existingItem.quantity += newItem.quantity;
        } else {
            // Add new item
            order.items.push(newItem);
        }
    });
    
    // Recalculate total
    order.total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    order.updatedAt = new Date().toISOString();
    
    // Save updated order
    setLocalStorage('orders', orders);
    
    showNotification(`Đã thêm ${currentCart.length} món vào đơn hàng!`, 'success', 4000);
    closeOrderModal();
    loadOrders();
}

// ===== ORDER ACTIONS =====

function updateOrderStatus(orderId, newStatus) {
    const orders = getLocalStorage('orders', []);
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
        order.status = newStatus;
        
        // Handle table status when order is cancelled (NOT when completed)
        if (newStatus === 'cancelled' && order.tableId) {
            const tables = getLocalStorage('tables', []);
            const tableIndex = tables.findIndex(t => t.id === order.tableId);
            
            if (tableIndex !== -1) {
                // Reset table to available when order is cancelled
                tables[tableIndex].status = 'available';
                tables[tableIndex].currentOrder = null;
                setLocalStorage('tables', tables);
                
                showNotification(`Đơn hàng đã hủy. Bàn ${order.tableName} đã trống.`, 'success');
            }
        } else {
            showNotification(`Đã cập nhật trạng thái đơn hàng!`, 'success');
        }
        
        setLocalStorage('orders', orders);
        loadOrders();
    }
}

// Pay order - Only this function will free up the table
function payOrder(orderId) {
    const orders = getLocalStorage('orders', []);
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    if (order.status !== 'completed') {
        showNotification('Chỉ có thể thanh toán đơn hàng đã hoàn thành!', 'error');
        return;
    }
    
    // Confirm payment
    if (!confirm(`Xác nhận thanh toán đơn hàng ${order.id.slice(0, 8).toUpperCase()}?\nTổng tiền: ${formatCurrency(order.total)}`)) {
        return;
    }
    
    // Update order status to paid
    order.status = 'paid';
    order.paidAt = new Date().toISOString();
    
    // Free up the table when payment is successful
    if (order.tableId) {
        const tables = getLocalStorage('tables', []);
        const tableIndex = tables.findIndex(t => t.id === order.tableId);
        
        if (tableIndex !== -1) {
            tables[tableIndex].status = 'available';
            tables[tableIndex].currentOrder = null;
            setLocalStorage('tables', tables);
            
            showNotification(`Thanh toán thành công! Bàn ${order.tableName} đã trống.`, 'success', 4000);
        } else {
            showNotification(`Thanh toán thành công!`, 'success');
        }
    } else {
        showNotification(`Thanh toán thành công!`, 'success');
    }
    
    setLocalStorage('orders', orders);
    loadOrders();
}

function viewOrderDetails(orderId) {
    const orders = getLocalStorage('orders', []);
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    // Tạo HTML cho modal
    const modalHtml = `
        <div id="orderDetailsModal" class="modal" style="display: flex;">
            <div class="modal-content" style="width: 80%; max-height: 90vh; overflow-y: auto;">
                <button class="modal-close-btn" onclick="closeOrderDetailsModal()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-shopping-cart"></i> Chi tiết đơn hàng #${order.id.slice(0, 8).toUpperCase()}</h3>
                    </div>
                    <div class="card-body">
                        <div style="margin-bottom: 1.5rem;">
                            <div style="margin-bottom: 0.5rem;">
                                <strong>Thời gian:</strong> ${formatDate(order.date)}
                            </div>
                            ${order.tableName ? `
                                <div style="margin-bottom: 0.5rem;">
                                    <strong>Bàn:</strong> <i class="fas fa-table"></i> ${order.tableName}
                                </div>
                            ` : `
                                <div style="margin-bottom: 0.5rem;">
                                    <strong>Loại:</strong> <i class="fas fa-shopping-bag"></i> Mang đi
                                </div>
                            `}
                            <div style="margin-bottom: 0.5rem;">
                                <strong>Trạng thái:</strong> 
                                <span class="badge badge-${getStatusBadge(order.status)}">
                                    ${getStatusText(order.status)}
                                </span>
                            </div>
                            <div style="margin-bottom: 0.5rem;">
                                <strong>Tổng cộng:</strong> ${formatCurrency(order.total)}
                            </div>
                        </div>
                        <h4>Sản phẩm</h4>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Tên sản phẩm</th>
                                    <th style="text-align: center;">Số lượng</th>
                                    <th style="text-align: right;">Đơn giá</th>
                                    <th style="text-align: right;">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.items.map(item => `
                                    <tr>
                                        <td>${item.name}</td>
                                        <td style="text-align: center;">${item.quantity}</td>
                                        <td style="text-align: right;">${formatCurrency(item.price)}</td>
                                        <td style="text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Thêm modal vào tài liệu
    const existingModal = document.getElementById('orderDetailsModal');
    if (existingModal) {
        existingModal.remove();
    }
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Hàm đóng modal chi tiết đơn hàng
function closeOrderDetailsModal() {
    const modal = document.getElementById('orderDetailsModal');
    if (modal) {
        modal.remove();
    }
}

// ===== HELPER FUNCTIONS =====

function getStatusBadge(status) {
    const badges = {
        'pending': 'warning',
        'processing': 'info',
        'completed': 'success',
        'paid': 'primary',
        'cancelled': 'danger'
    };
    return badges[status] || 'info';
}

function getStatusText(status) {
    const texts = {
        'pending': 'Chờ xử lý',
        'processing': 'Đang pha chế',
        'completed': 'Hoàn thành',
        'paid': 'Đã thanh toán',
        'cancelled': 'Đã hủy'
    };
    return texts[status] || status;
}

// ===== THEME MANAGEMENT =====

function initializeTheme() {
    const savedTheme = getLocalStorage('theme', 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    setLocalStorage('theme', newTheme);
    updateThemeIcon(newTheme);
    
    showNotification(`Đã chuyển sang chế độ ${newTheme === 'light' ? 'sáng' : 'tối'}`, 'info', 2000);
}

function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
}
