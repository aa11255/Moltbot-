/**
 * 关键词匹配规则
 */
import { KeywordCategory } from '../types';

// 关键词配置
export const KEYWORDS: Record<KeywordCategory, string[]> = {
    rebate: ['返佣', '返点', 'rebate', '佣金', '返利', '回扣', 'commission', '提成'],
    fee: ['手续费', '费率', '费用', 'fee', '成本', '贵', '太高', '省钱', '便宜'],
    register: ['注册', '开户', '邀请码', '推荐码', '链接', '开通', 'signup', 'register'],
    help: ['帮助', '怎么', '如何', '什么', 'help', '?', '？', '咨询'],
    price: ['价格', '行情', 'btc', 'eth', '比特币', '以太坊', '涨', '跌'],
};

// 检测消息中的关键词类别
export function detectKeywordCategory(message: string): KeywordCategory | null {
    const lowerMessage = message.toLowerCase();

    for (const [category, keywords] of Object.entries(KEYWORDS) as [KeywordCategory, string[]][]) {
        for (const keyword of keywords) {
            if (lowerMessage.includes(keyword.toLowerCase())) {
                return category;
            }
        }
    }

    return null;
}

// 获取关键词触发的回复
export function getKeywordResponse(category: KeywordCategory): string {
    const responses: Record<KeywordCategory, string> = {
        rebate: `
💰 *关于返佣*

我拥有 OKX 50% 和 Gate.io 85% 的顶级返佣权限！

这意味着您每交易 1000U，可获得：
• OKX：约 0.5U 返还
• Gate.io：约 0.85U 返还

发送 /register 获取专属链接，立即开始享受返佣！
`,
        fee: `
💸 *手续费太贵？*

我来帮您省钱！通过我的渠道：

🔶 OKX：实收手续费降低 50%
🔷 Gate.io：实收手续费降低 85%

日交易 10 万 U，每天可省下 50-85 U！

发送 /register 获取专属链接~
`,
        register: `
📝 *注册指南*

1️⃣ 点击下方链接完成注册
2️⃣ 将您的 UID 发送给我
3️⃣ 开始交易，自动享受返佣！

发送 /register 获取专属链接
`,
        help: `
需要帮助？发送 /help 查看完整帮助信息

或直接告诉我您的问题，我会尽快回复！
`,
        price: `
📈 *行情咨询*

我主要帮您处理返佣相关业务~

想要查看行情，推荐使用交易所 APP 或 TradingView

如需注册低手续费账户，发送 /register
`,
    };

    return responses[category];
}

// 判断是否需要人工介入
export function needsHumanIntervention(message: string): boolean {
    const humanKeywords = ['客服', '人工', '投诉', '问题', '紧急', '出金', '充值'];
    const lowerMessage = message.toLowerCase();

    return humanKeywords.some(keyword => lowerMessage.includes(keyword));
}
