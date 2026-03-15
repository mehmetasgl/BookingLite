-- V8__Create_reservation_nights_table.sql
-- Her rezervasyonun gece bazlı fiyat detayını tutar

CREATE TABLE reservation_nights (
    id BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    date DATE NOT NULL,  -- Bu gecenin tarihi
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',

        CONSTRAINT unique_reservation_date UNIQUE (reservation_id, date)
);

CREATE INDEX idx_reservation_nights_reservation_id ON reservation_nights(reservation_id, date);

COMMENT ON TABLE reservation_nights IS 'Rezervasyonun gece bazlı fiyat detayı';
COMMENT ON COLUMN reservation_nights.date IS 'Konaklama gecesi (örn: 1 Ocak gecesi)';
COMMENT ON COLUMN reservation_nights.price IS 'O gece için ödenen fiyat (rezervasyon anındaki fiyat)';

