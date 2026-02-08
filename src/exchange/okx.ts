/**
 * OKX Broker API 封装
 */
import axios, { AxiosInstance } from 'axios';
import CryptoJS from 'crypto-js';
import { config } from '../config';
import { ExchangeApiResponse, OkxCommissionRecord } from '../types';

const OKX_API_BASE = 'https://www.okx.com';

export class OkxApi {
    private client: AxiosInstance;
    private apiKey: string;
    private secretKey: string;
    private passphrase: string;

    constructor() {
        this.apiKey = config.okx.apiKey;
        this.secretKey = config.okx.secretKey;
        this.passphrase = config.okx.passphrase;

        this.client = axios.create({
            baseURL: OKX_API_BASE,
            timeout: 10000,
        });
    }

    // 生成签名
    private sign(timestamp: string, method: string, path: string, body: string = ''): string {
        const prehash = timestamp + method + path + body;
        return CryptoJS.enc.Base64.stringify(
            CryptoJS.HmacSHA256(prehash, this.secretKey)
        );
    }

    // 获取请求头
    private getHeaders(method: string, path: string, body: string = ''): Record<string, string> {
        const timestamp = new Date().toISOString();
        const sign = this.sign(timestamp, method, path, body);

        return {
            'OK-ACCESS-KEY': this.apiKey,
            'OK-ACCESS-SIGN': sign,
            'OK-ACCESS-TIMESTAMP': timestamp,
            'OK-ACCESS-PASSPHRASE': this.passphrase,
            'Content-Type': 'application/json',
        };
    }

    // 获取下级用户佣金记录
    async getSubAccountCommission(
        startTime?: string,
        endTime?: string
    ): Promise<ExchangeApiResponse<OkxCommissionRecord[]>> {
        try {
            const path = '/api/v5/broker/nd/rebate-daily';
            const params: Record<string, string> = {};

            if (startTime) params.begin = startTime;
            if (endTime) params.end = endTime;

            const queryString = new URLSearchParams(params).toString();
            const fullPath = queryString ? `${path}?${queryString}` : path;

            const response = await this.client.get(fullPath, {
                headers: this.getHeaders('GET', fullPath),
            });

            if (response.data.code === '0') {
                return {
                    success: true,
                    data: response.data.data,
                };
            } else {
                return {
                    success: false,
                    error: response.data.msg,
                    code: response.data.code,
                };
            }
        } catch (error: any) {
            console.error('OKX API 错误:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // 获取代理商信息
    async getBrokerInfo(): Promise<ExchangeApiResponse<any>> {
        try {
            const path = '/api/v5/broker/nd/info';

            const response = await this.client.get(path, {
                headers: this.getHeaders('GET', path),
            });

            if (response.data.code === '0') {
                return {
                    success: true,
                    data: response.data.data,
                };
            } else {
                return {
                    success: false,
                    error: response.data.msg,
                    code: response.data.code,
                };
            }
        } catch (error: any) {
            console.error('OKX API 错误:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // 获取下级用户列表
    async getSubAccounts(
        page: number = 1,
        limit: number = 100
    ): Promise<ExchangeApiResponse<any[]>> {
        try {
            const path = `/api/v5/broker/nd/subaccount-info?page=${page}&limit=${limit}`;

            const response = await this.client.get(path, {
                headers: this.getHeaders('GET', path),
            });

            if (response.data.code === '0') {
                return {
                    success: true,
                    data: response.data.data,
                };
            } else {
                return {
                    success: false,
                    error: response.data.msg,
                    code: response.data.code,
                };
            }
        } catch (error: any) {
            console.error('OKX API 错误:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // 测试 API 连接
    async testConnection(): Promise<boolean> {
        try {
            const result = await this.getBrokerInfo();
            return result.success;
        } catch {
            return false;
        }
    }
}

export const okxApi = new OkxApi();
