document.addEventListener('DOMContentLoaded', () => {
    requireLogin();
    const user = getCurrentUser();
    if (user.role !== 'Customer') {
        alert('Hanya Customer yang dapat membeli tiket.');
        window.location.href = 'profile.html';
        return;
    }
    loadEvents();
});

function loadEvents() {
    const events = getTable('events');
    const container = document.getElementById('eventsContainer');
    let html = '';

    events.forEach(ev => {
        const d = new Date(ev.date);
        const dateStr = d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        
        html += `
            <div class="card event-card">
                <div>
                    <h3 style="margin-bottom: 0.5rem; color: var(--primary);">${ev.name}</h3>
                    <p style="color: var(--text-light); font-size: 0.875rem; margin-bottom: 1rem;">
                        📍 ${ev.location}<br>
                        📅 ${dateStr} - ${timeStr}
                    </p>
                </div>
                <a href="checkout.html?eventId=${ev.id}" class="btn btn-primary" style="text-align: center; display: block; margin-top: 1rem;">Beli Tiket</a>
            </div>
        `;
    });

    if (events.length === 0) {
        html = '<p style="grid-column: 1/-1; text-align: center;">Belum ada event tersedia.</p>';
    }

    container.innerHTML = html;
}
