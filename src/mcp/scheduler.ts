/**
 * 定时任务调度器
 */
import * as cron from 'node-cron';
import { Telegraf, Context } from 'telegraf';
import { RebateCalculator } from './rebate-calculator';
import { CustomerRepository } from '../db/repository';
import { getDailyNotification } from '../templates/messages';
import { config } from '../config';

export class Scheduler {
    private rebateCalculator: RebateCalculator;
    private customerRepo: CustomerRepository;
    private bot: Telegraf<Context>;

    constructor(
        rebateCalculator: RebateCalculator,
        customerRepo: CustomerRepository,
        bot: Telegraf<Context>
    ) {
        this.rebateCalculator = rebateCalculator;
        this.customerRepo = customerRepo;
        this.bot = bot;
    }

    // 启动所有定时任务
    start(): void {
        console.log('⏰ 定时任务调度器启动...');

        // 每日 00:00 (Asia/Shanghai) 同步返佣并发送通知
        cron.schedule('0 0 * * *', async () => {
            console.log('⏰ 开始执行每日返佣同步任务...');
            await this.dailySyncAndNotify();
        }, {
            timezone: 'Asia/Shanghai'
        });

        // 每小时检查一次 API 连接状态
        cron.schedule('0 * * * *', async () => {
            await this.healthCheck();
        });

        console.log('✅ 定时任务已启动');
        console.log('   - 每日 00:00 同步返佣并发送通知');
        console.log('   - 每小时检查 API 状态');
    }

    // 每日同步并通知
    async dailySyncAndNotify(): Promise<void> {
        try {
            // 1. 同步返佣数据
            await this.rebateCalculator.syncAll();

            // 2. 获取有返佣的客户
            const customersWithRebate = this.customerRepo.getCustomersWithYesterdayRebate();

            console.log(`📤 准备发送 ${customersWithRebate.length} 条返佣通知...`);

            // 3. 发送通知
            for (const customer of customersWithRebate) {
                try {
                    const message = getDailyNotification({
                        volume: customer.volume,
                        rebate: customer.rebateAmount,
                    });

                    await this.bot.telegram.sendMessage(customer.telegramId, message, {
                        parse_mode: 'Markdown',
                    });

                    // 避免触发 Telegram 限流
                    await this.delay(100);
                } catch (error) {
                    console.error(`发送通知失败 [${customer.telegramId}]:`, error);
                }
            }

            console.log('✅ 每日通知发送完成');

            // 4. 通知管理员
            if (config.telegram.adminId) {
                const stats = this.customerRepo.getOverallStats();
                await this.bot.telegram.sendMessage(
                    config.telegram.adminId,
                    `📊 *每日统计报告*\n\n` +
                    `👥 总客户数：${stats.totalCustomers}\n` +
                    `💰 今日交易量：${stats.todayVolume.toFixed(2)} USDT\n` +
                    `📤 已发送通知：${customersWithRebate.length} 条`,
                    { parse_mode: 'Markdown' }
                );
            }
        } catch (error) {
            console.error('每日同步任务失败:', error);

            // 通知管理员
            if (config.telegram.adminId) {
                await this.bot.telegram.sendMessage(
                    config.telegram.adminId,
                    `⚠️ *任务异常*\n\n每日同步任务执行失败，请检查日志。`,
                    { parse_mode: 'Markdown' }
                );
            }
        }
    }

    // 健康检查
    async healthCheck(): Promise<void> {
        console.log('🔍 执行健康检查...');

        // 这里可以添加 API 连接测试等
        // 暂时只做日志记录
    }

    // 延迟函数
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 手动触发同步（用于测试）
    async manualSync(): Promise<void> {
        console.log('🔄 手动触发同步...');
        await this.dailySyncAndNotify();
    }
}
