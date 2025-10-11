// ===== APP INITIALIZATION =====

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    // Check if user is logged in
    const currentUser = getLocalStorage('currentUser');
    
    if (currentUser) {
        showApp();
        loadDashboardData();
        // Gọi lại để chắc chắn menu bị ẩn đúng quyền
        applyRoleRestrictions();
    } else {
        showLoginModal();
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize theme
    initializeTheme();
    
    // Update current date/time
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute
}

// ===== AUTHENTICATION =====

function showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    const app = document.getElementById('app');
    
    if (loginModal && app) {
        loginModal.style.display = 'flex';
        app.style.display = 'none';
    }
    
    // Clear login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.reset();
    }
}

function showApp() {
    const loginModal = document.getElementById('loginModal');
    const app = document.getElementById('app');
    
    if (loginModal && app) {
        loginModal.style.display = 'none';
        app.style.display = 'flex';
    }
    
    // Update current user display
    updateCurrentUserDisplay();
    
    // Apply role-based restrictions
    applyRoleRestrictions();
}

function applyRoleRestrictions() {
    const currentUser = getLocalStorage('currentUser');
    if (!currentUser) return;

    // Lấy các phần tử menu
    const navMenu = document.getElementById('navMenu');
    const navInventory = document.getElementById('navInventory');
    const navEmployees = document.getElementById('navEmployees');
    const navReports = document.getElementById('navReports');
    const navOrders = document.getElementById('navOrders');
    const navTables = document.getElementById('navTables');

    // Ẩn tất cả trước
    if (navMenu) navMenu.style.display = 'none';
    if (navInventory) navInventory.style.display = 'none';
    if (navEmployees) navEmployees.style.display = 'none';
    if (navReports) navReports.style.display = 'none';
    if (navOrders) navOrders.style.display = 'none';
    if (navTables) navTables.style.display = 'none';

    // Hiện theo quyền
    switch (currentUser.role) {
        case 'Quản lý':
            if (navMenu) navMenu.style.display = '';
            if (navInventory) navInventory.style.display = '';
            if (navEmployees) navEmployees.style.display = '';
            if (navReports) navReports.style.display = '';
            if (navOrders) navOrders.style.display = '';
            if (navTables) navTables.style.display = '';
            break;
        case 'Thu ngân':
            if (navOrders) navOrders.style.display = '';
            break;
        case 'Pha chế':
            if (navOrders) navOrders.style.display = '';
            break;
        case 'Phục vụ':
            if (navTables) navTables.style.display = '';
            break;
    }
}

function login(username, password) {
    // Demo admin
    if (username === 'admin' && password === 'admin123') {
        const user = {
            username: 'admin',
            role: 'Quản lý',
            name: 'Quản trị viên',
            loginTime: new Date().toISOString()
        };
        setLocalStorage('currentUser', user);
        showNotification('Đăng nhập thành công!', 'success');
        showApp();
        loadDashboardData();
        return true;
    }

    // Check employee accounts
    const employees = getLocalStorage('employees', []);
    const employee = employees.find(emp => emp.username === username && emp.password === password);

    if (employee) {
        const user = {
            username: employee.username,
            role: employee.role, // Giữ nguyên role gốc
            name: employee.name,
            loginTime: new Date().toISOString()
        };
        setLocalStorage('currentUser', user);
        showNotification('Đăng nhập thành công!', 'success');
        showApp();
        loadDashboardData();
        return true;
    }

    showNotification('Tên đăng nhập hoặc mật khẩu không đúng!', 'error');
    return false;
}

function logout() {
    removeLocalStorage('currentUser');
    showNotification('Đã đăng xuất!', 'info');
    // Chuyển về trang đăng nhập (index.html)
    window.location.href = "../index.html";
}

function updateCurrentUserDisplay() {
    const currentUser = getLocalStorage('currentUser');
    const userElement = document.getElementById('currentUser');
    
    if (currentUser && userElement) {
        userElement.textContent = currentUser.name;
    }
}

// ===== EVENT LISTENERS =====

function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            login(username, password);
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Toggle sidebar
    const toggleSidebar = document.getElementById('toggleSidebar');
    const sidebar = document.querySelector('.sidebar');
    if (toggleSidebar && sidebar) {
        toggleSidebar.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// ===== DASHBOARD DATA =====

function loadDashboardData() {
    // Load statistics
    updateStatistics();
    
    // Load recent orders
    loadRecentOrders();
    
    // Load top products
    loadTopProducts();
}

function updateStatistics() {
    // Get data from localStorage
    const orders = getLocalStorage('orders', []);
    const products = getLocalStorage('products', []);
    const employees = getLocalStorage('employees', []);
    
    // Calculate today's revenue
    const today = new Date().toDateString();
    const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.date).toDateString();
        return orderDate === today && order.status === 'completed';
    });
    
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    
    // Update UI
    const revenueElement = document.getElementById('todayRevenue');
    const ordersElement = document.getElementById('todayOrders');
    const productsElement = document.getElementById('totalProducts');
    const employeesElement = document.getElementById('totalEmployees');
    
    if (revenueElement) revenueElement.textContent = formatCurrency(todayRevenue);
    if (ordersElement) ordersElement.textContent = todayOrders.length;
    if (productsElement) productsElement.textContent = products.length;
    if (employeesElement) employeesElement.textContent = employees.length;
}

function loadRecentOrders() {
    const orders = getLocalStorage('orders', []);
    const recentOrders = orders.slice(-5).reverse(); // Get last 5 orders
    
    const tableBody = document.querySelector('#recentOrdersTable tbody');
    if (!tableBody) return;
    
    if (recentOrders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center">Chưa có đơn hàng nào</td></tr>';
        return;
    }
    
    tableBody.innerHTML = recentOrders.map(order => `
        <tr>
            <td><strong>#${order.id.slice(0, 8)}</strong></td>
            <td>${formatDate(order.date)}</td>
            <td><strong>${formatCurrency(order.total)}</strong></td>
            <td><span class="badge badge-${getStatusBadge(order.status)}">${getStatusText(order.status)}</span></td>
        </tr>
    `).join('');
}

function loadTopProducts() {
    const orders = getLocalStorage('orders', []);
    const topProductsContainer = document.getElementById('topProductsList');
    
    if (!topProductsContainer) return;
    
    // Calculate product sales
    const productSales = {};
    
    orders.forEach(order => {
        if (order.items) {
            order.items.forEach(item => {
                if (!productSales[item.name]) {
                    productSales[item.name] = {
                        name: item.name,
                        quantity: 0,
                        revenue: 0
                    };
                }
                productSales[item.name].quantity += item.quantity;
                productSales[item.name].revenue += item.price * item.quantity;
            });
        }
    });
    
    // Convert to array and sort
    const topProducts = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
    
    if (topProducts.length === 0) {
        topProductsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-chart-bar"></i>
                <p>Chưa có dữ liệu bán hàng</p>
            </div>
        `;
        return;
    }
    
    topProductsContainer.innerHTML = topProducts.map((product, index) => `
        <div class="order-item" style="border-left-color: ${getProductColor(index)}">
            <div class="order-item-header">
                <span class="order-item-id">#${index + 1} ${product.name}</span>
                <span class="badge badge-primary">${product.quantity} ly</span>
            </div>
            <div class="order-item-body">
                <span class="order-item-time">Doanh thu</span>
                <span class="order-item-total">${formatCurrency(product.revenue)}</span>
            </div>
        </div>
    `).join('');
}

// ===== HELPER FUNCTIONS =====

function getStatusBadge(status) {
    const badges = {
        'pending': 'warning',
        'processing': 'info',
        'completed': 'success',
        'cancelled': 'danger'
    };
    return badges[status] || 'info';
}

function getStatusText(status) {
    const texts = {
        'pending': 'Chờ xử lý',
        'processing': 'Đang pha chế',
        'completed': 'Hoàn thành',
        'cancelled': 'Đã hủy'
    };
    return texts[status] || status;
}

function getProductColor(index) {
    const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
    return colors[index % colors.length];
}

function updateDateTime() {
    const dateTimeElement = document.getElementById('currentDateTime');
    if (dateTimeElement) {
        dateTimeElement.textContent = getCurrentDateTime();
    }
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

// ===== INITIALIZE DEMO DATA =====

function initializeDemoData() {
    // Check if data already exists
    if (getLocalStorage('dataInitialized')) {
        return;
    }
    
    // Initialize demo products
    const demoProducts = [
        { id: generateId(), name: 'Cà phê đen', category: 'Cà phê', price: 25000, image: '', inStock: true },
        { id: generateId(), name: 'Cà phê sữa', category: 'Cà phê', price: 30000, image: '', inStock: true },
        { id: generateId(), name: 'Bạc xỉu', category: 'Cà phê', price: 30000, image: '', inStock: true },
        { id: generateId(), name: 'Cappuccino', category: 'Cà phê', price: 45000, image: '', inStock: true },
        { id: generateId(), name: 'Trà sữa trân châu', category: 'Trà sữa', price: 35000, image: '', inStock: true },
        { id: generateId(), name: 'Sinh tố bơ', category: 'Sinh tố', price: 40000, image: '', inStock: true }
    ];
    
    // Initialize demo employees
    const demoEmployees = [
        { id: generateId(), name: 'Nguyễn Văn A', role: 'Quản lý', phone: '0901234567', email: 'nva@coffee.com', username: 'quanly', password: '123456' },
        { id: generateId(), name: 'Trần Thị B', role: 'Thu ngân', phone: '0901234568', email: 'ttb@coffee.com', username: 'thungan', password: '123456' },
        { id: generateId(), name: 'Lê Văn C', role: 'Pha chế', phone: '0901234569', email: 'lvc@coffee.com', username: 'phache', password: '123456' },
        { id: generateId(), name: 'Phạm Thị D', role: 'Phục vụ', phone: '0901234570', email: 'ptd@coffee.com', username: 'phucvu', password: '123456' }
    ];
    
    setLocalStorage('products', demoProducts);
    setLocalStorage('employees', demoEmployees);
    setLocalStorage('orders', []);
    setLocalStorage('dataInitialized', true);
    
    console.log('Demo data initialized');
}

// Initialize demo data on first load
initializeDemoData();
