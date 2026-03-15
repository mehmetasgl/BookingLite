-- V7__Create_reservations_table.sql
-- Müşteri rezervasyonlarını tutar

CREATE TABLE reservations (
    id BIGSERIAL PRIMARY KEY,
    hotel_id BIGINT NOT NULL REFERENCES hotels(id),
    room_type_id BIGINT NOT NULL REFERENCES room_types(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    checkin DATE NOT NULL,
    checkout DATE NOT NULL,
    guests_adults INTEGER NOT NULL CHECK (guests_adults >= 1),
    guests_children INTEGER NOT NULL DEFAULT 0 CHECK (guests_children >= 0),
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED' 
        CHECK (status IN ('CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW')),
    guest_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_dates CHECK (checkout > checkin)
);

CREATE INDEX idx_reservations_user_id ON reservations(user_id, created_at DESC);

CREATE INDEX idx_reservations_hotel_id ON reservations(hotel_id, checkin);

CREATE INDEX idx_reservations_room_type_id ON reservations(room_type_id);

CREATE INDEX idx_reservations_status ON reservations(status);

CREATE INDEX idx_reservations_dates ON reservations(checkin, checkout);

COMMENT ON TABLE reservations IS 'Müşteri rezervasyonları';
COMMENT ON COLUMN reservations.total_price IS 'Toplam ödeme (tüm gecelerin toplamı)';
COMMENT ON COLUMN reservations.status IS 'CONFIRMED: Onaylı, CANCELLED: İptal edildi, COMPLETED: Tamamlandı, NO_SHOW: Gelmedi';
