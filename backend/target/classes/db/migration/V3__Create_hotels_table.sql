-- V3__Create_hotels_table.sql
-- Otellerin temel bilgilerini tutar

CREATE TABLE hotels (
    id BIGSERIAL PRIMARY KEY,
    partner_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address VARCHAR(250) NOT NULL,
    description TEXT,
    checkin_time TIME NOT NULL DEFAULT '14:00:00',
    checkout_time TIME NOT NULL DEFAULT '12:00:00',
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' 
        CHECK (status IN ('DRAFT', 'PUBLISHED', 'SUSPENDED')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hotels_city ON hotels(city);

CREATE INDEX idx_hotels_partner_user_id ON hotels(partner_user_id);

CREATE INDEX idx_hotels_status ON hotels(status);

CREATE INDEX idx_hotels_city_status ON hotels(city, status);

COMMENT ON TABLE hotels IS 'Otellerin temel bilgileri';
COMMENT ON COLUMN hotels.status IS 'DRAFT: Taslak, PUBLISHED: Yayında, SUSPENDED: Askıya alınmış';

