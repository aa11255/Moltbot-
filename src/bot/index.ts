/**
 * Telegram Bot 入口
 */
import { Telegraf, Context } from 'telegraf';
import { config } from '../config';
import { registerCommands } from './commands';
import { registerHandlers } from './handlers';
import { CustomerRepository } from '../db/repository';

export function createBot(customerRepo: CustomerRepository): Telegraf<Context> {
    const bot = new Telegraf(config.telegram.botToken);

    // 错误处理
    bot.catch((err, ctx) => {
        console.error(`Bot 错误 [${ctx.updateType}]:`, err);
    });

    // 注册命令
    registerCommands(bot, customerRepo);

    // 注册消息处理器
    registerHandlers(bot, customerRepo);

    return bot;
}

export async function startBot(bot: Telegraf<Context>): Promise<void> {
    // 设置命令菜单
    await bot.telegram.setMyCommands([
        { command: 'start', description: '开始使用 / 查看介绍' },
        { command: 'register', description: '获取专属注册链接' },
        { command: 'rebate', description: '查询我的返佣' },
        { command: 'help', description: '帮助中心' },
    ]);

    console.log('🤖 Bot 命令菜单已设置');

    // 启动 Bot
    bot.launch();
    console.log('✅ Telegram Bot 启动成功！');

    // 优雅退出
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
}
