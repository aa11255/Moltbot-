FROM node:22-alpine

# 安装构建依赖
RUN apk add --no-cache python3 make g++

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源码
COPY . .

# 构建
RUN npm run build

# 创建数据目录
RUN mkdir -p /app/data

# 暴露健康检查端口（可选）
EXPOSE 3000

# 启动命令
CMD ["node", "dist/index.js"]
