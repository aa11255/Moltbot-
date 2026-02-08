/**
 * 消息模板库
 */
import { MessageContext, ExchangeType } from '../types';

// 欢迎消息
export function getWelcomeMessage(name?: string): string {
    const greeting = name ? `${name}，你好！` : '你好！';
    return `
🤖 *${greeting}欢迎使用智能返佣管家！*

我是您的专属交易成本优化助手。通过我的渠道注册，您可享受：

🔶 *OKX*：高达 *45%* 手续费返还
🔷 *Gate.io*：高达 *80%* 手续费返还

✨ *核心优势*：
• 24小时自动统计交易额
• 每日自动计算返佣
• 主动推送返佣通知
• 不扣发、不延迟

📢 发送 /register 获取专属注册链接
📊 发送 /rebate 查询您的返佣记录
❓ 发送 /help 获取更多帮助
`;
}

// 注册引导消息
export function getRegisterMessage(ctx: MessageContext): string {
    return `
📝 *获取您的专属注册链接*

请选择您想注册的交易所：

🔶 *OKX 交易所*
• 返佣比例：*45%*
• 注册链接：${ctx.referralLink || '暂未配置'}

🔷 *Gate.io 芝麻开门*
• 返佣比例：*80%*
• 注册链接：${ctx.referralLink || '暂未配置'}

💡 *注册后请将您的 UID 发送给我*
我将为您绑定返佣关系，开始自动统计！
`;
}

// 返佣查询结果
export function getRebateMessage(ctx: MessageContext): string {
    const exchangeName = ctx.exchange === 'okx' ? 'OKX' : 'Gate.io';
    return `
📊 *您的返佣统计*

💰 *${exchangeName}* (${ctx.date || '今日'})
• 交易量：*${ctx.volume?.toFixed(2) || '0.00'} USDT*
• 产生手续费：*${((ctx.volume || 0) * 0.001).toFixed(2)} USDT*
• 返佣金额：*${ctx.rebate?.toFixed(2) || '0.00'} USDT*

累计已返：*${ctx.rebate?.toFixed(2) || '0.00'} USDT*

💡 继续交易，返佣自动累积！
`;
}

// 每日返佣通知
export function getDailyNotification(ctx: MessageContext): string {
    return `
📣 *每日返佣通知*

${ctx.customerName || '尊敬的用户'}，您昨日的返佣已统计：

💰 交易量：*${ctx.volume?.toFixed(2) || '0.00'} USDT*
💵 返佣金额：*${ctx.rebate?.toFixed(2) || '0.00'} USDT*

已自动计入您的账户，感谢您的支持！🎉
`;
}

// 帮助消息
export function getHelpMessage(): string {
    return `
❓ *帮助中心*

📌 *常用命令*
/start - 开始使用 / 查看介绍
/register - 获取注册链接
/rebate - 查询返佣记录
/help - 显示帮助信息

📌 *常见问题*

*Q: 如何开始获得返佣？*
A: 通过 /register 获取专属链接注册，然后将您的 UID 发送给我绑定即可。

*Q: 返佣多久到账？*
A: 每日 UTC+8 凌晨 12:00 自动统计昨日返佣，实时推送。

*Q: 如何联系客服？*
A: 直接在此发送消息，我会尽快回复！

💬 还有其他问题？直接发消息给我！
`;
}

// 错误消息
export function getErrorMessage(errorCode?: string): string {
    const messages: Record<string, string> = {
        'API_ERROR': '❌ API 连接失败，请稍后重试',
        'NO_DATA': '📭 暂无返佣记录，开始交易后将自动统计',
        'NOT_REGISTERED': '⚠️ 您尚未绑定账户，请先发送 /register 进行注册',
        'UNKNOWN': '❌ 发生未知错误，请联系管理员',
    };
    return messages[errorCode || 'UNKNOWN'] || messages['UNKNOWN'];
}

// 活动推送模板
export function getActivityMessage(exchangeName: string, activityTitle: string): string {
    return `
🎉 *活动通知*

*${exchangeName}* 开启了新活动：
📢 *${activityTitle}*

配合我的高额返佣渠道，您几乎是零成本参与！

👉 立即查看 /register
`;
}
