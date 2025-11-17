// ===== AUTHENTICATION & AUTHORIZATION =====

// Check if user is logged in and has permission to access the page
function checkAuth() {
    const currentUser = getLocalStorage('currentUser');
    
    // If not logged in, redirect to home page
    if (!currentUser) {
        window.location.href = '../index.html';
        return false;
    }
    
    return true;
}

// Check if user has permission to access specific pages
function checkPagePermission() {
    const currentUser = getLocalStorage('currentUser');
    
    if (!currentUser) {
        window.location.href = '../index.html';
        return false;
    }
    
    // Get current page name
    const currentPage = window.location.pathname.split('/').pop();
    
    // Restricted pages for staff (Nhân viên)
    const restrictedPagesForStaff = [
        'menu.html',
        'inventory.html',
        'employees.html',
        'reports.html'
    ];
    
    // If user is staff and trying to access restricted page
    if (currentUser.role === 'Nhân viên' && restrictedPagesForStaff.includes(currentPage)) {
        showNotification('Bạn không có quyền truy cập trang này!', 'error');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000);
        return false;
    }
    
    return true;
}

// Apply role-based UI restrictions on pages
function applyPageRestrictions() {
    const currentUser = getLocalStorage('currentUser');
    
    if (!currentUser) return;
    
    // If user is staff, hide restricted menu items in sidebar
    if (currentUser.role === 'Nhân viên') {
        const restrictedMenus = document.querySelectorAll('a[href*="menu.html"], a[href*="inventory.html"], a[href*="employees.html"], a[href*="reports.html"]');
        
        restrictedMenus.forEach(menu => {
            menu.style.display = 'none';
        });
    }
}

// Initialize authentication check when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Only check on pages that are not index.html
    if (!window.location.pathname.endsWith('index.html') && window.location.pathname.includes('/pages/')) {
        checkPagePermission();
        applyPageRestrictions();
    }
});
