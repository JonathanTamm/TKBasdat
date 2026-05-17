-- TRIGGER 1: MENCEGAH DUPLIKASI VENUE BERDASARKAN NAMA DAN KOTA
DROP TRIGGER IF EXISTS trigger_check_duplicate_venue ON VENUE;
DROP FUNCTION IF EXISTS fn_check_duplicate_venue();

-- Create function untuk cek duplikasi
CREATE OR REPLACE FUNCTION fn_check_duplicate_venue()
RETURNS TRIGGER AS $$
DECLARE
    v_existing_id UUID;
    v_venue_name VARCHAR;
    v_city VARCHAR;
BEGIN
    SELECT venue_id, venue_name, city INTO v_existing_id, v_venue_name, v_city
    FROM VENUE
    WHERE LOWER(venue_name) = LOWER(NEW.venue_name)
      AND LOWER(city) = LOWER(NEW.city)
      AND venue_id != COALESCE(NEW.venue_id, '00000000-0000-0000-0000-000000000000')  
    LIMIT 1;

    -- Jika ada duplikasi, lempar error dengan format persis
    IF FOUND THEN
        RAISE EXCEPTION 'Venue ''%'' di kota ''%'' sudah terdaftar dengan ID %.', 
            NEW.venue_name, NEW.city, v_existing_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger untuk INSERT dan UPDATE
CREATE TRIGGER trigger_check_duplicate_venue
BEFORE INSERT OR UPDATE ON VENUE
FOR EACH ROW
EXECUTE FUNCTION fn_check_duplicate_venue();

-- TRIGGER 2: MENCEGAH HAPUS VENUE AKTIF
DROP TRIGGER IF EXISTS trigger_prevent_delete_active_venue ON VENUE;
DROP FUNCTION IF EXISTS fn_prevent_delete_active_venue();

-- Create function untuk cek event aktif
CREATE OR REPLACE FUNCTION fn_prevent_delete_active_venue()
RETURNS TRIGGER AS $$
DECLARE
    v_active_event_count INT;
    v_venue_name VARCHAR;
BEGIN
    -- Cek apakah ada event dengan event_time >= CURRENT_TIMESTAMP
    SELECT COUNT(*), OLD.venue_name INTO v_active_event_count, v_venue_name
    FROM EVENT
    WHERE venue_id = OLD.venue_id
      AND event_time >= CURRENT_TIMESTAMP;

    -- Jika ada event aktif, lempar error dengan format persis
    IF v_active_event_count > 0 THEN
        RAISE EXCEPTION 'Venue ''%'' masih memiliki event aktif sehingga tidak dapat dihapus.',
            v_venue_name;
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger untuk DELETE
CREATE TRIGGER trigger_prevent_delete_active_venue
BEFORE DELETE ON VENUE
FOR EACH ROW
EXECUTE FUNCTION fn_prevent_delete_active_venue();


-- QUERY TESTING (Jalankan untuk test)


-- Test SELECT semua venue
-- SELECT * FROM VENUE;

-- Test SELECT semua event
-- SELECT * FROM EVENT;

-- Test error duplikasi (uncomment untuk test):
-- INSERT INTO VENUE (venue_name, capacity, address, city) 
-- VALUES ('Bali International Convention Center', 5000, 'Jl. Test', 'Bali');

-- Test error delete active venue (uncomment untuk test):
-- DELETE FROM VENUE WHERE venue_name = 'Bali International Convention Center';

