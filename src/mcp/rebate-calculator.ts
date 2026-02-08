/**
 * 返佣计算器
 */
import { config } from '../config';
import { okxApi } from '../exchange/okx';
import { gateApi } from '../exchange/gate';
import { CustomerRepository } from '../db/repository';
import { ExchangeType } from '../types';

export class RebateCalculator {
    private customerRepo: CustomerRepository;

    constructor(customerRepo: CustomerRepository) {
        this.customerRepo = customerRepo;
    }

    // 计算返佣金额
    calculateRebate(tradingVolume: number, exchange: ExchangeType): number {
        // 假设标准手续费率为 0.1%
        const feeRate = 0.001;
        const commission = tradingVolume * feeRate;

        const rebateRate = exchange === 'okx'
            ? config.okx.rebateRate
            : config.gate.rebateRate;

        return commission * rebateRate;
    }

    // 同步 OKX 返佣数据
    async syncOkxRebates(): Promise<{ success: boolean; count: number }> {
        console.log('📊 开始同步 OKX 返佣数据...');

        try {
            const result = await okxApi.getSubAccountCommission();

            if (!result.success || !result.data) {
                console.error('获取 OKX 佣金数据失败:', result.error);
                return { success: false, count: 0 };
            }

            let count = 0;

            for (const record of result.data) {
                // 根据 subAcct 查找对应客户
                const customers = this.customerRepo.getAllBoundCustomers();
                const customer = customers.find(c => c.okxUid === record.subAcct);

                if (customer) {
                    const commission = parseFloat(record.commission);
                    const rebate = commission * config.okx.rebateRate;
                    const date = new Date(parseInt(record.ts)).toISOString().split('T')[0];

                    this.customerRepo.addRebateRecord(
                        customer.id,
                        'okx',
                        commission / 0.001, // 反推交易量
                        commission,
                        rebate,
                        date
                    );
                    count++;
                }
            }

            console.log(`✅ OKX 同步完成，处理 ${count} 条记录`);
            return { success: true, count };
        } catch (error) {
            console.error('OKX 同步失败:', error);
            return { success: false, count: 0 };
        }
    }

    // 同步 Gate.io 返佣数据
    async syncGateRebates(): Promise<{ success: boolean; count: number }> {
        console.log('📊 开始同步 Gate.io 返佣数据...');

        try {
            // 获取最近24小时的数据
            const now = Math.floor(Date.now() / 1000);
            const yesterday = now - 86400;

            const result = await gateApi.getCommissionHistory(yesterday, now);

            if (!result.success || !result.data) {
                console.error('获取 Gate.io 佣金数据失败:', result.error);
                return { success: false, count: 0 };
            }

            let count = 0;

            for (const record of result.data) {
                const customers = this.customerRepo.getAllBoundCustomers();
                const customer = customers.find(c => c.gateUid === record.userId);

                if (customer) {
                    const commission = parseFloat(record.commission);
                    const rebate = commission * config.gate.rebateRate;
                    const date = new Date(record.timestamp * 1000).toISOString().split('T')[0];

                    this.customerRepo.addRebateRecord(
                        customer.id,
                        'gate',
                        commission / 0.001,
                        commission,
                        rebate,
                        date
                    );
                    count++;
                }
            }

            console.log(`✅ Gate.io 同步完成，处理 ${count} 条记录`);
            return { success: true, count };
        } catch (error) {
            console.error('Gate.io 同步失败:', error);
            return { success: false, count: 0 };
        }
    }

    // 同步所有交易所
    async syncAll(): Promise<void> {
        await this.syncOkxRebates();
        await this.syncGateRebates();
    }
}
