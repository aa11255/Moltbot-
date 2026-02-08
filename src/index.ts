/**
 * Moltbot 返佣管家 - 主入口
 */
import { config } from './config';
import { getDatabase, closeDatabase } from './db/database';
import { CustomerRepository } from './db/repository';
import { createBot, startBot } from './bot';
import { RebateCalculator } from './mcp/rebate-calculator';
import { Scheduler } from './mcp/scheduler';

// 打印启动横幅
function printBanner(): void {
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║                                                          ║');
    console.log('║        🤖 Moltbot 返佣管家 v1.0.0                         ║');
    console.log('║                                                          ║');
    console.log('║   OKX 50% 返佣  |  Gate.io 85% 返佣  |  24/7 自动化      ║');
    console.log('║                                                          ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('\n');
}

async function main(): Promise<void> {
    printBanner();

    try {
        // 1. 初始化数据库
        console.log('📦 初始化数据库...');
        await getDatabase();
        const customerRepo = new CustomerRepository();
        await customerRepo.init();

        // 2. 创建 Bot
        console.log('🤖 创建 Telegram Bot...');
        const bot = createBot(customerRepo);

        // 3. 初始化返佣计算器
        console.log('💰 初始化返佣计算器...');
        const rebateCalculator = new RebateCalculator(customerRepo);

        // 4. 启动定时任务
        console.log('⏰ 启动定时任务...');
        const scheduler = new Scheduler(rebateCalculator, customerRepo, bot);
        scheduler.start();

        // 5. 启动 Bot
        await startBot(bot);

        console.log('\n');
        console.log('🚀 系统启动完成！Bot 正在运行中...');
        console.log('   按 Ctrl+C 停止服务');
        console.log('\n');

    } catch (error) {
        console.error('❌ 启动失败:', error);
        process.exit(1);
    }
}

// 优雅退出处理
process.on('SIGINT', () => {
    console.log('\n👋 正在关闭服务...');
    closeDatabase();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 正在关闭服务...');
    closeDatabase();
    process.exit(0);
});

// 启动应用
main();
