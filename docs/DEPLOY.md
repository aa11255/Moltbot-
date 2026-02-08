# Moltbot 返佣管家 - 部署指南

## 📋 目录

1. [环境要求](#环境要求)
2. [本地开发](#本地开发)
3. [服务器部署](#服务器部署)
4. [Telegram Bot 创建](#telegram-bot-创建)
5. [API 密钥获取](#api-密钥获取)
6. [常见问题](#常见问题)

---

## 环境要求

- Node.js 18+ (推荐 22 LTS)
- npm 或 yarn
- 云服务器 (推荐 2GB+ RAM)

---

## 本地开发

### 1. 克隆项目

```bash
cd d:\360Downloads\zx\接单项目\okx
```

### 2. 安装依赖

```bash
npm install
```

### 3. 运行配置向导

```bash
npm run setup
```

按照提示输入：
- Telegram Bot Token
- OKX API 密钥
- Gate.io API 密钥
- 推广链接

### 4. 启动开发服务

```bash
npm run dev
```

---

## 服务器部署

### 方式一：Docker 部署（推荐）

#### 1. 安装 Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | sh

# 启动 Docker
systemctl start docker
systemctl enable docker
```

#### 2. 上传项目

```bash
# 使用 scp 或 rsync 上传项目
scp -r ./okx root@your-server:/opt/
```

#### 3. 配置环境变量

```bash
cd /opt/okx
cp .env.example .env
nano .env  # 编辑配置
```

#### 4. 启动服务

```bash
docker-compose up -d
```

#### 5. 查看日志

```bash
docker-compose logs -f
```

### 方式二：直接部署

#### 1. 安装 Node.js

```bash
# Ubuntu
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs
```

#### 2. 安装 PM2

```bash
npm install -g pm2
```

#### 3. 部署项目

```bash
cd /opt/okx
npm install
npm run build
```

#### 4. 使用 PM2 启动

```bash
pm2 start dist/index.js --name rebate-bot
pm2 save
pm2 startup  # 设置开机自启
```

---

## Telegram Bot 创建

### 1. 打开 @BotFather

在 Telegram 中搜索 `@BotFather` 并打开对话

### 2. 创建新 Bot

发送命令：`/newbot`

### 3. 设置 Bot 名称

输入显示名称，如：`我的返佣管家`

### 4. 设置 Bot 用户名

输入唯一用户名（必须以 `bot` 结尾），如：`my_rebate_bot`

### 5. 获取 Token

BotFather 会返回一个 Token，格式如：
```
123456789:ABCdefGHIjklMNOpqrSTUvwxYZ
```

复制此 Token 用于配置

### 6. 获取您的 Telegram ID

向 `@userinfobot` 发送任意消息，它会回复您的 User ID

---

## API 密钥获取

### OKX Broker API

1. 登录 [OKX 官网](https://www.okx.com)
2. 进入 **代理商后台** > **API 管理**
3. 创建新的 API Key
4. 权限选择：**只读**（仅需查询权限）
5. 记录 API Key、Secret Key、Passphrase

### Gate.io Broker API

1. 登录 [Gate.io 官网](https://www.gate.io)
2. 进入 **API 管理**
3. 创建 APIv4 密钥
4. 权限选择：**只读**
5. 记录 API Key、Secret Key

---

## 常见问题

### Q: Bot 无响应？

检查：
1. Token 是否正确
2. 服务是否正在运行：`docker-compose ps`
3. 查看日志：`docker-compose logs -f`

### Q: 返佣数据不同步？

检查：
1. API 密钥是否正确
2. API 是否有查询权限
3. 手动测试 API 连接

### Q: 如何更新配置？

```bash
nano .env  # 修改配置
docker-compose restart  # 重启服务
```

---

## 技术支持

遇到问题？请检查日志或联系开发者。
