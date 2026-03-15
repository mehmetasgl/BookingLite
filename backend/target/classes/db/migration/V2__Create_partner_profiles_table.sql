-- V2__Create_partner_profiles_table.sql
-- Partner kullanıcılarının şirket bilgilerini tutar

CREATE TABLE partner_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT false,
    verification_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_partner_profiles_verified ON partner_profiles(verified);

COMMENT ON TABLE partner_profiles IS 'Partner kullanıcılarının şirket bilgileri';
COMMENT ON COLUMN partner_profiles.verified IS 'Admin tarafından onaylandı mı?';
