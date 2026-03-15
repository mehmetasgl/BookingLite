-- V5__Create_room_types_table.sql
-- Otellerin oda tiplerini tutar (Standard, Deluxe, Suite vb.)

CREATE TABLE room_types (
    id BIGSERIAL PRIMARY KEY,
    hotel_id BIGINT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(80) NOT NULL,
    description TEXT,
    capacity_adults INTEGER NOT NULL CHECK (capacity_adults >= 1),
    capacity_children INTEGER NOT NULL DEFAULT 0 CHECK (capacity_children >= 0),
    amenities_json JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_room_types_hotel_id ON room_types(hotel_id);

CREATE INDEX idx_room_types_capacity ON room_types(capacity_adults, capacity_children);

CREATE INDEX idx_room_types_amenities ON room_types USING GIN (amenities_json);

COMMENT ON TABLE room_types IS 'Otel oda tipleri (tek oda tanımı, stok rate_calendar''da)';
COMMENT ON COLUMN room_types.amenities_json IS 'Oda özellikleri JSON formatında: ["WiFi", "TV", "Minibar"]';
