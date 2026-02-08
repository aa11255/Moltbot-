FROM node:22-alpine

# 安装构建依赖
RUN apk add --no-cache python3 make g++

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装所有依赖（包括 devDependencies，用于编译 TypeScript）
RUN npm ci

# 复制源码
COPY . .

# 构建 TypeScript
RUN npm run build

# 移除 devDependencies，只保留生产依赖
RUN npm prune --production

# 创建数据目录
RUN mkdir -p /app/data

# 启动命令
CMD ["node", "dist/index.js"]
