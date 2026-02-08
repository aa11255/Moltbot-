/**
 * 统一类型定义
 */

// 交易所类型
export type ExchangeType = 'okx' | 'gate';

// 客户信息
export interface Customer {
    id: number;
    telegramId: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    exchange: ExchangeType;
    referralCode?: string;
    createdAt: Date;
    updatedAt: Date;
    preferences?: CustomerPreferences;
}

// 客户偏好（用于客户画像）
export interface CustomerPreferences {
    favoriteCoins?: string[];
    tradingStyle?: 'spot' | 'futures' | 'both';
    lastActiveAt?: Date;
    notes?: string;
}

// 返佣记录
export interface RebateRecord {
    id: number;
    customerId: number;
    exchange: ExchangeType;
    tradingVolume: number;
    commission: number;
    rebateAmount: number;
    date: Date;
    status: 'pending' | 'paid' | 'failed';
}

// 每日统计
export interface DailyStats {
    date: string;
    exchange: ExchangeType;
    totalVolume: number;
    totalCommission: number;
    totalRebate: number;
    customerCount: number;
}

// 交易所 API 响应
export interface ExchangeApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    code?: string;
}

// OKX 佣金记录
export interface OkxCommissionRecord {
    subAcct: string;
    instFamily: string;
    commission: string;
    ts: string;
}

// Gate.io 佣金记录
export interface GateCommissionRecord {
    userId: string;
    commission: string;
    currency: string;
    timestamp: number;
}

// 消息模板上下文
export interface MessageContext {
    customerName?: string;
    exchange?: ExchangeType;
    volume?: number;
    rebate?: number;
    date?: string;
    referralLink?: string;
}

// Bot 命令列表
export const BOT_COMMANDS = {
    START: 'start',
    REGISTER: 'register',
    REBATE: 'rebate',
    STATS: 'stats',
    HELP: 'help',
} as const;

// 关键词类型
export type KeywordCategory = 'rebate' | 'fee' | 'register' | 'help' | 'price';
