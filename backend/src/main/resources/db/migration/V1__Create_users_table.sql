-- V1__Create_users_table.sql
-- Kullanıcı tablosu: Müşteri, Partner ve Admin kullanıcıları tutar

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('CUSTOMER', 'PARTNER', 'ADMIN')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_users_role ON users(role);

INSERT INTO users (email, password_hash, role, status) VALUES 
('admin@bookinglite.com', '$2a$10$rVqZpGxL8qKH9p0vY5YvNOxKGZ8JzQqC8tKm3x8QYrVgZxH5YvNOx', 'ADMIN', 'ACTIVE');
