/**
 * Telegram Bot 命令处理器
 */
import { Context, Telegraf } from 'telegraf';
import { config } from '../config';
import {
    getWelcomeMessage,
    getRebateMessage,
    getHelpMessage,
} from '../templates/messages';
import { CustomerRepository } from '../db/repository';

export function registerCommands(bot: Telegraf<Context>, customerRepo: CustomerRepository): void {
    // /start 命令 - 欢迎语
    bot.command('start', async (ctx) => {
        const firstName = ctx.from?.first_name;
        const telegramId = ctx.from?.id.toString() || '';

        // 记录新用户
        try {
            customerRepo.upsertCustomer({
                telegramId,
                username: ctx.from?.username,
                firstName: ctx.from?.first_name,
                lastName: ctx.from?.last_name,
            });
        } catch (error) {
            console.error('记录用户失败:', error);
        }

        await ctx.reply(getWelcomeMessage(firstName), { parse_mode: 'Markdown' });
    });

    // /register 命令 - 获取注册链接
    bot.command('register', async (ctx) => {
        const okxLink = config.okx.referralLink;
        const gateLink = config.gate.referralLink;

        const message = `
📝 *获取您的专属注册链接*

请选择您想注册的交易所：

🔶 *OKX 交易所*
• 返佣比例：*45%*
• 注册链接：[点击注册](${okxLink || 'https://www.okx.com'})

🔷 *Gate.io 芝麻开门*
• 返佣比例：*80%*
• 注册链接：[点击注册](${gateLink || 'https://www.gate.io'})

✅ *注册完成后*
请将您的 UID 发送给我，格式如：
\`OKX UID: 12345678\` 或 \`Gate UID: 12345678\`

我将为您绑定返佣关系，开始自动统计！
`;

        await ctx.reply(message, { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } });
    });

    // /rebate 命令 - 查询返佣
    bot.command('rebate', async (ctx) => {
        const telegramId = ctx.from?.id.toString() || '';

        try {
            // 查询用户返佣记录
            const stats = customerRepo.getCustomerStats(telegramId);

            if (!stats) {
                await ctx.reply(`
📭 *暂无返佣记录*

可能的原因：
1. 您尚未绑定交易所 UID
2. 尚无交易记录

👉 发送 /register 获取注册链接并绑定
`, { parse_mode: 'Markdown' });
                return;
            }

            await ctx.reply(getRebateMessage({
                exchange: stats.exchange,
                volume: stats.totalVolume,
                rebate: stats.totalRebate,
                date: '累计',
            }), { parse_mode: 'Markdown' });
        } catch (error) {
            console.error('查询返佣失败:', error);
            await ctx.reply('❌ 查询失败，请稍后重试');
        }
    });

    // /stats 命令 - 管理员统计（仅管理员可用）
    bot.command('stats', async (ctx) => {
        const telegramId = ctx.from?.id.toString() || '';

        if (telegramId !== config.telegram.adminId) {
            await ctx.reply('⚠️ 此命令仅管理员可用');
            return;
        }

        try {
            const overallStats = customerRepo.getOverallStats();

            await ctx.reply(`
📊 *系统统计概览*

👥 总客户数：*${overallStats.totalCustomers}*
💰 总交易量：*${overallStats.totalVolume.toFixed(2)} USDT*
💵 总返佣：*${overallStats.totalRebate.toFixed(2)} USDT*

📅 今日新增：*${overallStats.todayNewCustomers}* 人
📈 今日交易量：*${overallStats.todayVolume.toFixed(2)} USDT*
`, { parse_mode: 'Markdown' });
        } catch (error) {
            console.error('获取统计失败:', error);
            await ctx.reply('❌ 获取统计失败');
        }
    });

    // /help 命令 - 帮助
    bot.command('help', async (ctx) => {
        await ctx.reply(getHelpMessage(), { parse_mode: 'Markdown' });
    });
}
