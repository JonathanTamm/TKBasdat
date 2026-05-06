document.addEventListener('DOMContentLoaded', () => {
    if (getCurrentUser()) {
        window.location.href = 'profile.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        document.querySelectorAll('.role-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                const role = e.target.getAttribute('data-role');
                document.getElementById('regRole').value = role;
                updateRegisterForm(role);
            });
        });
    }
});

async function handleLogin(e) {
    e.preventDefault();
    const loginUsername = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    if (!loginUsername || !password) {
        errorDiv.innerText = 'Username dan Password wajib diisi.';
        errorDiv.classList.remove('d-none');
        return;
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: loginUsername, password })
        });
        const result = await response.json();

        if (result.success) {
            localStorage.setItem('session_user', result.user.id);
            window.location.href = 'profile.html'; 
        } else {
            errorDiv.innerText = result.message || 'Username atau Password salah.';
            errorDiv.classList.remove('d-none');
        }
    } catch (err) {
        errorDiv.innerText = 'Terjadi kesalahan pada server.';
        errorDiv.classList.remove('d-none');
    }
}

function updateRegisterForm(role) {
    const groupFullName = document.getElementById('groupFullName');
    const groupEmail = document.getElementById('groupEmail');
    const groupPhone = document.getElementById('groupPhone');
    const lblFullName = document.getElementById('lblFullName');

    document.getElementById('regFullName').required = true;
    document.getElementById('regEmail').required = true;
    document.getElementById('regPhone').required = true;

    if (role === 'Admin') {
        groupFullName.classList.add('d-none');
        groupEmail.classList.add('d-none');
        groupPhone.classList.add('d-none');
        document.getElementById('regFullName').required = false;
        document.getElementById('regEmail').required = false;
        document.getElementById('regPhone').required = false;
    } else if (role === 'Organizer') {
        groupFullName.classList.remove('d-none');
        groupEmail.classList.remove('d-none');
        groupPhone.classList.remove('d-none');
        lblFullName.innerText = 'Nama Lengkap';
    } else if (role === 'Customer') {
        groupFullName.classList.remove('d-none');
        groupEmail.classList.remove('d-none');
        groupPhone.classList.remove('d-none');
        lblFullName.innerText = 'Nama Lengkap';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const errorDiv = document.getElementById('registerError');
    errorDiv.classList.add('d-none');

    const role = document.getElementById('regRole').value;
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;
    const terms = document.getElementById('regTerms').checked;
    
    if (!terms) {
        errorDiv.innerText = 'Anda harus menyetujui Syarat & Ketentuan.';
        errorDiv.classList.remove('d-none');
        return;
    }

    let fullName = '';
    let email = '';
    let phone = '';

    if (role !== 'Admin') {
        fullName = document.getElementById('regFullName').value.trim();
        email = document.getElementById('regEmail').value.trim();
        phone = document.getElementById('regPhone').value.trim();
    }

    if (password !== confirm) {
        errorDiv.innerText = 'Konfirmasi Password tidak cocok.';
        errorDiv.classList.remove('d-none');
        return;
    }

    const newUser = {
        role: role,
        username: username,
        password: password,
        full_name: fullName || '-',
        email: email || null,
        phone: phone || null
    };

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });
        const result = await response.json();

        if (result.success) {
            alert('Registrasi berhasil! Silakan login.');
            window.location.href = 'login.html';
        } else {
            // Tampilkan pesan error dari PostgreSQL Trigger
            errorDiv.innerText = result.message;
            errorDiv.classList.remove('d-none');
        }
    } catch (err) {
        errorDiv.innerText = 'Terjadi kesalahan pada server.';
        errorDiv.classList.remove('d-none');
    }
}
