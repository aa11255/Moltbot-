/**
 * 数据访问层 - Customer Repository
 * 使用 sql.js (安全版本 - 参数化查询)
 */
import { Database } from 'sql.js';
import { getDatabase, saveDatabase } from './database';
import { Customer, ExchangeType } from '../types';

export interface CustomerInput {
    telegramId: string;
    username?: string;
    firstName?: string;
    lastName?: string;
}

export interface CustomerStats {
    exchange: ExchangeType;
    totalVolume: number;
    totalRebate: number;
    recordCount: number;
}

export interface OverallStats {
    totalCustomers: number;
    totalVolume: number;
    totalRebate: number;
    todayNewCustomers: number;
    todayVolume: number;
}

export class CustomerRepository {
    private db: Database | null = null;

    async init(): Promise<void> {
        this.db = await getDatabase();
    }

    private getDb(): Database {
        if (!this.db) {
            throw new Error('数据库未初始化，请先调用 init()');
        }
        return this.db;
    }

    // 输入消毒 - 防止SQL注入
    private sanitizeInput(input: string): string {
        // 只允许数字和字母下划线
        return input.replace(/[^a-zA-Z0-9_@-]/g, '');
    }

    // 新增或更新客户
    upsertCustomer(input: CustomerInput): void {
        const db = this.getDb();

        // 输入验证
        const safeId = this.sanitizeInput(input.telegramId);

        // 先尝试查找 (使用安全查询)
        const stmt = db.prepare('SELECT id FROM customers WHERE telegram_id = ?');
        stmt.bind([safeId]);
        const existing = stmt.step();
        stmt.free();

        if (existing) {
            // 更新
            db.run(`
        UPDATE customers SET
          username = ?,
          first_name = ?,
          last_name = ?,
          updated_at = datetime('now')
        WHERE telegram_id = ?
      `, [input.username || null, input.firstName || null, input.lastName || null, safeId]);
        } else {
            // 插入
            db.run(`
        INSERT INTO customers (telegram_id, username, first_name, last_name)
        VALUES (?, ?, ?, ?)
      `, [safeId, input.username || null, input.firstName || null, input.lastName || null]);
        }

        saveDatabase();
    }

    // 绑定交易所 UID
    bindExchangeUid(telegramId: string, exchange: ExchangeType, uid: string): void {
        const db = this.getDb();
        const safeId = this.sanitizeInput(telegramId);
        const safeUid = this.sanitizeInput(uid);
        const column = exchange === 'okx' ? 'okx_uid' : 'gate_uid';

        db.run(`
      UPDATE customers SET ${column} = ?, updated_at = datetime('now')
      WHERE telegram_id = ?
    `, [safeUid, safeId]);

        saveDatabase();
    }

    // 获取客户信息
    getCustomerByTelegramId(telegramId: string): Customer | null {
        const db = this.getDb();
        const safeId = this.sanitizeInput(telegramId);

        // 使用安全的参数化查询
        const stmt = db.prepare('SELECT * FROM customers WHERE telegram_id = ?');
        stmt.bind([safeId]);

        if (!stmt.step()) {
            stmt.free();
            return null;
        }

        const row = stmt.get();
        const columns = stmt.getColumnNames();
        stmt.free();

        if (!row) return null;

        return {
            id: row[columns.indexOf('id')] as number,
            telegramId: row[columns.indexOf('telegram_id')] as string,
            username: row[columns.indexOf('username')] as string | undefined,
            firstName: row[columns.indexOf('first_name')] as string | undefined,
            lastName: row[columns.indexOf('last_name')] as string | undefined,
            exchange: (row[columns.indexOf('okx_uid')] ? 'okx' : 'gate') as ExchangeType,
            createdAt: new Date(row[columns.indexOf('created_at')] as string),
            updatedAt: new Date(row[columns.indexOf('updated_at')] as string),
        };
    }

    // 获取客户统计
    getCustomerStats(telegramId: string): CustomerStats | null {
        const customer = this.getCustomerByTelegramId(telegramId);
        if (!customer) return null;

        const db = this.getDb();

        // 使用参数化查询
        const stmt = db.prepare(`
      SELECT 
        exchange,
        SUM(trading_volume) as total_volume,
        SUM(rebate_amount) as total_rebate,
        COUNT(*) as record_count
      FROM rebate_records
      WHERE customer_id = ?
      GROUP BY exchange
    `);
        stmt.bind([customer.id]);

        if (!stmt.step()) {
            stmt.free();
            return null;
        }

        const row = stmt.get();
        stmt.free();

        if (!row) return null;

        return {
            exchange: row[0] as ExchangeType,
            totalVolume: (row[1] as number) || 0,
            totalRebate: (row[2] as number) || 0,
            recordCount: (row[3] as number) || 0,
        };
    }

    // 添加返佣记录
    addRebateRecord(
        customerId: number,
        exchange: ExchangeType,
        tradingVolume: number,
        commission: number,
        rebateAmount: number,
        date: string
    ): void {
        const db = this.getDb();

        db.run(`
      INSERT INTO rebate_records (customer_id, exchange, trading_volume, commission, rebate_amount, record_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [customerId, exchange, tradingVolume, commission, rebateAmount, date]);

        saveDatabase();
    }

    // 获取需要通知的客户
    getCustomersWithYesterdayRebate(): Array<{ telegramId: string; rebateAmount: number; volume: number }> {
        const db = this.getDb();
        const result = db.exec(`
      SELECT c.telegram_id, SUM(r.rebate_amount) as rebate, SUM(r.trading_volume) as volume
      FROM customers c
      JOIN rebate_records r ON c.id = r.customer_id
      WHERE r.record_date = date('now', '-1 day')
      GROUP BY c.id
      HAVING rebate > 0
    `);

        if (result.length === 0) return [];

        return result[0].values.map(row => ({
            telegramId: row[0] as string,
            rebateAmount: row[1] as number,
            volume: row[2] as number,
        }));
    }

    // 获取所有绑定了交易所的客户
    getAllBoundCustomers(): Array<{ id: number; telegramId: string; okxUid?: string; gateUid?: string }> {
        const db = this.getDb();
        const result = db.exec(`
      SELECT id, telegram_id, okx_uid, gate_uid FROM customers
      WHERE okx_uid IS NOT NULL OR gate_uid IS NOT NULL
    `);

        if (result.length === 0) return [];

        return result[0].values.map(row => ({
            id: row[0] as number,
            telegramId: row[1] as string,
            okxUid: row[2] as string | undefined,
            gateUid: row[3] as string | undefined,
        }));
    }

    // 获取总体统计
    getOverallStats(): OverallStats {
        const db = this.getDb();

        const totalCustomersResult = db.exec('SELECT COUNT(*) as count FROM customers');
        const totalVolumeResult = db.exec('SELECT SUM(trading_volume) as sum, SUM(rebate_amount) as rebate FROM rebate_records');
        const todayNewResult = db.exec("SELECT COUNT(*) as count FROM customers WHERE date(created_at) = date('now')");
        const todayVolumeResult = db.exec("SELECT SUM(trading_volume) as sum FROM rebate_records WHERE record_date = date('now')");

        return {
            totalCustomers: totalCustomersResult.length > 0 ? (totalCustomersResult[0].values[0][0] as number) || 0 : 0,
            totalVolume: totalVolumeResult.length > 0 ? (totalVolumeResult[0].values[0][0] as number) || 0 : 0,
            totalRebate: totalVolumeResult.length > 0 ? (totalVolumeResult[0].values[0][1] as number) || 0 : 0,
            todayNewCustomers: todayNewResult.length > 0 ? (todayNewResult[0].values[0][0] as number) || 0 : 0,
            todayVolume: todayVolumeResult.length > 0 ? (todayVolumeResult[0].values[0][0] as number) || 0 : 0,
        };
    }
}
