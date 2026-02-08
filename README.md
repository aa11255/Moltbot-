# Moltbot (Clawdbot) 返佣管家

🤖 基于 Moltbot (Clawdbot) 的 OKX/Gate.io 高返佣自动化客户管理系统

## ✨ 核心功能

- **24/7 智能客服**：Telegram Bot 自动回复客户咨询
- **自动返佣统计**：对接交易所 API，实时计算返佣
- **每日推送通知**：自动发送返佣报告给客户
- **客户画像管理**：长期记忆，精准营销
- **关键词智能回复**：识别"返佣"、"手续费"等关键词自动响应

## 💰 返佣比例

| 交易所 | 返佣比例 |
|--------|----------|
| OKX    | 45%      |
| Gate.io| 85%      |

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置向导

```bash
npm run setup
```

按照提示输入 Telegram Bot Token 和交易所 API 密钥

### 3. 启动服务

```bash
npm run dev
```

## 📦 Docker 部署

```bash
docker-compose up -d
```

## 📖 命令列表

| 命令 | 说明 |
|------|------|
| `/start` | 开始使用 / 查看介绍 |
| `/register` | 获取专属注册链接 |
| `/rebate` | 查询我的返佣 |
| `/help` | 帮助中心 |

## 📁 项目结构

```
okx/
├── src/
│   ├── bot/          # Telegram Bot 模块
│   ├── config/       # 配置管理
│   ├── db/           # 数据库操作
│   ├── exchange/     # 交易所 API
│   ├── mcp/          # 返佣计算器
│   ├── setup/        # 配置向导
│   ├── templates/    # 消息模板
│   ├── types/        # 类型定义
│   └── index.ts      # 入口文件
├── docs/             # 文档
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## 📄 License

MIT
