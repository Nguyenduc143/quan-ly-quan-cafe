// ===== EMPLOYEES PAGE =====

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadEmployees();
    setupEventListeners();
    initializeTheme();
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
    document.getElementById('addEmployeeBtn')?.addEventListener('click', () => openEmployeeModal());
    document.getElementById('cancelBtn')?.addEventListener('click', closeEmployeeModal);
    document.getElementById('employeeForm')?.addEventListener('submit', saveEmployee);
    document.getElementById('searchEmployee')?.addEventListener('input', debounce(loadEmployees, 300));
    document.getElementById('roleFilter')?.addEventListener('change', loadEmployees);
}

function loadEmployees() {
    let employees = getLocalStorage('employees', []);
    
    const searchTerm = document.getElementById('searchEmployee')?.value;
    if (searchTerm) {
        employees = searchInArray(employees, searchTerm, ['name', 'phone', 'email']);
    }
    
    const roleFilter = document.getElementById('roleFilter')?.value;
    if (roleFilter && roleFilter !== 'all') {
        employees = employees.filter(e => e.role === roleFilter);
    }
    
    displayEmployees(employees);
}

function displayEmployees(employees) {
    const grid = document.getElementById('employeesGrid');
    if (!grid) return;
    
    if (employees.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-users"></i>
                <p>Không tìm thấy nhân viên nào</p>
                <button class="btn btn-primary" onclick="openEmployeeModal()">
                    <i class="fas fa-user-plus"></i> Thêm nhân viên đầu tiên
                </button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = employees.map(emp => `
        <div class="employee-card">
            <div class="employee-avatar">${emp.name.charAt(0).toUpperCase()}</div>
            <h3 class="employee-name">${emp.name}</h3>
            <div class="employee-role">${emp.role}</div>
            <div style="margin: 1rem 0; font-size: 0.9rem;">
                <div style="margin-bottom: 0.5rem;">
                    <i class="fas fa-phone"></i> ${emp.phone}
                </div>
                ${emp.email ? `<div><i class="fas fa-envelope"></i> ${emp.email}</div>` : ''}
            </div>
            <div class="employee-actions">
                <button class="btn btn-info btn-sm" onclick="editEmployee('${emp.id}')">
                    <i class="fas fa-edit"></i> Sửa
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteEmployee('${emp.id}')">
                    <i class="fas fa-trash"></i> Xóa
                </button>
            </div>
        </div>
    `).join('');
}

function openEmployeeModal(employeeId = null) {
    const modal = document.getElementById('employeeModal');
    const form = document.getElementById('employeeForm');
    const modalTitle = document.getElementById('modalTitle');
    
    if (employeeId) {
        const employees = getLocalStorage('employees', []);
        const employee = employees.find(e => e.id === employeeId);
        
        if (employee) {
            modalTitle.innerHTML = '<i class="fas fa-edit"></i> Chỉnh sửa nhân viên';
            document.getElementById('employeeId').value = employee.id;
            document.getElementById('employeeName').value = employee.name;
            document.getElementById('employeeRole').value = employee.role;
            document.getElementById('employeePhone').value = employee.phone;
            document.getElementById('employeeEmail').value = employee.email || '';
            document.getElementById('employeeUsername').value = employee.username || '';
            document.getElementById('employeePassword').value = employee.password || '';
            
            // Make password optional when editing
            document.getElementById('employeePassword').required = false;
        }
    } else {
        modalTitle.innerHTML = '<i class="fas fa-user-plus"></i> Thêm nhân viên mới';
        form.reset();
        document.getElementById('employeeId').value = '';
        // Make password required when adding new
        document.getElementById('employeePassword').required = true;
    }
    
    modal.style.display = 'flex';
}

function closeEmployeeModal() {
    document.getElementById('employeeModal').style.display = 'none';
}

function saveEmployee(e) {
    e.preventDefault();
    
    const employeeId = document.getElementById('employeeId').value;
    const name = document.getElementById('employeeName').value.trim();
    const role = document.getElementById('employeeRole').value;
    const phone = document.getElementById('employeePhone').value.trim();
    const email = document.getElementById('employeeEmail').value.trim();
    const username = document.getElementById('employeeUsername').value.trim();
    const password = document.getElementById('employeePassword').value.trim();
    
    if (!name || !role || !phone || !username) {
        showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }
    
    let employees = getLocalStorage('employees', []);
    
    // Check username uniqueness
    const existingEmployee = employees.find(emp => emp.username === username && emp.id !== employeeId);
    if (existingEmployee) {
        showNotification('Tên đăng nhập đã tồn tại!', 'error');
        return;
    }
    
    if (employeeId) {
        const index = employees.findIndex(e => e.id === employeeId);
        if (index !== -1) {
            employees[index] = { 
                ...employees[index], 
                name, 
                role, 
                phone, 
                email,
                username
            };
            // Only update password if provided
            if (password) {
                employees[index].password = password;
            }
            showNotification('Cập nhật nhân viên thành công!', 'success');
        }
    } else {
        if (!password) {
            showNotification('Vui lòng nhập mật khẩu!', 'error');
            return;
        }
        employees.push({
            id: generateId(),
            name,
            role,
            phone,
            email,
            username,
            password,
            createdAt: new Date().toISOString()
        });
        showNotification('Thêm nhân viên thành công!', 'success');
    }
    
    setLocalStorage('employees', employees);
    closeEmployeeModal();
    loadEmployees();
}

function editEmployee(employeeId) {
    openEmployeeModal(employeeId);
}

function deleteEmployee(employeeId) {
    if (!confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) return;
    
    let employees = getLocalStorage('employees', []);
    employees = employees.filter(e => e.id !== employeeId);
    
    setLocalStorage('employees', employees);
    showNotification('Xóa nhân viên thành công!', 'success');
    loadEmployees();
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
