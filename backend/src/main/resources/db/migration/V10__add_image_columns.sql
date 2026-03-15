-- V7__add_image_columns.sql

ALTER TABLE hotels
ADD COLUMN main_image_url VARCHAR(500),
ADD COLUMN images_json TEXT;

COMMENT ON COLUMN hotels.main_image_url IS 'Ana görsel URL';
COMMENT ON COLUMN hotels.images_json IS 'Ek görseller JSON array';

ALTER TABLE room_types
ADD COLUMN main_image_url VARCHAR(500),
ADD COLUMN images_json TEXT;

COMMENT ON COLUMN room_types.main_image_url IS 'Ana görsel URL';
COMMENT ON COLUMN room_types.images_json IS 'Ek görseller JSON array';
