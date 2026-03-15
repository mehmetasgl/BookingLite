-- V4__Create_hotel_media_table.sql
-- Otel fotoğraf ve videolarının URL'lerini tutar

CREATE TABLE hotel_media (
    id BIGSERIAL PRIMARY KEY,
    hotel_id BIGINT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('PHOTO', 'VIDEO')),
    url VARCHAR(500) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_cover BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hotel_media_hotel_id_sort ON hotel_media(hotel_id, sort_order);

CREATE INDEX idx_hotel_media_cover ON hotel_media(hotel_id, is_cover) WHERE is_cover = true;

COMMENT ON TABLE hotel_media IS 'Otel görsel ve video URL''leri (object storage''da tutuluyor)';
COMMENT ON COLUMN hotel_media.url IS 'Object storage''daki tam URL';
COMMENT ON COLUMN hotel_media.sort_order IS 'Gösterim sırası (0''dan başlar)';
COMMENT ON COLUMN hotel_media.is_cover IS 'Kapak görseli mi?';
