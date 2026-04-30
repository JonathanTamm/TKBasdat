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
    venues: [
        { id: 'ven-1', name: 'Stadion Utama', capacity: 50000, address: 'Jl. Pemuda No. 1', city: 'Jakarta' },
        { id: 'ven-2', name: 'Alun-alun Kota', capacity: 10000, address: 'Pusat Kota', city: 'Bandung' },
        { id: 'ven-3', name: 'Gedung Kesenian', capacity: 500, address: 'Jl. Merdeka No. 10', city: 'Surabaya' },
        { id: 'ven-4', name: 'Taman Budaya', capacity: 2000, address: 'Jl. Budaya No. 5', city: 'Yogyakarta' },
        { id: 'ven-5', name: 'Hall Expo', capacity: 15000, address: 'Jl. Expo No. 99', city: 'Medan' }
    ],
    categories: [
        { id: 'cat-1', eventId: 'ev-1', name: 'VIP', quota: 50, price: 1500000, booked: 20 },
        { id: 'cat-2', eventId: 'ev-1', name: 'Festival', quota: 450, price: 500000, booked: 100 },
        { id: 'cat-3', eventId: 'ev-2', name: 'Regular Pass', quota: 2000, price: 100000, booked: 500 }
    ],
    seats: [
        { id: 'seat-1', venueId: 'ven-1', section: 'Utama', row: 'A', number: '1', isAvailable: true },
        { id: 'seat-2', venueId: 'ven-1', section: 'Utama', row: 'A', number: '2', isAvailable: true },
        { id: 'seat-3', venueId: 'ven-1', section: 'Utama', row: 'A', number: '3', isAvailable: false }
    ],
    tickets: [
        { id: 'tkt-1', code: 'TKT-001', orderId: 'ord-1', eventId: 'ev-1', categoryId: 'cat-1', seatId: 'seat-3' }
    ],
    promotions: [
        { promotion_id: 'promo-1', promo_code: 'TIKTAK20', discount_type: 'PERCENTAGE', discount_value: 20, start_date: '2026-01-01', end_date: '2026-12-31', usage_limit: 100 },
        { promotion_id: 'promo-2', promo_code: 'HEMAT50K', discount_type: 'NOMINAL', discount_value: 50000, start_date: '2026-04-01', end_date: '2026-05-01', usage_limit: 50 }
    ],
    orders: [
        { order_id: 'ord-1', order_date: '2026-04-01T10:00:00Z', payment_status: 'Lunas', total_amount: 3000000, customer_id: 'cust-1', event_id: 'ev-1', customerName: 'Budi Santoso' },
        { order_id: 'ord-2', order_date: '2026-04-20T11:30:00Z', payment_status: 'Pending', total_amount: 500000, customer_id: 'cust-1', event_id: 'ev-1', customerName: 'Budi Santoso' }
    ],
    order_promotions: [
        { order_promotion_id: 'op-1', promotion_id: 'promo-1', order_id: 'ord-1' }
    ],
    stats: {
        totalTickets: 120,
        totalOrders: 45,
        totalRevenue: 15000000
    }
};

function initDB() {
    let dbStr = localStorage.getItem('tiktaktuk_db');
    let needsReset = false;
    if (dbStr) {
        try {
            const db = JSON.parse(dbStr);
            if (db.orders && db.orders.length > 0 && !db.orders[0].order_id) {
                needsReset = true;
            }
        } catch(e) {
            needsReset = true;
        }
    }
    
    if (!dbStr || needsReset) {
        localStorage.setItem('tiktaktuk_db', JSON.stringify(initialData));
    } else {
        let db = JSON.parse(dbStr);
        let updated = false;
        for (let key in initialData) {
            if (!db[key]) {
                db[key] = initialData[key];
                updated = true;
            }
        }
        if (updated) {
            localStorage.setItem('tiktaktuk_db', JSON.stringify(db));
        }
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
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
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
            <a href="${baseUrl}pages/events.html">Cari Event</a>
            <a href="${baseUrl}pages/promotions.html">Promosi</a>
            <a href="${baseUrl}pages/venues.html">Venue</a>
        `;
    } else if (role === 'Admin') {
        navLinks = `
            <a href="${baseUrl}pages/profile.html">Dashboard</a>
            <a href="${baseUrl}pages/events.html">Cari Event</a>
            <a href="${baseUrl}pages/manage-events.html">Manajemen Event</a>
            <a href="${baseUrl}pages/venues.html">Manajemen Venue</a>
            <a href="${baseUrl}pages/manage-seats.html">Manajemen Kursi</a>
            <a href="${baseUrl}pages/ticket-categories.html">Kategori Tiket</a>
            <a href="${baseUrl}pages/manage-tickets.html">Manajemen Tiket</a>
            <a href="${baseUrl}pages/orders.html">Semua Order</a>
            <a href="${baseUrl}pages/promotions.html">Promosi</a>
            <a href="${baseUrl}pages/manage-tickets.html">Tiket (Aset)</a>
            <a href="${baseUrl}pages/orders.html">Order (Aset)</a>
            <a href="${baseUrl}pages/profile.html" style="font-weight: bold;">Profile</a>
            <a href="#" onclick="logout()" style="color: var(--danger);">Logout</a>
        `;
    } else if (role === 'Organizer') {
        navLinks = `
            <a href="${baseUrl}pages/profile.html">Dashboard</a>
            <a href="${baseUrl}pages/events.html">Cari Event</a>
            <a href="${baseUrl}pages/manage-events.html">Event Saya</a>
            <a href="${baseUrl}pages/venues.html">Manajemen Venue</a>
            <a href="${baseUrl}pages/manage-seats.html">Manajemen Kursi</a>
            <a href="${baseUrl}pages/ticket-categories.html">Kategori Tiket</a>
            <a href="${baseUrl}pages/manage-tickets.html">Manajemen Tiket</a>
            <a href="${baseUrl}pages/orders.html">Semua Order</a>
            <a href="${baseUrl}pages/promotions.html">Promosi</a>
            <a href="${baseUrl}pages/manage-tickets.html">Tiket (Aset)</a>
            <a href="${baseUrl}pages/orders.html">Order (Aset)</a>
            <a href="${baseUrl}pages/profile.html" style="font-weight: bold;">Profile</a>
            <a href="#" onclick="logout()" style="color: var(--danger);">Logout</a>
        `;
    } else if (role === 'Customer') {
        navLinks = `
            <a href="${baseUrl}pages/profile.html">Dashboard</a>
            <a href="${baseUrl}pages/manage-tickets.html">Tiket Saya</a>
            <a href="${baseUrl}pages/ticket-categories.html">Kategori Tiket</a>
            <a href="${baseUrl}pages/orders.html">Pesanan</a>
            <a href="${baseUrl}pages/events.html">Cari Event</a>
            <a href="${baseUrl}pages/promotions.html">Promosi</a>
            <a href="${baseUrl}pages/venues.html">Venue</a>
            <a href="${baseUrl}pages/artists.html">Artis</a>
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
