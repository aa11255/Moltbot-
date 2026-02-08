/**
 * 环境配置加载
 */
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

export interface Config {
    telegram: {
        botToken: string;
        adminId: string;
    };
    okx: {
        apiKey: string;
        secretKey: string;
        passphrase: string;
        brokerId: string;
        rebateRate: number;
        referralLink: string;
    };
    gate: {
        apiKey: string;
        secretKey: string;
        rebateRate: number;
        referralLink: string;
    };
    database: {
        path: string;
    };
}

export function loadConfig(): Config {
    const requiredEnvVars = ['TELEGRAM_BOT_TOKEN'];

    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            console.error(`❌ 缺少必要的环境变量: ${envVar}`);
            console.error('请运行 npm run setup 进行配置');
            process.exit(1);
        }
    }

    return {
        telegram: {
            botToken: process.env.TELEGRAM_BOT_TOKEN!,
            adminId: process.env.ADMIN_TELEGRAM_ID || '',
        },
        okx: {
            apiKey: process.env.OKX_API_KEY || '',
            secretKey: process.env.OKX_SECRET_KEY || '',
            passphrase: process.env.OKX_PASSPHRASE || '',
            brokerId: process.env.OKX_BROKER_ID || '',
            rebateRate: parseFloat(process.env.OKX_REBATE_RATE || '0.45'),
            referralLink: process.env.OKX_REFERRAL_LINK || '',
        },
        gate: {
            apiKey: process.env.GATE_API_KEY || '',
            secretKey: process.env.GATE_SECRET_KEY || '',
            rebateRate: parseFloat(process.env.GATE_REBATE_RATE || '0.85'),
            referralLink: process.env.GATE_REFERRAL_LINK || '',
        },
        database: {
            path: process.env.DATABASE_PATH || './data/rebate.db',
        },
    };
}

export const config = loadConfig();
