-- TRIGGER 1: MEMERIKSA KETERIKATAN KURSI SEBELUM MENGHAPUS KURSI
DROP TRIGGER IF EXISTS trigger_prevent_delete_assigned_seat ON SEAT;
DROP FUNCTION IF EXISTS fn_prevent_delete_assigned_seat();

CREATE OR REPLACE FUNCTION fn_prevent_delete_assigned_seat()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM HAS_RELATIONSHIP WHERE seat_id = OLD.seat_id
    ) THEN
        RAISE EXCEPTION 'Kursi % - Baris % No. % tidak dapat dihapus karena sudah terisi.',
            OLD.section_name, OLD.row_name, OLD.seat_number;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_delete_assigned_seat
BEFORE DELETE ON SEAT
FOR EACH ROW
EXECUTE FUNCTION fn_prevent_delete_assigned_seat();


-- TRIGGER 2: MEMERIKSA DAN MEMASTIKAN KUOTA KATEGORI TIKET SAAT MEMBUAT TIKET
DROP TRIGGER IF EXISTS trigger_check_ticket_quota ON TICKET;
DROP FUNCTION IF EXISTS fn_check_ticket_quota();

CREATE OR REPLACE FUNCTION fn_check_ticket_quota()
RETURNS TRIGGER AS $$
DECLARE
    v_category_name VARCHAR;
    v_quota INT;
    v_booked INT;
BEGIN
    -- Ambil kuota dan nama kategori tiket
    SELECT category_name, quota INTO v_category_name, v_quota
    FROM TICKET_CATEGORY
    WHERE category_id = NEW.category_id;

    -- Cek jika kategori tidak ditemukan (validasi opsional)
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Kategori tiket tidak ditemukan.';
    END IF;

    -- Hitung jumlah tiket yang sudah terjual untuk kategori tersebut
    SELECT COUNT(*) INTO v_booked
    FROM TICKET
    WHERE category_id = NEW.category_id;

    -- Jika sudah mencapai atau melebihi kuota, batalkan pembuatan tiket baru
    IF v_booked >= v_quota THEN
        RAISE EXCEPTION 'Kuota kategori tiket "%" sudah penuh. Tidak dapat membuat tiket baru.',
            v_category_name;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_ticket_quota
BEFORE INSERT ON TICKET
FOR EACH ROW
EXECUTE FUNCTION fn_check_ticket_quota();
