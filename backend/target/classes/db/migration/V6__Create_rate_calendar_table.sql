-- V6__Create_rate_calendar_table.sql
-- GÜN BAZLI FİYAT VE STOK YÖNETİMİ

CREATE TABLE rate_calendar (
    id BIGSERIAL PRIMARY KEY,
    room_type_id BIGINT NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    available_units INTEGER NOT NULL DEFAULT 0 CHECK (available_units >= 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    min_stay INTEGER DEFAULT 1 CHECK (min_stay >= 1),
    stop_sell BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_room_type_date UNIQUE (room_type_id, date)
);

CREATE INDEX idx_rate_calendar_room_date ON rate_calendar(room_type_id, date);

CREATE INDEX idx_rate_calendar_availability ON rate_calendar(room_type_id, date, available_units)
    WHERE available_units > 0;

COMMENT ON TABLE rate_calendar IS 'Günlük fiyat ve stok yönetimi - Rezervasyon sistemi buradan çalışır';
COMMENT ON COLUMN rate_calendar.available_units IS 'Müsait oda sayısı (her rezervasyonda azalır)';
COMMENT ON COLUMN rate_calendar.min_stay IS 'Minimum konaklama süresi (gün)';
COMMENT ON COLUMN rate_calendar.stop_sell IS 'Bu tarih için satış kapalı mı?';

