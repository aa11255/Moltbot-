/**
 * 交互式配置向导
 * 引导用户填写 API 密钥和基础配置
 */
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

// 颜色输出辅助
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    red: '\x1b[31m',
};

function colorLog(color: keyof typeof colors, text: string): void {
    console.log(`${colors[color]}${text}${colors.reset}`);
}

function printBanner(): void {
    console.log('\n');
    colorLog('cyan', '╔══════════════════════════════════════════════════════════╗');
    colorLog('cyan', '║                                                          ║');
    colorLog('cyan', '║        🤖 Moltbot 返佣管家 - 配置向导                     ║');
    colorLog('cyan', '║                                                          ║');
    colorLog('cyan', '║   OKX 50% 返佣  |  Gate.io 85% 返佣  |  24/7 自动化      ║');
    colorLog('cyan', '║                                                          ║');
    colorLog('cyan', '╚══════════════════════════════════════════════════════════╝');
    console.log('\n');
}

interface ConfigAnswers {
    telegramBotToken: string;
    okxApiKey: string;
    okxSecretKey: string;
    okxPassphrase: string;
    okxBrokerId: string;
    gateApiKey: string;
    gateSecretKey: string;
    okxReferralLink: string;
    gateReferralLink: string;
    adminTelegramId: string;
}

async function question(rl: readline.Interface, prompt: string, isPassword: boolean = false): Promise<string> {
    return new Promise((resolve) => {
        rl.question(`${colors.yellow}${prompt}${colors.reset}`, (answer) => {
            resolve(answer.trim());
        });
    });
}

async function runWizard(): Promise<void> {
    printBanner();

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const answers: ConfigAnswers = {
        telegramBotToken: '',
        okxApiKey: '',
        okxSecretKey: '',
        okxPassphrase: '',
        okxBrokerId: '',
        gateApiKey: '',
        gateSecretKey: '',
        okxReferralLink: '',
        gateReferralLink: '',
        adminTelegramId: '',
    };

    try {
        // Step 1: Telegram 配置
        colorLog('bright', '📱 第一步：Telegram Bot 配置');
        colorLog('blue', '提示：通过 @BotFather 创建 Bot 获取 Token');
        console.log('');
        answers.telegramBotToken = await question(rl, '请输入 Telegram Bot Token: ');
        answers.adminTelegramId = await question(rl, '请输入您的 Telegram User ID (用于接收通知): ');
        console.log('\n');

        // Step 2: OKX 配置
        colorLog('bright', '🔶 第二步：OKX Broker API 配置 (50% 返佣)');
        colorLog('blue', '提示：从 OKX 代理商后台获取 API 密钥');
        console.log('');
        answers.okxApiKey = await question(rl, '请输入 OKX API Key: ');
        answers.okxSecretKey = await question(rl, '请输入 OKX Secret Key: ');
        answers.okxPassphrase = await question(rl, '请输入 OKX Passphrase: ');
        answers.okxBrokerId = await question(rl, '请输入 OKX Broker ID: ');
        answers.okxReferralLink = await question(rl, '请输入 OKX 推广链接 (如 https://www.okx.com/join/XXXX): ');
        console.log('\n');

        // Step 3: Gate.io 配置
        colorLog('bright', '🔷 第三步：Gate.io Broker API 配置 (85% 返佣)');
        colorLog('blue', '提示：从 Gate.io 代理商后台获取 API 密钥');
        console.log('');
        answers.gateApiKey = await question(rl, '请输入 Gate.io API Key: ');
        answers.gateSecretKey = await question(rl, '请输入 Gate.io Secret Key: ');
        answers.gateReferralLink = await question(rl, '请输入 Gate.io 推广链接 (如 https://www.gate.io/signup/XXXX): ');
        console.log('\n');

        // 生成 .env 文件
        const envContent = `# ========================================
# Moltbot 返佣管家 - 环境配置
# 生成时间: ${new Date().toISOString()}
# ========================================

# Telegram Bot 配置
TELEGRAM_BOT_TOKEN=${answers.telegramBotToken}

# OKX Broker API 配置 (50% 返佣)
OKX_API_KEY=${answers.okxApiKey}
OKX_SECRET_KEY=${answers.okxSecretKey}
OKX_PASSPHRASE=${answers.okxPassphrase}
OKX_BROKER_ID=${answers.okxBrokerId}

# Gate.io Broker API 配置 (85% 返佣)
GATE_API_KEY=${answers.gateApiKey}
GATE_SECRET_KEY=${answers.gateSecretKey}

# 数据库配置
DATABASE_PATH=./data/rebate.db

# 返佣比例设置
OKX_REBATE_RATE=0.50
GATE_REBATE_RATE=0.85

# 推广链接
OKX_REFERRAL_LINK=${answers.okxReferralLink}
GATE_REFERRAL_LINK=${answers.gateReferralLink}

# 管理员 Telegram ID
ADMIN_TELEGRAM_ID=${answers.adminTelegramId}
`;

        // 确保 data 目录存在
        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // 写入 .env 文件
        fs.writeFileSync(path.join(process.cwd(), '.env'), envContent);

        console.log('\n');
        colorLog('green', '✅ 配置完成！.env 文件已生成');
        console.log('\n');
        colorLog('bright', '下一步操作:');
        console.log('  1. 运行 npm install 安装依赖');
        console.log('  2. 运行 npm run dev 启动机器人');
        console.log('\n');

        colorLog('cyan', '🚀 祝您返佣业务蒸蒸日上！');
        console.log('\n');

    } catch (error) {
        colorLog('red', `❌ 配置失败: ${error}`);
    } finally {
        rl.close();
    }
}

// 直接运行
runWizard().catch(console.error);
