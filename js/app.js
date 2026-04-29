const initialData = {
    users: [
        { id: 'admin-1', role: 'Admin', username: 'admin', password: 'password', fullName: 'Super Admin', phone: '-', email: 'admin@tiktaktuk.com' },
        { id: 'org-1', role: 'Organizer', username: 'organizer', password: 'password', fullName: 'Del Folks Organizer', phone: '08123456789', email: 'org@delfolks.com' },
        { id: 'cust-1', role: 'Customer', username: 'customer', password: 'password', fullName: 'Budi Santoso', phone: '08987654321', email: 'budi@example.com' }
    ],
    stats: {
        totalTickets: 120,
        totalOrders: 45,
        totalRevenue: 15000000
    }
};

function initDB() {
    if (!localStorage.getItem('tiktaktuk_db')) {
        localStorage.setItem('tiktaktuk_db', JSON.stringify(initialData));
    }
}

function getTable(tableName) {
    const db = JSON.parse(localStorage.getItem('tiktaktuk_db'));
    return db[tableName] || [];
}

function saveTable(tableName, data) {
    const db = JSON.parse(localStorage.getItem('tiktaktuk_db'));
    db[tableName] = data;
    localStorage.setItem('tiktaktuk_db', JSON.stringify(db));
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function getCurrentUser() {
    const userId = localStorage.getItem('session_user');
    if (!userId) return null;
    return getTable('users').find(u => u.id === userId);
}

function getBaseUrl() {
    return window.location.pathname.includes('/pages/') ? '../' : './';
}

function renderNavbar() {
    const navContainer = document.getElementById('dynamicNavbar');
    if (!navContainer) return;

    const user = getCurrentUser();
    const role = user ? user.role : 'Guest';
    const baseUrl = getBaseUrl();

    let navLinks = '';

    if (role === 'Guest') {
        navLinks = `
            <a href="${baseUrl}pages/login.html">Login</a>
            <a href="${baseUrl}pages/register.html">Registrasi</a>
        `;
    } else if (role === 'Admin') {
        navLinks = `
            <a href="${baseUrl}pages/profile.html">Dashboard</a>
            <a href="#">Manajemen Venue</a>
            <a href="#">Manajemen Kursi</a>
            <a href="#">Kategori Tiket</a>
            <a href="#">Manajemen Tiket</a>
            <a href="#">Semua Order</a>
            <a href="#">Tiket (Aset)</a>
            <a href="#">Order (Aset)</a>
            <a href="${baseUrl}pages/profile.html" style="font-weight: bold;">Profile</a>
        `;
    } else if (role === 'Organizer') {
        navLinks = `
            <a href="${baseUrl}pages/profile.html">Dashboard</a>
            <a href="#">Event Saya</a>
            <a href="#">Manajemen Venue</a>
            <a href="#">Manajemen Kursi</a>
            <a href="#">Kategori Tiket</a>
            <a href="#">Manajemen Tiket</a>
            <a href="#">Semua Order</a>
            <a href="#">Tiket (Aset)</a>
            <a href="#">Order (Aset)</a>
            <a href="${baseUrl}pages/profile.html" style="font-weight: bold;">Profile</a>
        `;
    } else if (role === 'Customer') {
        navLinks = `
            <a href="${baseUrl}pages/profile.html">Dashboard</a>
            <a href="#">Tiket Saya</a>
            <a href="#">Pesanan</a>
            <a href="#">Cari Event</a>
            <a href="#">Promosi</a>
            <a href="#">Venue</a>
            <a href="#">Artis</a>
            <a href="#" onclick="logout()" style="color: var(--danger);">Logout</a>
        `;
    }

    navContainer.innerHTML = `
        <div class="nav-container">
            <a href="${baseUrl}index.html" class="logo">TikTakTuk</a>
            <nav class="nav-links">
                ${navLinks}
            </nav>
        </div>
    `;
    
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href').includes(currentPage) && currentPage !== '') {
            link.classList.add('active');
        }
    });
}

function requireLogin() {
    if (!getCurrentUser()) {
        window.location.href = getBaseUrl() + 'pages/login.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initDB();
    renderNavbar();
});
function logout() { localStorage.removeItem('session_user'); window.location.href = getBaseUrl() + 'pages/login.html'; }
