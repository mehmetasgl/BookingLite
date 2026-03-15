-- V9__Create_audit_log_table.sql
-- Sistem değişikliklerini izlemek için log tablosu

CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    actor_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    entity VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    action VARCHAR(20) NOT NULL,
    payload_json JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_actor ON audit_log(actor_user_id, created_at DESC);

CREATE INDEX idx_audit_log_entity ON audit_log(entity, entity_id, created_at DESC);

CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

CREATE INDEX idx_audit_log_payload ON audit_log USING GIN (payload_json);

COMMENT ON TABLE audit_log IS 'Sistem değişiklik logları (kim, ne, ne zaman?)';
COMMENT ON COLUMN audit_log.payload_json IS 'Değişiklik detayları: {"old": {...}, "new": {...}}';


