# Moltbot 返佣管家 - 手把手部署教程

本文档将手把手教您如何将 Moltbot 返佣管家系统部署到您的服务器上。即使您没有技术背景，按照以下步骤操作也能轻松完成。

---

## 📋 准备工作

在开始之前，您需要准备：

1.  **一台云服务器**
    *   推荐：阿里云、AWS、腾讯云或 DigitalOcean
    *   配置：2核 CPU / 4GB 内存 (最低 1核/2GB)
    *   系统：Ubuntu 22.04 或 24.04 (推荐)
2.  **SSH 连接工具**
    *   Windows: 使用 PowerShell 或下载 FinalShell / Xshell
    *   Mac: 使用终端 (Terminal)
3.  **Telegram 账号**
4.  **交易所 API 密钥** (OKX 和 Gate.io)

---

## 第一步：连接服务器

1.  打开您的 SSH 工具。
2.  输入服务器 IP 地址、用户名（通常是 `root`）和密码。
3.  成功连接后，您会看到类似 `root@hostname:~#` 的提示符。

---

## 第二步：安装基础环境 (Docker)

Docker 是一个容器化工具，它可以让程序在任何服务器上稳定运行，无需复杂的环境配置。

复制以下命令并在服务器终端执行：

```bash
# 1. 更新系统软件源
apt-get update

# 2. 安装 Docker (一键安装脚本)
curl -fsSL https://get.docker.com | sh

# 3. 启动 Docker 并设置开机自启
systemctl start docker
systemctl enable docker

# 4. 验证安装 (如果显示版本号则安装成功)
docker --version
docker compose version
```

---

## 第三步：部署返佣管家系统

### 1. 创建项目目录

```bash
mkdir -p /opt/moltbot
cd /opt/moltbot
```

### 2. 上传项目文件

如果您是在本地电脑开发，请将 `okx` 文件夹中的所有文件上传到服务器的 `/opt/moltbot` 目录。

或者，您可以直接在服务器上创建核心文件：

**创建 docker-compose.yml**

```bash
nano docker-compose.yml
```

(将项目中的 `docker-compose.yml` 内容复制进去，按 `Ctrl+O` 保存，`Ctrl+X` 退出)

**创建 .env 配置文件**

```bash
nano .env
```

复制以下内容并修改为您自己的信息：

```ini
# Telegram Bot 配置 (从 @BotFather 获取)
TELEGRAM_BOT_TOKEN=您的_Bot_Token

# OKX API 配置 (只读权限)
OKX_API_KEY=您的_OKX_API_Key
OKX_SECRET_KEY=您的_OKX_Secret_Key
OKX_PASSPHRASE=您的_OKX_Passphrase
OKX_BROKER_ID=您的_Broker_ID
OKX_REBATE_RATE=0.45
OKX_REFERRAL_LINK=https://www.okx.com/join/您的邀请码

# Gate.io API 配置 (只读权限)
GATE_API_KEY=您的_Gate_API_Key
GATE_SECRET_KEY=您的_Gate_Secret_Key
GATE_REBATE_RATE=0.85
GATE_REFERRAL_LINK=https://www.gate.io/signup/您的邀请码

# 管理员 ID (从 @userinfobot 获取)
ADMIN_TELEGRAM_ID=您的_Telegram_ID
DATABASE_PATH=./data/rebate.db
```

### 3. 启动服务

在 `/opt/moltbot` 目录下执行：

```bash
# 后台启动服务
docker compose up -d

# 查看运行状态
docker compose ps
```

如果状态显示 `Up`，说明服务启动成功！🎉

---

## 第四步：验证与使用

1.  打开 Telegram，找到您的 Bot。
2.  发送 `/start`，看 Bot 是否回复欢迎语。
3.  发送 `/stats`（需要您的 ID 是管理员 ID），查看系统状态。

---

## 常见问题 (FAQ)

**Q: 只有 root 密码，无法连接 SSH？**
A: 请检查云服务商的安全组设置，确保 **22端口** 是开放的。

**Q: Bot 不回复消息？**
1. 检查 `.env` 中的 `TELEGRAM_BOT_TOKEN` 是否正确。
2. 查看日志排查问题：
   ```bash
   docker compose logs -f
   ```

**Q: 数据存在哪里？**
A: 数据会自动保存在服务器的 `/opt/moltbot/data/rebate.db` 文件中，Docker 重启数据不会丢失。

---

祝您使用愉快！如有问题，请随时联系技术支持。
