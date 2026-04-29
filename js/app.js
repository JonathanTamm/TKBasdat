const initialData = {
    events: [
        { id: 'ev-1', name: 'Coldplay Music of the Spheres', capacity: 50000 },
        { id: 'ev-2', name: 'Java Jazz Festival 2026', capacity: 10000 }
    ],
    categories: [
        { id: 'cat-1', eventId: 'ev-1', name: 'CAT 1 - Festival', quota: 5000, price: 3000000 },
        { id: 'cat-2', eventId: 'ev-1', name: 'VIP', quota: 500, price: 5000000 },
        { id: 'cat-3', eventId: 'ev-2', name: 'Daily Pass - Friday', quota: 3000, price: 800000 }
    ],
    seats: [
        { id: 'seat-1', eventId: 'ev-1', number: 'A1', isAvailable: true },
        { id: 'seat-2', eventId: 'ev-1', number: 'A2', isAvailable: true },
        { id: 'seat-3', eventId: 'ev-2', number: 'J1', isAvailable: true }
    ],
    orders: [
        { id: 'ord-1', date: '2026-04-01T10:00:00Z', status: 'Paid', amount: 6000000, customerId: 'cust-1', eventId: 'ev-1' },
        { id: 'ord-2', date: '2026-04-02T11:30:00Z', status: 'Pending', amount: 800000, customerId: 'cust-1', eventId: 'ev-2' }
    ],
    tickets: [
        { id: 'tck-1', code: 'TCK-CP-1001', categoryId: 'cat-1', orderId: 'ord-1', seatId: 'seat-1', status: 'Active' },
        { id: 'tck-2', code: 'TCK-CP-1002', categoryId: 'cat-1', orderId: 'ord-1', seatId: 'seat-2', status: 'Active' }
    ],
    customers: [
        { id: 'cust-1', name: 'Budi Santoso' }
    ]
};

function initDB() {
    if (!localStorage.getItem('tiktaktuk_db')) {
        localStorage.setItem('tiktaktuk_db', JSON.stringify(initialData));
    }

    if (!localStorage.getItem('current_role')) {
        localStorage.setItem('current_role', 'Guest');
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

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
}
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

function setupRoleSelector() {
    const roleSelector = document.getElementById('roleSelector');
    if (!roleSelector) return;

    const currentRole = localStorage.getItem('current_role');
    roleSelector.value = currentRole;

    roleSelector.addEventListener('change', (e) => {
        localStorage.setItem('current_role', e.target.value);
        window.location.reload();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initDB();
    setupRoleSelector();
    
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href').includes(currentPage) && currentPage !== '') {
            link.classList.add('active');
        }
    });
});
