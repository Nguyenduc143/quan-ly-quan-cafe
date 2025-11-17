// ===== INVENTORY MANAGEMENT SYSTEM =====

// Global variables
let materials = [];
let suppliers = [];
let purchases = [];
let currentMaterialId = null;
let currentSupplierId = null;
let currentPurchaseId = null;
let purchaseItems = [];
let currentTab = 'materials';

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Load data from localStorage
    loadData();
    
    // Display current date/time
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Initialize default data if empty
    if (materials.length === 0) {
        initializeDefaultMaterials();
    }
    if (suppliers.length === 0) {
        initializeDefaultSuppliers();
    }
    
    // Set default purchase date to today
    document.getElementById('purchaseDate').valueAsDate = new Date();
    
    // Display data
    renderMaterials();
    renderSuppliers();
    renderPurchases();
    updateStatistics();
});

function updateDateTime() {
    document.getElementById('currentDateTime').textContent = getCurrentDateTime();
}

function loadData() {
    materials = getLocalStorage('materials', []);
    suppliers = getLocalStorage('suppliers', []);
    purchases = getLocalStorage('purchases', []);
}

function saveData() {
    setLocalStorage('materials', materials);
    setLocalStorage('suppliers', suppliers);
    setLocalStorage('purchases', purchases);
}

// ===== INITIALIZE DEFAULT DATA =====
function initializeDefaultMaterials() {
    materials = [
        {
            id: 'MAT001',
            name: 'Cà phê Arabica',
            unit: 'kg',
            stock: 50,
            minStock: 10,
            price: 350000,
            note: 'Cà phê hạt rang xay'
        },
        {
            id: 'MAT002',
            name: 'Cà phê Robusta',
            unit: 'kg',
            stock: 30,
            minStock: 10,
            price: 250000,
            note: 'Cà phê hạt rang xay'
        },
        {
            id: 'MAT003',
            name: 'Sữa tươi',
            unit: 'lít',
            stock: 20,
            minStock: 15,
            price: 35000,
            note: 'Sữa tươi không đường'
        },
        {
            id: 'MAT004',
            name: 'Đường trắng',
            unit: 'kg',
            stock: 25,
            minStock: 10,
            price: 25000,
            note: 'Đường tinh luyện'
        },
        {
            id: 'MAT005',
            name: 'Trà xanh',
            unit: 'kg',
            stock: 5,
            minStock: 8,
            price: 180000,
            note: 'Trà xanh Thái Nguyên'
        },
        {
            id: 'MAT006',
            name: 'Bột ca cao',
            unit: 'kg',
            stock: 8,
            minStock: 5,
            price: 280000,
            note: 'Ca cao nguyên chất'
        },
        {
            id: 'MAT007',
            name: 'Kem whipping',
            unit: 'lít',
            stock: 3,
            minStock: 10,
            price: 120000,
            note: 'Kem béo thực vật'
        },
        {
            id: 'MAT008',
            name: 'Sirô vanilla',
            unit: 'chai',
            stock: 12,
            minStock: 5,
            price: 85000,
            note: 'Sirô hương vị 750ml'
        }
    ];
    saveData();
}

function initializeDefaultSuppliers() {
    suppliers = [
        {
            id: 'SUP001',
            name: 'Công ty Cà phê Highlands',
            phone: '0901234567',
            email: 'highlands@coffee.vn',
            address: 'Số 123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM',
            contact: 'Nguyễn Văn A',
            note: 'Nhà cung cấp cà phê chính',
            active: true,
            createdAt: new Date().toISOString()
        },
        {
            id: 'SUP002',
            name: 'Công ty Sữa TH True Milk',
            phone: '0912345678',
            email: 'contact@thmilk.vn',
            address: 'Khu CN Phú Mỹ, Bà Rịa - Vũng Tàu',
            contact: 'Trần Thị B',
            note: 'Cung cấp sữa tươi và các sản phẩm từ sữa',
            active: true,
            createdAt: new Date().toISOString()
        },
        {
            id: 'SUP003',
            name: 'Cửa hàng Nguyên liệu F&B',
            phone: '0923456789',
            email: 'info@fnb.vn',
            address: 'Số 456 Đường Lê Văn Việt, Quận 9, TP.HCM',
            contact: 'Lê Văn C',
            note: 'Cung cấp các nguyên liệu phụ',
            active: true,
            createdAt: new Date().toISOString()
        }
    ];
    saveData();
}

// ===== TAB SWITCHING =====
function switchTab(tabName) {
    // Update tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    event.target.closest('.tab-btn').classList.add('active');
    
    // Update tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    currentTab = tabName;
    
    if (tabName === 'materials') {
        document.getElementById('materialsTab').classList.add('active');
        renderMaterials();
    } else if (tabName === 'suppliers') {
        document.getElementById('suppliersTab').classList.add('active');
        renderSuppliers();
    } else if (tabName === 'purchases') {
        document.getElementById('purchasesTab').classList.add('active');
        renderPurchases();
    }
}

// ===== MATERIALS MANAGEMENT =====

function renderMaterials() {
    const tbody = document.getElementById('materialsTableBody');
    
    if (materials.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Chưa có nguyên liệu nào</td></tr>';
        updateStatistics();
        return;
    }
    
    tbody.innerHTML = materials.map(material => {
        const stockStatus = getStockStatus(material);
        const stockBadge = getStockBadge(stockStatus);
        
        return `
            <tr>
                <td><strong>${material.id}</strong></td>
                <td>${material.name}</td>
                <td>${material.unit}</td>
                <td style="text-align: center;">${material.stock}</td>
                <td style="text-align: center;">${material.minStock}</td>
                <td style="text-align: right;">${formatCurrency(material.price)}</td>
                <td style="text-align: center;">${stockBadge}</td>
                <td style="text-align: center;">
                    <button class="btn btn-sm btn-primary" onclick="editMaterial('${material.id}')" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteMaterial('${material.id}')" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    updateStatistics();
}

function getStockStatus(material) {
    if (material.stock <= 0) return 'out-of-stock';
    if (material.stock <= material.minStock) return 'low-stock';
    return 'in-stock';
}

function getStockBadge(status) {
    const badges = {
        'in-stock': '<span class="badge badge-success">Còn hàng</span>',
        'low-stock': '<span class="badge badge-warning">Sắp hết</span>',
        'out-of-stock': '<span class="badge badge-danger">Hết hàng</span>'
    };
    return badges[status];
}

function openMaterialModal(id = null) {
    currentMaterialId = id;
    const modal = document.getElementById('materialModal');
    const title = document.getElementById('materialModalTitle');
    const form = document.getElementById('materialForm');
    
    form.reset();
    
    if (id) {
        title.textContent = 'Chỉnh sửa nguyên liệu';
        const material = materials.find(m => m.id === id);
        if (material) {
            document.getElementById('materialName').value = material.name;
            document.getElementById('materialUnit').value = material.unit;
            document.getElementById('materialStock').value = material.stock;
            document.getElementById('materialMinStock').value = material.minStock;
            document.getElementById('materialPrice').value = material.price;
            document.getElementById('materialNote').value = material.note || '';
        }
    } else {
        title.textContent = 'Thêm nguyên liệu';
    }
    
    modal.style.display = 'flex';
    modal.classList.add('show');
}

function closeMaterialModal() {
    const modal = document.getElementById('materialModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
    currentMaterialId = null;
}

function saveMaterial(event) {
    event.preventDefault();
    
    const materialData = {
        name: document.getElementById('materialName').value.trim(),
        unit: document.getElementById('materialUnit').value,
        stock: parseFloat(document.getElementById('materialStock').value),
        minStock: parseFloat(document.getElementById('materialMinStock').value),
        price: parseFloat(document.getElementById('materialPrice').value),
        note: document.getElementById('materialNote').value.trim()
    };
    
    if (currentMaterialId) {
        // Edit existing material
        const index = materials.findIndex(m => m.id === currentMaterialId);
        if (index !== -1) {
            materials[index] = { ...materials[index], ...materialData };
            showNotification('Cập nhật nguyên liệu thành công!', 'success');
        }
    } else {
        // Add new material
        const newMaterial = {
            id: generateMaterialId(),
            ...materialData,
            createdAt: new Date().toISOString()
        };
        materials.push(newMaterial);
        showNotification('Thêm nguyên liệu thành công!', 'success');
    }
    
    saveData();
    renderMaterials();
    closeMaterialModal();
}

function editMaterial(id) {
    openMaterialModal(id);
}

function deleteMaterial(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa nguyên liệu này?')) return;
    
    materials = materials.filter(m => m.id !== id);
    saveData();
    renderMaterials();
    showNotification('Đã xóa nguyên liệu!', 'success');
}

function generateMaterialId() {
    const maxId = materials.reduce((max, m) => {
        const num = parseInt(m.id.replace('MAT', ''));
        return num > max ? num : max;
    }, 0);
    return 'MAT' + String(maxId + 1).padStart(3, '0');
}

function filterMaterials() {
    const searchTerm = document.getElementById('searchMaterial').value.toLowerCase();
    const stockFilter = document.getElementById('filterStock').value;
    
    let filtered = materials;
    
    // Search filter
    if (searchTerm) {
        filtered = filtered.filter(m => 
            m.name.toLowerCase().includes(searchTerm) ||
            m.id.toLowerCase().includes(searchTerm)
        );
    }
    
    // Stock status filter
    if (stockFilter !== 'all') {
        filtered = filtered.filter(m => getStockStatus(m) === stockFilter);
    }
    
    // Render filtered results
    const tbody = document.getElementById('materialsTableBody');
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Không tìm thấy kết quả</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(material => {
        const stockStatus = getStockStatus(material);
        const stockBadge = getStockBadge(stockStatus);
        
        return `
            <tr>
                <td><strong>${material.id}</strong></td>
                <td>${material.name}</td>
                <td>${material.unit}</td>
                <td style="text-align: center;">${material.stock}</td>
                <td style="text-align: center;">${material.minStock}</td>
                <td style="text-align: right;">${formatCurrency(material.price)}</td>
                <td style="text-align: center;">${stockBadge}</td>
                <td style="text-align: center;">
                    <button class="btn btn-sm btn-primary" onclick="editMaterial('${material.id}')" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteMaterial('${material.id}')" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// ===== SUPPLIERS MANAGEMENT =====

function renderSuppliers() {
    const tbody = document.getElementById('suppliersTableBody');
    
    if (suppliers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Chưa có nhà cung cấp nào</td></tr>';
        updateStatistics();
        return;
    }
    
    tbody.innerHTML = suppliers.map(supplier => {
        const statusBadge = supplier.active 
            ? '<span class="badge badge-success">Đang hợp tác</span>'
            : '<span class="badge badge-secondary">Ngưng hợp tác</span>';
        
        return `
            <tr>
                <td><strong>${supplier.id}</strong></td>
                <td>${supplier.name}</td>
                <td>${supplier.phone}</td>
                <td>${supplier.address}</td>
                <td>${supplier.email || '-'}</td>
                <td style="text-align: center;">${statusBadge}</td>
                <td style="text-align: center;">
                    <button class="btn btn-sm btn-primary" onclick="editSupplier('${supplier.id}')" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteSupplier('${supplier.id}')" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    updateStatistics();
}

function openSupplierModal(id = null) {
    currentSupplierId = id;
    const modal = document.getElementById('supplierModal');
    const title = document.getElementById('supplierModalTitle');
    const form = document.getElementById('supplierForm');
    
    form.reset();
    
    if (id) {
        title.textContent = 'Chỉnh sửa nhà cung cấp';
        const supplier = suppliers.find(s => s.id === id);
        if (supplier) {
            document.getElementById('supplierName').value = supplier.name;
            document.getElementById('supplierPhone').value = supplier.phone;
            document.getElementById('supplierEmail').value = supplier.email || '';
            document.getElementById('supplierAddress').value = supplier.address;
            document.getElementById('supplierContact').value = supplier.contact || '';
            document.getElementById('supplierNote').value = supplier.note || '';
            document.getElementById('supplierActive').checked = supplier.active;
        }
    } else {
        title.textContent = 'Thêm nhà cung cấp';
        document.getElementById('supplierActive').checked = true;
    }
    
    modal.style.display = 'flex';
    modal.classList.add('show');
}

function closeSupplierModal() {
    const modal = document.getElementById('supplierModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
    currentSupplierId = null;
}

function saveSupplier(event) {
    event.preventDefault();
    
    const supplierData = {
        name: document.getElementById('supplierName').value.trim(),
        phone: document.getElementById('supplierPhone').value.trim(),
        email: document.getElementById('supplierEmail').value.trim(),
        address: document.getElementById('supplierAddress').value.trim(),
        contact: document.getElementById('supplierContact').value.trim(),
        note: document.getElementById('supplierNote').value.trim(),
        active: document.getElementById('supplierActive').checked
    };
    
    if (currentSupplierId) {
        // Edit existing supplier
        const index = suppliers.findIndex(s => s.id === currentSupplierId);
        if (index !== -1) {
            suppliers[index] = { ...suppliers[index], ...supplierData };
            showNotification('Cập nhật nhà cung cấp thành công!', 'success');
        }
    } else {
        // Add new supplier
        const newSupplier = {
            id: generateSupplierId(),
            ...supplierData,
            createdAt: new Date().toISOString()
        };
        suppliers.push(newSupplier);
        showNotification('Thêm nhà cung cấp thành công!', 'success');
    }
    
    saveData();
    renderSuppliers();
    closeSupplierModal();
    
    // Update supplier select in purchase form
    loadSuppliersForPurchase();
}

function editSupplier(id) {
    openSupplierModal(id);
}

function deleteSupplier(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) return;
    
    suppliers = suppliers.filter(s => s.id !== id);
    saveData();
    renderSuppliers();
    showNotification('Đã xóa nhà cung cấp!', 'success');
}

function generateSupplierId() {
    const maxId = suppliers.reduce((max, s) => {
        const num = parseInt(s.id.replace('SUP', ''));
        return num > max ? num : max;
    }, 0);
    return 'SUP' + String(maxId + 1).padStart(3, '0');
}

function filterSuppliers() {
    const searchTerm = document.getElementById('searchSupplier').value.toLowerCase();
    
    const filtered = suppliers.filter(s => 
        s.name.toLowerCase().includes(searchTerm) ||
        s.id.toLowerCase().includes(searchTerm) ||
        s.phone.includes(searchTerm)
    );
    
    const tbody = document.getElementById('suppliersTableBody');
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Không tìm thấy kết quả</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(supplier => {
        const statusBadge = supplier.active 
            ? '<span class="badge badge-success">Đang hợp tác</span>'
            : '<span class="badge badge-secondary">Ngưng hợp tác</span>';
        
        return `
            <tr>
                <td><strong>${supplier.id}</strong></td>
                <td>${supplier.name}</td>
                <td>${supplier.phone}</td>
                <td>${supplier.address}</td>
                <td>${supplier.email || '-'}</td>
                <td style="text-align: center;">${statusBadge}</td>
                <td style="text-align: center;">
                    <button class="btn btn-sm btn-primary" onclick="editSupplier('${supplier.id}')" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteSupplier('${supplier.id}')" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// ===== PURCHASES MANAGEMENT =====

function renderPurchases() {
    const tbody = document.getElementById('purchasesTableBody');
    
    if (purchases.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Chưa có hóa đơn nhập nào</td></tr>';
        updateStatistics();
        return;
    }
    
    // Sort by date (newest first)
    const sortedPurchases = [...purchases].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    tbody.innerHTML = sortedPurchases.map(purchase => {
        return `
            <tr>
                <td><strong>${purchase.id}</strong></td>
                <td>${formatDateOnly(purchase.date)}</td>
                <td>${purchase.supplierName}</td>
                <td style="text-align: center;">${purchase.items.length}</td>
                <td style="text-align: right;"><strong>${formatCurrency(purchase.total)}</strong></td>
                <td>${purchase.employee}</td>
                <td style="text-align: center;">
                    <button class="btn btn-sm btn-info" onclick="viewPurchaseDetail('${purchase.id}')" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deletePurchase('${purchase.id}')" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    updateStatistics();
}

function openPurchaseModal() {
    const modal = document.getElementById('purchaseModal');
    const form = document.getElementById('purchaseForm');
    
    form.reset();
    purchaseItems = [];
    currentPurchaseId = null;
    
    // Set default date
    document.getElementById('purchaseDate').valueAsDate = new Date();
    
    // Load suppliers and materials
    loadSuppliersForPurchase();
    loadMaterialsForPurchase();
    
    // Clear items table
    renderPurchaseItems();
    
    modal.style.display = 'flex';
    modal.classList.add('show');
}

function closePurchaseModal() {
    const modal = document.getElementById('purchaseModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
    purchaseItems = [];
}

function loadSuppliersForPurchase() {
    const select = document.getElementById('purchaseSupplier');
    const activeSuppliers = suppliers.filter(s => s.active);
    
    select.innerHTML = '<option value="">Chọn nhà cung cấp</option>' +
        activeSuppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

function loadMaterialsForPurchase() {
    const select = document.getElementById('selectMaterial');
    
    select.innerHTML = '<option value="">-- Chọn nguyên liệu --</option>' +
        materials.map(m => `<option value="${m.id}">${m.name} (${m.unit})</option>`).join('');
}

function addMaterialToPurchase() {
    const materialId = document.getElementById('selectMaterial').value;
    const quantity = parseFloat(document.getElementById('materialQuantity').value);
    const price = parseFloat(document.getElementById('materialPurchasePrice').value);
    
    if (!materialId) {
        showNotification('Vui lòng chọn nguyên liệu!', 'error');
        return;
    }
    
    if (!quantity || quantity <= 0) {
        showNotification('Vui lòng nhập số lượng hợp lệ!', 'error');
        return;
    }
    
    if (!price || price < 0) {
        showNotification('Vui lòng nhập giá nhập hợp lệ!', 'error');
        return;
    }
    
    const material = materials.find(m => m.id === materialId);
    if (!material) return;
    
    // Check if material already in list
    const existingIndex = purchaseItems.findIndex(item => item.materialId === materialId);
    
    if (existingIndex !== -1) {
        // Update existing item
        purchaseItems[existingIndex].quantity += quantity;
        purchaseItems[existingIndex].price = price;
    } else {
        // Add new item
        purchaseItems.push({
            materialId: material.id,
            materialName: material.name,
            unit: material.unit,
            quantity: quantity,
            price: price
        });
    }
    
    // Clear inputs
    document.getElementById('selectMaterial').value = '';
    document.getElementById('materialQuantity').value = '';
    document.getElementById('materialPurchasePrice').value = '';
    
    renderPurchaseItems();
    showNotification('Đã thêm nguyên liệu vào hóa đơn!', 'success');
}

function removePurchaseItem(index) {
    purchaseItems.splice(index, 1);
    renderPurchaseItems();
    showNotification('Đã xóa nguyên liệu khỏi hóa đơn!', 'info');
}

function renderPurchaseItems() {
    const tbody = document.getElementById('purchaseItemsBody');
    
    if (purchaseItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Chưa có nguyên liệu nào</td></tr>';
        document.getElementById('purchaseTotal').textContent = '0đ';
        return;
    }
    
    let total = 0;
    
    tbody.innerHTML = purchaseItems.map((item, index) => {
        const subtotal = item.quantity * item.price;
        total += subtotal;
        
        return `
            <tr>
                <td>${item.materialName}</td>
                <td>${item.unit}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">${formatCurrency(item.price)}</td>
                <td style="text-align: right;"><strong>${formatCurrency(subtotal)}</strong></td>
                <td style="text-align: center;">
                    <button class="btn btn-sm btn-danger" onclick="removePurchaseItem(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    document.getElementById('purchaseTotal').textContent = formatCurrency(total);
}

function savePurchase(event) {
    event.preventDefault();
    
    if (purchaseItems.length === 0) {
        showNotification('Vui lòng thêm ít nhất một nguyên liệu!', 'error');
        return;
    }
    
    const supplierId = document.getElementById('purchaseSupplier').value;
    const supplier = suppliers.find(s => s.id === supplierId);
    
    if (!supplier) {
        showNotification('Vui lòng chọn nhà cung cấp!', 'error');
        return;
    }
    
    const purchaseData = {
        id: generatePurchaseId(),
        date: document.getElementById('purchaseDate').value,
        supplierId: supplierId,
        supplierName: supplier.name,
        employee: document.getElementById('purchaseEmployee').value.trim(),
        items: [...purchaseItems],
        total: purchaseItems.reduce((sum, item) => sum + (item.quantity * item.price), 0),
        note: document.getElementById('purchaseNote').value.trim(),
        createdAt: new Date().toISOString()
    };
    
    // Update material stock
    purchaseItems.forEach(item => {
        const materialIndex = materials.findIndex(m => m.id === item.materialId);
        if (materialIndex !== -1) {
            materials[materialIndex].stock += item.quantity;
            // Update price to latest purchase price
            materials[materialIndex].price = item.price;
        }
    });
    
    purchases.push(purchaseData);
    saveData();
    
    showNotification('Tạo hóa đơn nhập thành công! Đã cập nhật tồn kho.', 'success');
    
    closePurchaseModal();
    renderPurchases();
    renderMaterials(); // Update materials table to show new stock
}

function generatePurchaseId() {
    const maxId = purchases.reduce((max, p) => {
        const num = parseInt(p.id.replace('PUR', ''));
        return num > max ? num : max;
    }, 0);
    return 'PUR' + String(maxId + 1).padStart(4, '0');
}

function viewPurchaseDetail(id) {
    const purchase = purchases.find(p => p.id === id);
    if (!purchase) return;
    
    const modal = document.getElementById('purchaseDetailModal');
    const content = document.getElementById('purchaseDetailContent');
    
    content.innerHTML = `
        <div class="detail-section">
            <h3>Thông tin hóa đơn</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <strong>Mã hóa đơn:</strong>
                    <span>${purchase.id}</span>
                </div>
                <div class="detail-item">
                    <strong>Ngày nhập:</strong>
                    <span>${formatDate(purchase.date)}</span>
                </div>
                <div class="detail-item">
                    <strong>Nhà cung cấp:</strong>
                    <span>${purchase.supplierName}</span>
                </div>
                <div class="detail-item">
                    <strong>Người nhập:</strong>
                    <span>${purchase.employee}</span>
                </div>
                ${purchase.note ? `
                <div class="detail-item" style="grid-column: 1 / -1;">
                    <strong>Ghi chú:</strong>
                    <span>${purchase.note}</span>
                </div>
                ` : ''}
            </div>
        </div>
        
        <div class="detail-section">
            <h3>Chi tiết nguyên liệu</h3>
            <table>
                <thead>
                    <tr>
                        <th>Nguyên liệu</th>
                        <th>Đơn vị</th>
                        <th>Số lượng</th>
                        <th>Giá nhập</th>
                        <th>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${purchase.items.map(item => `
                        <tr>
                            <td>${item.materialName}</td>
                            <td>${item.unit}</td>
                            <td style="text-align: center;">${item.quantity}</td>
                            <td style="text-align: right;">${formatCurrency(item.price)}</td>
                            <td style="text-align: right;"><strong>${formatCurrency(item.quantity * item.price)}</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="4" style="text-align: right;"><strong>Tổng cộng:</strong></td>
                        <td style="text-align: right;"><strong style="color: var(--primary-color); font-size: 1.2rem;">${formatCurrency(purchase.total)}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>
        
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closePurchaseDetailModal()">Đóng</button>
        </div>
    `;
    
    modal.style.display = 'flex';
    modal.classList.add('show');
}

function closePurchaseDetailModal() {
    const modal = document.getElementById('purchaseDetailModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function deletePurchase(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa hóa đơn này? Lưu ý: Tồn kho sẽ KHÔNG được hoàn lại.')) return;
    
    purchases = purchases.filter(p => p.id !== id);
    saveData();
    renderPurchases();
    showNotification('Đã xóa hóa đơn nhập!', 'success');
}

function filterPurchases() {
    const searchTerm = document.getElementById('searchPurchase').value.toLowerCase();
    const dateFilter = document.getElementById('filterPurchaseDate').value;
    
    let filtered = purchases;
    
    // Search filter
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.id.toLowerCase().includes(searchTerm) ||
            p.supplierName.toLowerCase().includes(searchTerm) ||
            p.employee.toLowerCase().includes(searchTerm)
        );
    }
    
    // Date filter
    if (dateFilter) {
        filtered = filtered.filter(p => p.date === dateFilter);
    }
    
    // Sort by date
    const sortedFiltered = [...filtered].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    const tbody = document.getElementById('purchasesTableBody');
    if (sortedFiltered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Không tìm thấy kết quả</td></tr>';
        return;
    }
    
    tbody.innerHTML = sortedFiltered.map(purchase => {
        return `
            <tr>
                <td><strong>${purchase.id}</strong></td>
                <td>${formatDateOnly(purchase.date)}</td>
                <td>${purchase.supplierName}</td>
                <td style="text-align: center;">${purchase.items.length}</td>
                <td style="text-align: right;"><strong>${formatCurrency(purchase.total)}</strong></td>
                <td>${purchase.employee}</td>
                <td style="text-align: center;">
                    <button class="btn btn-sm btn-info" onclick="viewPurchaseDetail('${purchase.id}')" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deletePurchase('${purchase.id}')" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// ===== STATISTICS =====

function updateStatistics() {
    // Materials statistics
    const totalMaterials = materials.length;
    const lowStockMaterials = materials.filter(m => getStockStatus(m) === 'low-stock').length;
    const outOfStockMaterials = materials.filter(m => getStockStatus(m) === 'out-of-stock').length;
    const totalInventoryValue = materials.reduce((sum, m) => sum + (m.stock * m.price), 0);
    
    document.getElementById('totalMaterials').textContent = totalMaterials;
    document.getElementById('totalInventoryValue').textContent = formatCurrency(totalInventoryValue);
    document.getElementById('lowStockCount').textContent = lowStockMaterials;
    document.getElementById('outOfStockCount').textContent = outOfStockMaterials;
    
    // Suppliers statistics
    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter(s => s.active).length;
    
    document.getElementById('totalSuppliers').textContent = totalSuppliers;
    document.getElementById('activeSuppliers').textContent = activeSuppliers;
    
    // Purchases statistics
    const totalPurchases = purchases.length;
    const totalPurchaseValue = purchases.reduce((sum, p) => sum + p.total, 0);
    
    document.getElementById('totalPurchases').textContent = totalPurchases;
    document.getElementById('totalPurchaseValue').textContent = formatCurrency(totalPurchaseValue);
}
