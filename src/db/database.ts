/**
 * 数据库初始化 - 使用 sql.js (纯 JavaScript SQLite)
 */
import initSqlJs, { Database } from 'sql.js';
import * as fs from 'fs';
import * as path from 'path';
import { config } from '../config';

let db: Database | null = null;

export async function getDatabase(): Promise<Database> {
    if (db) {
        return db;
    }

    // 初始化 sql.js
    const SQL = await initSqlJs();

    // 确保数据目录存在
    const dbDir = path.dirname(config.database.path);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    // 如果数据库文件存在，加载它
    if (fs.existsSync(config.database.path)) {
        const fileBuffer = fs.readFileSync(config.database.path);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }

    // 初始化表结构
    initSchema(db);

    // 保存数据库
    saveDatabase();

    console.log('✅ 数据库初始化成功:', config.database.path);

    return db;
}

function initSchema(database: Database): void {
    database.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id TEXT UNIQUE NOT NULL,
      username TEXT,
      first_name TEXT,
      last_name TEXT,
      okx_uid TEXT,
      gate_uid TEXT,
      preferences TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    
    CREATE TABLE IF NOT EXISTS rebate_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      exchange TEXT NOT NULL,
      trading_volume REAL DEFAULT 0,
      commission REAL DEFAULT 0,
      rebate_amount REAL DEFAULT 0,
      record_date TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_customers_telegram_id ON customers(telegram_id);
    CREATE INDEX IF NOT EXISTS idx_rebate_records_customer_id ON rebate_records(customer_id);
  `);
}

export function saveDatabase(): void {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(config.database.path, buffer);
    }
}

export function closeDatabase(): void {
    if (db) {
        saveDatabase();
        db.close();
        db = null;
        console.log('数据库连接已关闭');
    }
}
