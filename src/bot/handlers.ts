/**
 * 消息处理器 - 智能回复逻辑
 */
import { Context, Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { config } from '../config';
import { detectKeywordCategory, getKeywordResponse, needsHumanIntervention } from '../templates/keywords';
import { CustomerRepository } from '../db/repository';

// UID 绑定正则
const OKX_UID_REGEX = /okx\s*uid[:\s]*(\d+)/i;
const GATE_UID_REGEX = /gate\s*uid[:\s]*(\d+)/i;

export function registerHandlers(bot: Telegraf<Context>, customerRepo: CustomerRepository): void {
    // 处理文本消息
    bot.on(message('text'), async (ctx) => {
        const text = ctx.message.text;
        const telegramId = ctx.from?.id.toString() || '';

        // 跳过命令
        if (text.startsWith('/')) {
            return;
        }

        // 检查是否是 UID 绑定
        const okxMatch = text.match(OKX_UID_REGEX);
        const gateMatch = text.match(GATE_UID_REGEX);

        if (okxMatch) {
            await handleUidBinding(ctx, customerRepo, telegramId, 'okx', okxMatch[1]);
            return;
        }

        if (gateMatch) {
            await handleUidBinding(ctx, customerRepo, telegramId, 'gate', gateMatch[1]);
            return;
        }

        // 检查是否需要人工介入
        if (needsHumanIntervention(text)) {
            await ctx.reply('您的问题已记录，管理员将尽快回复您！');

            // 通知管理员
            if (config.telegram.adminId) {
                try {
                    await ctx.telegram.sendMessage(
                        config.telegram.adminId,
                        `⚠️ *用户需要人工帮助*\n\n用户：@${ctx.from?.username || telegramId}\n消息：${text}`,
                        { parse_mode: 'Markdown' }
                    );
                } catch (error) {
                    console.error('通知管理员失败:', error);
                }
            }
            return;
        }

        // 关键词智能回复
        const category = detectKeywordCategory(text);
        if (category) {
            await ctx.reply(getKeywordResponse(category), { parse_mode: 'Markdown' });
            return;
        }

        // 默认回复
        await ctx.reply(`
感谢您的消息！

如需帮助，请使用以下命令：
• /register - 获取注册链接
• /rebate - 查询返佣
• /help - 更多帮助

或直接告诉我您想了解的内容~
`, { parse_mode: 'Markdown' });
    });
}

// 处理 UID 绑定
async function handleUidBinding(
    ctx: Context,
    customerRepo: CustomerRepository,
    telegramId: string,
    exchange: 'okx' | 'gate',
    uid: string
): Promise<void> {
    try {
        customerRepo.bindExchangeUid(telegramId, exchange, uid);

        const exchangeName = exchange === 'okx' ? 'OKX' : 'Gate.io';
        const rebateRate = exchange === 'okx' ? '45%' : '80%';

        await ctx.reply(`
✅ *${exchangeName} 账户绑定成功！*

📌 您的 UID：\`${uid}\`
💰 返佣比例：*${rebateRate}*

从现在起，您的每一笔交易都将自动统计返佣！
每日 00:00 会收到返佣通知~

开始愉快地交易吧！🚀
`, { parse_mode: 'Markdown' });

        // 通知管理员
        if (config.telegram.adminId) {
            try {
                await ctx.telegram.sendMessage(
                    config.telegram.adminId,
                    `🎉 *新用户绑定*\n\n用户：@${ctx.from?.username || telegramId}\n交易所：${exchangeName}\nUID：${uid}`,
                    { parse_mode: 'Markdown' }
                );
            } catch (error) {
                console.error('通知管理员失败:', error);
            }
        }
    } catch (error) {
        console.error('绑定 UID 失败:', error);
        await ctx.reply('❌ 绑定失败，请稍后重试或联系管理员');
    }
}
