CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    image TEXT,
    game VARCHAR(100) NOT NULL,
    type VARCHAR(100),
    description TEXT,
    nft VARCHAR(44) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации запросов
CREATE INDEX idx_items_nft ON items(nft);
CREATE INDEX idx_items_game ON items(game);
CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_name ON items(name);