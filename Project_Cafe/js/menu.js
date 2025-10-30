// ===== MENU PAGE INITIALIZATION =====

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadProducts();
    setupEventListeners();
    initializeTheme();
});

// Check authentication
function checkAuth() {
    const currentUser = getLocalStorage('currentUser');
    if (!currentUser) {
        window.location.href = '../index.html';
        return;
    }
    
    // Update user display
    const userElement = document.getElementById('currentUser');
    if (userElement) {
        userElement.textContent = currentUser.name;
    }
}

// ===== EVENT LISTENERS =====

function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            removeLocalStorage('currentUser');
            window.location.href = '../index.html';
        });
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
    
    // Add product button
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            openProductModal();
        });
    }
    
    // Product form
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProduct();
        });
    }
    
    // Cancel button
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeProductModal);
    }
    
    // Search
    const searchProduct = document.getElementById('searchProduct');
    if (searchProduct) {
        searchProduct.addEventListener('input', debounce(function() {
            loadProducts();
        }, 300));
    }
    
    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', loadProducts);
    }
}

// ===== LOAD PRODUCTS =====

function loadProducts() {
    let products = getLocalStorage('products', []);
    
    // Apply search filter
    const searchTerm = document.getElementById('searchProduct')?.value;
    if (searchTerm) {
        products = searchInArray(products, searchTerm, ['name', 'category']);
    }
    
    // Apply category filter
    const categoryFilter = document.getElementById('categoryFilter')?.value;
    if (categoryFilter && categoryFilter !== 'all') {
        products = products.filter(p => p.category === categoryFilter);
    }
    
    displayProducts(products);
}

function displayProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-mug-hot"></i>
                <p>Không tìm thấy sản phẩm nào</p>
                <button class="btn btn-primary" onclick="openProductModal()">
                    <i class="fas fa-plus"></i> Thêm sản phẩm đầu tiên
                </button>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image || 'https://via.placeholder.com/250x200?text=' + encodeURIComponent(product.name)}" 
                 alt="${product.name}" 
                 class="product-image"
                 onerror="this.src='https://via.placeholder.com/250x200?text=No+Image'">
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">${formatCurrency(product.price)}</div>
                ${product.inStock 
                    ? '<span class="badge badge-success">Còn hàng</span>' 
                    : '<span class="badge badge-danger">Hết hàng</span>'}
                <div class="product-actions">
                    <button class="btn btn-info btn-sm" onclick="editProduct('${product.id}')">
                        <i class="fas fa-edit"></i> Sửa
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product.id}')">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== MODAL FUNCTIONS =====

function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');
    
    if (!modal) return;
    
    if (productId) {
        // Edit mode
        const products = getLocalStorage('products', []);
        const product = products.find(p => p.id === productId);
        
        if (product) {
            modalTitle.innerHTML = '<i class="fas fa-edit"></i> Chỉnh sửa sản phẩm';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productImage').value = product.image || '';
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productInStock').checked = product.inStock;
        }
    } else {
        // Add mode
        modalTitle.innerHTML = '<i class="fas fa-plus"></i> Thêm sản phẩm mới';
        form.reset();
        document.getElementById('productId').value = '';
        document.getElementById('productInStock').checked = true;
    }
    
    modal.style.display = 'flex';
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ===== CRUD OPERATIONS =====

function saveProduct() {
    const productId = document.getElementById('productId').value;
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const image = document.getElementById('productImage').value.trim();
    const description = document.getElementById('productDescription').value.trim();
    const inStock = document.getElementById('productInStock').checked;
    
    // Validation
    if (!name || !category || !price) {
        showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }
    
    if (price < 0) {
        showNotification('Giá sản phẩm không hợp lệ!', 'error');
        return;
    }
    
    let products = getLocalStorage('products', []);
    
    if (productId) {
        // Update existing product
        const index = products.findIndex(p => p.id === productId);
        if (index !== -1) {
            products[index] = {
                ...products[index],
                name,
                category,
                price,
                image,
                description,
                inStock,
                updatedAt: new Date().toISOString()
            };
            showNotification('Cập nhật sản phẩm thành công!', 'success');
        }
    } else {
        // Add new product
        const newProduct = {
            id: generateId(),
            name,
            category,
            price,
            image,
            description,
            inStock,
            createdAt: new Date().toISOString()
        };
        products.push(newProduct);
        showNotification('Thêm sản phẩm thành công!', 'success');
    }
    
    setLocalStorage('products', products);
    closeProductModal();
    loadProducts();
}

function editProduct(productId) {
    openProductModal(productId);
}

function deleteProduct(productId) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
        return;
    }
    
    let products = getLocalStorage('products', []);
    products = products.filter(p => p.id !== productId);
    
    setLocalStorage('products', products);
    showNotification('Xóa sản phẩm thành công!', 'success');
    loadProducts();
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
