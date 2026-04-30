-- 1. TABEL PENGGUNA (USERS)
CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Organizer', 'Customer')),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20)
);

-- 2. TABEL PROMOSI (PROMOTIONS)
CREATE TABLE Promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promo_code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('Persentase', 'Nominal')),
    discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    usage_limit INT NOT NULL CHECK (usage_limit > 0),
    used_count INT DEFAULT 0,
    CONSTRAINT check_dates CHECK (end_date >= start_date)
);

-- 3. TABEL EVENT
CREATE TABLE Events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    capacity INT NOT NULL,
    location VARCHAR(200) NOT NULL,
    event_date TIMESTAMP NOT NULL,
    has_reserved_seating BOOLEAN DEFAULT FALSE,
    organizer_id UUID REFERENCES Users(id) ON DELETE CASCADE
);

-- 4. TABEL KATEGORI TIKET
CREATE TABLE Ticket_Categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES Events(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    quota INT NOT NULL CHECK (quota > 0),
    price DECIMAL(15, 2) NOT NULL,
    booked INT DEFAULT 0
);

-- 5. TABEL KURSI (SEATS)
CREATE TABLE Seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES Events(id) ON DELETE CASCADE,
    seat_number VARCHAR(10) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE
);

-- 6. TABEL ORDER
CREATE TABLE Orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_status VARCHAR(20) NOT NULL CHECK (payment_status IN ('Pending', 'Lunas', 'Dibatalkan')),
    total_amount DECIMAL(15, 2) NOT NULL,
    customer_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES Events(id) ON DELETE CASCADE,
    promo_id UUID REFERENCES Promotions(id) ON DELETE SET NULL
);

-- 7. TABEL ARTIS (ARTISTS)
CREATE TABLE Artists (
    artist_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    genre VARCHAR(100)
);

--DUMMY DATA

INSERT INTO Users (id, role, username, password, full_name, email, phone) VALUES 
('11111111-1111-1111-1111-111111111111', 'Admin', 'admin', 'password', 'Super Admin', 'admin@tiktaktuk.com', '-'),
('22222222-2222-2222-2222-222222222222', 'Organizer', 'organizer', 'password', 'Del Folks Organizer', 'org@delfolks.com', '08123456789'),
('33333333-3333-3333-3333-333333333333', 'Customer', 'customer', 'password', 'Budi Santoso', 'budi@example.com', '08987654321');

INSERT INTO Promotions (id, promo_code, discount_type, discount_value, start_date, end_date, usage_limit, used_count) VALUES 
('44444444-4444-4444-4444-444444444444', 'TIKTAK20', 'Persentase', 20, '2026-01-01', '2026-12-31', 100, 45),
('55555555-5555-5555-5555-555555555555', 'HEMAT50K', 'Nominal', 50000, '2026-04-01', '2026-05-01', 50, 50);

INSERT INTO Events (id, name, capacity, location, event_date, has_reserved_seating, organizer_id) VALUES 
('66666666-6666-6666-6666-666666666666', 'Konser Melodi Senja', 500, 'Stadion Utama', '2026-08-15 19:00:00', TRUE, '22222222-2222-2222-2222-222222222222'),
('77777777-7777-7777-7777-777777777777', 'Festival Kuliner Nusantara', 2000, 'Alun-alun Kota', '2026-09-01 10:00:00', FALSE, '22222222-2222-2222-2222-222222222222');

INSERT INTO Ticket_Categories (id, event_id, name, quota, price, booked) VALUES 
('88888888-8888-8888-8888-888888888888', '66666666-6666-6666-6666-666666666666', 'VIP', 50, 1500000, 20),
('99999999-9999-9999-9999-999999999999', '66666666-6666-6666-6666-666666666666', 'Festival', 450, 500000, 100);

INSERT INTO Seats (id, event_id, seat_number, is_available) VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '66666666-6666-6666-6666-666666666666', 'A1', TRUE),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '66666666-6666-6666-6666-666666666666', 'A2', TRUE);

INSERT INTO Orders (id, order_date, payment_status, total_amount, customer_id, event_id, promo_id) VALUES 
('cccccccc-cccc-cccc-cccc-cccccccccccc', '2026-04-01 10:00:00', 'Lunas', 3000000, '33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', NULL),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '2026-04-20 11:30:00', 'Pending', 500000, '33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444');

INSERT INTO Artists (artist_id, name, genre) VALUES 
('e1111111-e111-e111-e111-e11111111111', 'Fourtwnty', 'Indie Folk'),
('e2222222-e222-e222-e222-e22222222222', 'Hindia', 'Indie Pop'),
('e3333333-e333-e333-e333-e33333333333', 'Tulus', 'Pop'),
('e4444444-e444-e444-e444-e44444444444', 'Nadin Amizah', 'Folk'),
('e5555555-e555-e555-e555-e55555555555', 'Pamungkas', 'Alternative/Indie'),
('e6666666-e666-e666-e666-e66666666666', 'Raisa', 'Pop'),
('e7777777-e777-e777-e777-e77777777777', 'Dewa 19', 'Rock'),
('e8888888-e888-e888-e888-e88888888888', 'Sheila On 7', 'Pop Rock');
