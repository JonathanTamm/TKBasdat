document.addEventListener('DOMContentLoaded', () => {
    const user = getCurrentUser();
    
    document.getElementById('searchPromo').addEventListener('input', renderPromos);
    document.getElementById('filterType').addEventListener('change', renderPromos);
    
    document.getElementById('promoForm').addEventListener('submit', handlePromoSubmit);

    if (user && user.role === 'Admin') {
        const btnCreate = document.getElementById('btnCreatePromo');
        btnCreate.style.display = 'block';
        btnCreate.addEventListener('click', openCreateModal);
        document.getElementById('thAction').style.display = 'table-cell';
    }

    renderPromos();
});

function renderPromos() {
    const user = getCurrentUser();
    let promos = getTable('promotions');

    const search = document.getElementById('searchPromo').value.toLowerCase();
    const type = document.getElementById('filterType').value;

    if (search) promos = promos.filter(p => p.code.toLowerCase().includes(search));
    if (type) promos = promos.filter(p => p.type === type);

    const totalPromo = promos.length;
    const totalUsed = promos.reduce((sum, p) => sum + (p.used || 0), 0);
    const totalPercent = promos.filter(p => p.type === 'Persentase').length;

    document.getElementById('promoStats').innerHTML = `
        <div class="card feature-card"><h3>${totalPromo}</h3><p>TOTAL PROMO</p></div>
        <div class="card feature-card"><h3>${totalUsed}</h3><p>TOTAL PENGGUNAAN</p></div>
        <div class="card feature-card"><h3>${totalPercent}</h3><p>TIPE PERSENTASE</p></div>
    `;

    const tbody = document.getElementById('promoTbody');
    let html = '';

    if (promos.length === 0) {
        html = `<tr><td colspan="7" style="text-align:center;">Tidak ada data promo ditemukan.</td></tr>`;
    } else {
        promos.forEach(p => {
            const badgeColor = p.type === 'Persentase' ? '#e8f0fe; color: var(--primary)' : '#fce8e6; color: var(--danger)';
            const typeBadge = `<span style="background: ${badgeColor}; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">${p.type.toUpperCase()}</span>`;
            
            let valStr = p.type === 'Persentase' ? `${p.value}%` : formatCurrency(p.value);

            html += `<tr>
                <td style="font-weight: bold;">${p.code}</td>
                <td>${typeBadge}</td>
                <td>${valStr}</td>
                <td>${p.startDate}</td>
                <td>${p.endDate}</td>
                <td>${p.used || 0} / ${p.limit}</td>
            `;

            if (user && user.role === 'Admin') {
                html += `
                    <td style="text-align: right;">
                        <button onclick="openEditModal('${p.id}')" style="background:none; border:none; cursor:pointer; color: var(--primary); margin-right: 0.5rem;" title="Edit">✏️</button>
                        <button onclick="openDeleteModal('${p.id}')" style="background:none; border:none; cursor:pointer; color: var(--danger);" title="Hapus">🗑️</button>
                    </td>
                `;
            }
            html += `</tr>`;
        });
    }
    tbody.innerHTML = html;
}

function openCreateModal() {
    document.getElementById('formAction').value = 'create';
    document.getElementById('promoId').value = '';
    document.getElementById('promoForm').reset();
    document.getElementById('modalTitle').innerText = 'Buat Promo Baru';
    document.getElementById('btnSubmitPromo').innerText = 'Buat';
    document.getElementById('promoError').classList.add('d-none');
    document.getElementById('promoModal').classList.add('show');
}

function openEditModal(id) {
    const p = getTable('promotions').find(x => x.id === id);
    if (!p) return;

    document.getElementById('formAction').value = 'update';
    document.getElementById('promoId').value = p.id;
    document.getElementById('pCode').value = p.code;
    document.getElementById('pType').value = p.type;
    document.getElementById('pValue').value = p.value;
    document.getElementById('pStart').value = p.startDate;
    document.getElementById('pEnd').value = p.endDate;
    document.getElementById('pLimit').value = p.limit;
    
    document.getElementById('modalTitle').innerText = 'Edit Promo';
    document.getElementById('btnSubmitPromo').innerText = 'Simpan';
    document.getElementById('promoError').classList.add('d-none');
    document.getElementById('promoModal').classList.add('show');
}

function handlePromoSubmit(e) {
    e.preventDefault();
    const action = document.getElementById('formAction').value;
    const id = document.getElementById('promoId').value;
    const code = document.getElementById('pCode').value.trim();
    const type = document.getElementById('pType').value;
    const value = parseFloat(document.getElementById('pValue').value);
    const start = document.getElementById('pStart').value;
    const end = document.getElementById('pEnd').value;
    const limit = parseInt(document.getElementById('pLimit').value);
    
    const err = document.getElementById('promoError');
    err.classList.add('d-none');

    if (value <= 0) {
        err.innerText = 'Nilai diskon harus lebih besar dari 0.';
        err.classList.remove('d-none');
        return;
    }
    if (limit <= 0) {
        err.innerText = 'Batas penggunaan harus lebih besar dari 0.';
        err.classList.remove('d-none');
        return;
    }
    if (new Date(end) < new Date(start)) {
        err.innerText = 'Tanggal Berakhir tidak boleh sebelum Tanggal Mulai.';
        err.classList.remove('d-none');
        return;
    }

    let promos = getTable('promotions');
    
    const existing = promos.find(p => p.code.toLowerCase() === code.toLowerCase() && p.id !== id);
    if (existing) {
        err.innerText = 'Kode promo ini sudah digunakan.';
        err.classList.remove('d-none');
        return;
    }

    if (action === 'create') {
        promos.push({
            id: generateUUID(),
            code: code,
            type: type,
            value: value,
            startDate: start,
            endDate: end,
            limit: limit,
            used: 0
        });
    } else {
        const idx = promos.findIndex(p => p.id === id);
        if (idx !== -1) {
            promos[idx].code = code;
            promos[idx].type = type;
            promos[idx].value = value;
            promos[idx].startDate = start;
            promos[idx].endDate = end;
            promos[idx].limit = limit;
        }
    }

    saveTable('promotions', promos);
    closeModal('promoModal');
    renderPromos();
    alert(action === 'create' ? 'Promo berhasil dibuat!' : 'Promo berhasil diperbarui!');
}

function openDeleteModal(id) {
    document.getElementById('delPromoId').value = id;
    document.getElementById('deletePromoModal').classList.add('show');
}

function executeDeletePromo() {
    const id = document.getElementById('delPromoId').value;
    let promos = getTable('promotions');
    promos = promos.filter(p => p.id !== id);
    saveTable('promotions', promos);
    closeModal('deletePromoModal');
    renderPromos();
}

function closeModal(id) {
    document.getElementById(id).classList.remove('show');
}
