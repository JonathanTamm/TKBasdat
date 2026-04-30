const initialData = {
    users: [
        { id: 'admin-1', role: 'Admin', username: 'admin', password: 'password', fullName: 'Super Admin', phone: '-', email: 'admin@tiktaktuk.com' },
        { id: 'org-1', role: 'Organizer', username: 'organizer', password: 'password', fullName: 'Del Folks Organizer', phone: '08123456789', email: 'org@delfolks.com' },
        { id: 'cust-1', role: 'Customer', username: 'customer', password: 'password', fullName: 'Budi Santoso', phone: '08987654321', email: 'budi@example.com' }
    ],
    events: [
        { id: 'ev-1', name: 'Konser Melodi Senja', capacity: 500, location: 'Stadion Utama', date: '2026-08-15T19:00', organizerId: 'org-1', hasReservedSeating: true },
        { id: 'ev-2', name: 'Festival Kuliner Nusantara', capacity: 2000, location: 'Alun-alun Kota', date: '2026-09-01T10:00', organizerId: 'org-1', hasReservedSeating: false }
    ],
    categories: [
        { id: 'cat-1', eventId: 'ev-1', name: 'VIP', quota: 50, price: 1500000, booked: 20 },
        { id: 'cat-2', eventId: 'ev-1', name: 'Festival', quota: 450, price: 500000, booked: 100 },
        { id: 'cat-3', eventId: 'ev-2', name: 'Regular Pass', quota: 2000, price: 100000, booked: 500 }
    ],
    seats: [
        { id: 'seat-1', eventId: 'ev-1', number: 'A1', isAvailable: true },
        { id: 'seat-2', eventId: 'ev-1', number: 'A2', isAvailable: true },
        { id: 'seat-3', eventId: 'ev-1', number: 'A3', isAvailable: false }
    ],
    promotions: [
        { id: 'promo-1', code: 'TIKTAK20', type: 'Persentase', value: 20, startDate: '2026-01-01', endDate: '2026-12-31', limit: 100, used: 45 },
        { id: 'promo-2', code: 'HEMAT50K', type: 'Nominal', value: 50000, startDate: '2026-04-01', endDate: '2026-05-01', limit: 50, used: 50 }
    ],
    orders: [
        { id: 'ord-1', date: '2026-04-01T10:00:00Z', status: 'Lunas', amount: 3000000, customerId: 'cust-1', eventId: 'ev-1', customerName: 'Budi Santoso' },
        { id: 'ord-2', date: '2026-04-20T11:30:00Z', status: 'Pending', amount: 500000, customerId: 'cust-1', eventId: 'ev-1', customerName: 'Budi Santoso' }
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

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
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
            <a href="${baseUrl}pages/promotions.html">Promosi</a>
        `;
    } else if (role === 'Admin') {
        navLinks = `
            <a href="${baseUrl}pages/profile.html">Dashboard</a>
            <a href="#">Manajemen Venue</a>
            <a href="#">Manajemen Kursi</a>
            <a href="${baseUrl}pages/ticket-categories.html">Kategori Tiket</a>
            <a href="${baseUrl}pages/artists.html">Artists</a>
            <a href="#">Manajemen Tiket</a>
            <a href="#">Semua Order</a>
            <a href="#">Tiket (Aset)</a>
            <a href="#">Order (Aset)</a>
            <a href="${baseUrl}pages/profile.html" style="font-weight: bold;">Profile</a>
            <a href="#" onclick="logout()" style="color: var(--danger);">Logout</a>
        `;
    } else if (role === 'Organizer') {
        navLinks = `
            <a href="${baseUrl}pages/profile.html">Dashboard</a>
            <a href="#">Event Saya</a>
            <a href="#">Manajemen Venue</a>
            <a href="#">Manajemen Kursi</a>
            <a href="${baseUrl}pages/ticket-categories.html">Kategori Tiket</a>
            <a href="#">Manajemen Tiket</a>
            <a href="#">Semua Order</a>
            <a href="#">Tiket (Aset)</a>
            <a href="#">Order (Aset)</a>
            <a href="${baseUrl}pages/artists.html">Artists</a>
            <a href="${baseUrl}pages/profile.html" style="font-weight: bold;">Profile</a>
            <a href="#" onclick="logout()" style="color: var(--danger);">Logout</a>
        `;
    } else if (role === 'Customer') {
        navLinks = `
            <a href="${baseUrl}pages/profile.html">Dashboard</a>
            <a href="#">Tiket Saya</a>
            <a href="${baseUrl}pages/ticket-categories.html">Kategori Tiket</a>
            <a href="${baseUrl}pages/orders.html">Pesanan</a>
            <a href="${baseUrl}pages/events.html">Cari Event</a>
            <a href="${baseUrl}pages/promotions.html">Promosi</a>
            <a href="#">Venue</a>
            <a href="${baseUrl}pages/artists.html">Artists</a>
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
//ini logout
