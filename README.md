# 🎮 智能设备控制系统 (Smart Device Control System)

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-green.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.72.6-61DAFB.svg)
![NestJS](https://img.shields.io/badge/NestJS-10.0.0-E0234E.svg)

**一个基于React Native和NestJS的智能硬件控制平台**

[功能特性](#-功能特性) • [快速开始](#-快速开始) • [系统架构](#-系统架构) • [开发文档](#-开发文档) • [部署指南](#-部署指南)

</div>

---

## 📖 项目简介

智能设备控制系统是一个创新的移动应用平台，通过蓝牙BLE技术连接和控制智能硬件设备，结合虚拟角色互动、音频分析和剧情体验，为用户提供沉浸式的交互体验。

### 🎯 核心特点

- **🔗 智能连接** - 快速扫描和连接BLE设备，稳定可靠的通信
- **👤 虚拟互动** - Live2D角色系统，丰富的交互体验
- **🎵 音频联动** - 实时音频分析，智能震动反馈
- **📖 剧情体验** - 交互式剧情系统，个性化内容
- **☁️ 云端同步** - 数据云端备份，多设备同步
- **🔐 安全可靠** - 端到端加密，隐私保护

## ✨ 功能特性

### 移动端功能
- ✅ 跨平台支持 (iOS/Android)
- ✅ 蓝牙设备扫描与连接
- ✅ 实时设备状态监控
- ✅ 双通道独立控制
- ✅ 预设模式和自定义模式
- ✅ 音频文件导入与解析
- ✅ 实时音频捕捉
- ✅ Live2D角色展示
- ✅ 交互式剧情系统
- ✅ 用户账户管理
- ✅ 深色/浅色主题切换

### 后端功能
- ✅ 微服务架构
- ✅ RESTful API
- ✅ WebSocket实时通信
- ✅ JWT认证授权
- ✅ OAuth社交登录
- ✅ 数据缓存优化
- ✅ 消息队列处理
- ✅ 文件存储服务
- ✅ API文档自动生成
- ✅ 监控和日志系统

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- React Native开发环境
- Docker & Docker Compose
- iOS: Xcode 14+ (仅Mac)
- Android: Android Studio

### 安装步骤

#### 1️⃣ 克隆项目
```bash
git clone https://github.com/your-org/smart-device-control.git
cd smart-device-control
```

#### 2️⃣ 安装前端依赖
```bash
# 安装依赖
npm install

# iOS额外步骤
cd ios && pod install && cd ..
```

#### 3️⃣ 配置后端环境
```bash
cd backend

# 安装依赖
npm install

# 复制环境配置
cp .env.example .env

# 启动Docker服务
docker-compose up -d
```

#### 4️⃣ 运行项目

**前端运行**
```bash
# 启动Metro
npm start

# 运行iOS
npm run ios

# 运行Android
npm run android
```

**后端运行**
```bash
cd backend

# 开发模式
npm run start:dev

# 生产模式
npm run start:prod
```

## 🏗️ 系统架构

```
┌──────────────────────────────────────────┐
│            客户端应用层                    │
│   iOS App  │  Android App  │  Web Admin  │
└──────────────────────────────────────────┘
                    ↕
┌──────────────────────────────────────────┐
│             API网关层                     │
│     认证 │ 路由 │ 限流 │ 负载均衡         │
└──────────────────────────────────────────┘
                    ↕
┌──────────────────────────────────────────┐
│            微服务层                        │
│  Auth │ User │ Device │ Content │ Audio  │
└──────────────────────────────────────────┘
                    ↕
┌──────────────────────────────────────────┐
│            数据存储层                      │
│  MySQL │ MongoDB │ Redis │ MinIO         │
└──────────────────────────────────────────┘
```

### 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端** | React Native | 跨平台移动应用框架 |
| **状态管理** | Redux Toolkit | 应用状态管理 |
| **UI框架** | React Native Paper | Material Design组件库 |
| **导航** | React Navigation | 路由和导航管理 |
| **后端** | NestJS | 企业级Node.js框架 |
| **API** | REST + GraphQL | API设计规范 |
| **实时通信** | Socket.io | WebSocket实时通信 |
| **数据库** | MySQL + MongoDB | 混合数据存储 |
| **缓存** | Redis | 高性能缓存 |
| **消息队列** | RabbitMQ | 异步消息处理 |
| **文件存储** | MinIO | S3兼容对象存储 |
| **容器化** | Docker | 容器化部署 |
| **监控** | Prometheus + Grafana | 系统监控 |

## 📚 项目文档

### 开发文档
- [开发指南](./DEVELOPMENT.md) - 详细的开发文档
- [API文档](http://localhost:3000/api/docs) - Swagger API文档
- [设计文档](./docs/README.md) - 产品设计文档

### 项目结构
```
etouch/
├── src/                    # React Native前端源码
│   ├── components/        # 可复用组件
│   ├── screens/          # 页面组件
│   ├── navigation/       # 路由配置
│   ├── services/         # 业务服务
│   ├── store/           # Redux状态管理
│   └── utils/           # 工具函数
├── backend/               # NestJS后端源码
│   ├── apps/            # 微服务应用
│   ├── libs/            # 共享库
│   └── docker-compose.yml # Docker配置
├── docs/                  # 项目文档
├── ios/                   # iOS原生代码
├── android/              # Android原生代码
└── package.json          # 项目配置
```

## 🔧 配置说明

### 环境变量配置

创建 `.env` 文件：
```env
# API配置
API_BASE_URL=http://localhost:3000
WS_URL=ws://localhost:3000

# 数据库配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MONGODB_URI=mongodb://localhost:27017

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

## 🚢 部署指南

### Docker部署

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 生产环境部署

1. **服务器要求**
   - CPU: 4核+
   - 内存: 8GB+
   - 存储: 50GB+
   - OS: Ubuntu 20.04 LTS

2. **部署步骤**
   ```bash
   # 1. 更新系统
   sudo apt update && sudo apt upgrade

   # 2. 安装Docker
   curl -fsSL https://get.docker.com | sh

   # 3. 部署应用
   docker-compose -f docker-compose.prod.yml up -d

   # 4. 配置Nginx
   sudo nginx -s reload
   ```

## 🧪 测试

```bash
# 运行单元测试
npm test

# 运行端到端测试
npm run test:e2e

# 生成测试覆盖率报告
npm run test:cov
```

## 📊 性能指标

- 应用启动时间: < 3秒
- API响应时间: < 100ms
- WebSocket延迟: < 50ms
- 内存占用: < 200MB
- 崩溃率: < 0.1%

## 🤝 贡献指南

我们欢迎所有形式的贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解如何参与项目。

### 提交规范
```bash
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
chore: 构建/辅助工具
```

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](./LICENSE) 文件了解详情

## 🙏 致谢

感谢以下开源项目：
- [React Native](https://reactnative.dev/)
- [NestJS](https://nestjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Docker](https://www.docker.com/)

## 📮 联系我们

- 📧 Email: contact@smartdevice.com
- 🌐 Website: https://smartdevice.com
- 📱 Discord: [加入我们的社区](https://discord.gg/smartdevice)

---

<div align="center">
Made with ❤️ by Smart Device Team
</div>