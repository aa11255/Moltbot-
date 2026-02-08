/**
 * Gate.io Broker API 封装
 */
import axios, { AxiosInstance } from 'axios';
import CryptoJS from 'crypto-js';
import { config } from '../config';
import { ExchangeApiResponse, GateCommissionRecord } from '../types';

const GATE_API_BASE = 'https://api.gateio.ws';
const API_PREFIX = '/api/v4';

export class GateApi {
    private client: AxiosInstance;
    private apiKey: string;
    private secretKey: string;

    constructor() {
        this.apiKey = config.gate.apiKey;
        this.secretKey = config.gate.secretKey;

        this.client = axios.create({
            baseURL: GATE_API_BASE,
            timeout: 10000,
        });
    }

    // 生成签名 (Gate.io V4 签名方式)
    private sign(
        method: string,
        path: string,
        queryString: string,
        body: string,
        timestamp: string
    ): string {
        // 计算 body hash
        const bodyHash = CryptoJS.SHA512(body).toString(CryptoJS.enc.Hex);

        // 构建签名字符串
        const signString = `${method}\n${path}\n${queryString}\n${bodyHash}\n${timestamp}`;

        // 使用 HMAC-SHA512 签名
        return CryptoJS.HmacSHA512(signString, this.secretKey).toString(CryptoJS.enc.Hex);
    }

    // 获取请求头
    private getHeaders(
        method: string,
        path: string,
        queryString: string = '',
        body: string = ''
    ): Record<string, string> {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const sign = this.sign(method, path, queryString, body, timestamp);

        return {
            'KEY': this.apiKey,
            'SIGN': sign,
            'Timestamp': timestamp,
            'Content-Type': 'application/json',
        };
    }

    // 获取代理商佣金历史
    async getCommissionHistory(
        from?: number,
        to?: number,
        limit: number = 100
    ): Promise<ExchangeApiResponse<GateCommissionRecord[]>> {
        try {
            const path = `${API_PREFIX}/rebate/broker/commission_history`;
            const params: Record<string, string> = { limit: limit.toString() };

            if (from) params.from = from.toString();
            if (to) params.to = to.toString();

            const queryString = new URLSearchParams(params).toString();
            const fullUrl = queryString ? `${path}?${queryString}` : path;

            const response = await this.client.get(fullUrl, {
                headers: this.getHeaders('GET', path, queryString),
            });

            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            console.error('Gate.io API 错误:', error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message,
            };
        }
    }

    // 获取代理商交易历史
    async getTransactionHistory(
        from?: number,
        to?: number,
        limit: number = 100
    ): Promise<ExchangeApiResponse<any[]>> {
        try {
            const path = `${API_PREFIX}/rebate/broker/transaction_history`;
            const params: Record<string, string> = { limit: limit.toString() };

            if (from) params.from = from.toString();
            if (to) params.to = to.toString();

            const queryString = new URLSearchParams(params).toString();
            const fullUrl = queryString ? `${path}?${queryString}` : path;

            const response = await this.client.get(fullUrl, {
                headers: this.getHeaders('GET', path, queryString),
            });

            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            console.error('Gate.io API 错误:', error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message,
            };
        }
    }

    // 获取账户信息 (用于测试连接)
    async getAccountInfo(): Promise<ExchangeApiResponse<any>> {
        try {
            const path = `${API_PREFIX}/wallet/total_balance`;

            const response = await this.client.get(path, {
                headers: this.getHeaders('GET', path),
            });

            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            console.error('Gate.io API 错误:', error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message,
            };
        }
    }

    // 测试 API 连接
    async testConnection(): Promise<boolean> {
        try {
            const result = await this.getAccountInfo();
            return result.success;
        } catch {
            return false;
        }
    }
}

export const gateApi = new GateApi();
