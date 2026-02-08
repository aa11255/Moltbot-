-- 数据库表结构
-- SQLite 版本

-- 客户表
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id TEXT UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    okx_uid TEXT,
    gate_uid TEXT,
    preferences TEXT,  -- JSON 格式存储客户画像
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 返佣记录表
CREATE TABLE IF NOT EXISTS rebate_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    exchange TEXT NOT NULL CHECK(exchange IN ('okx', 'gate')),
    trading_volume REAL DEFAULT 0,
    commission REAL DEFAULT 0,
    rebate_amount REAL DEFAULT 0,
    record_date DATE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'failed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- 对话历史表（长期记忆）
CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    message_type TEXT CHECK(message_type IN ('user', 'bot')),
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- 系统日志表
CREATE TABLE IF NOT EXISTS system_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level TEXT CHECK(level IN ('info', 'warn', 'error')),
    message TEXT,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_customers_telegram_id ON customers(telegram_id);
CREATE INDEX IF NOT EXISTS idx_rebate_records_customer_id ON rebate_records(customer_id);
CREATE INDEX IF NOT EXISTS idx_rebate_records_date ON rebate_records(record_date);
CREATE INDEX IF NOT EXISTS idx_conversations_customer_id ON conversations(customer_id);
