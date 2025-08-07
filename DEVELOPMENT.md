# 🚀 智能设备控制系统 - 开发文档

## 📋 目录

1. [项目概述](#项目概述)
2. [快速开始](#快速开始)
3. [项目结构](#项目结构)
4. [技术架构](#技术架构)
5. [开发指南](#开发指南)
6. [API规范](#api规范)
7. [数据库设计](#数据库设计)
8. [部署指南](#部署指南)
9. [测试策略](#测试策略)
10. [常见问题](#常见问题)

---

## 📝 项目概述

### 项目简介
智能设备控制系统是一个基于React Native + NestJS的全栈应用，用于控制智能硬件设备，提供虚拟角色互动、音频联动等沉浸式体验。

### 核心功能
- 🔗 **蓝牙设备管理** - BLE设备扫描、连接、控制
- 👤 **虚拟角色系统** - Live2D角色展示与互动
- 🎵 **音频处理** - 实时音频分析与设备联动
- 📖 **剧情系统** - 交互式剧情体验
- 🔐 **用户系统** - 完整的认证授权体系

### 技术栈概览

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| **前端** | React Native 0.72 | 跨平台移动应用 |
| **状态管理** | Redux Toolkit | 全局状态管理 |
| **导航** | React Navigation 6 | 页面路由管理 |
| **后端** | NestJS 10 | Node.js企业级框架 |
| **数据库** | MySQL + MongoDB | 混合数据存储 |
| **缓存** | Redis | 高速缓存 |
| **消息队列** | RabbitMQ | 异步消息处理 |
| **实时通信** | Socket.io | WebSocket通信 |
| **对象存储** | MinIO | 文件存储服务 |

---

## 🚀 快速开始

### 环境要求

```bash
# 必需环境
Node.js >= 16.0.0
npm >= 8.0.0
React Native CLI
Android Studio / Xcode

# 后端依赖
Docker Desktop
Docker Compose

# 推荐IDE
VS Code + 推荐插件
```

### 安装步骤

#### 1. 克隆项目
```bash
git clone https://github.com/your-org/smart-device-control.git
cd smart-device-control
```

#### 2. 前端设置
```bash
# 安装依赖
npm install

# iOS设置 (仅Mac)
cd ios && pod install && cd ..

# 启动Metro
npm start

# 运行应用
npm run ios     # iOS
npm run android # Android
```

#### 3. 后端设置
```bash
cd backend

# 安装依赖
npm install

# 复制环境配置
cp .env.example .env
# 编辑.env文件，配置必要的环境变量

# 启动Docker服务
docker-compose up -d

# 启动开发服务器
npm run start:dev
```

#### 4. 验证安装
- 前端: http://localhost:8081 (Metro Bundler)
- 后端API: http://localhost:3000
- API文档: http://localhost:3000/api/docs
- RabbitMQ: http://localhost:15672 (admin/password)
- MinIO: http://localhost:9001 (admin/password123)

---

## 📁 项目结构

### 整体结构
```
etouch/
├── 📱 src/                    # React Native前端源码
├── 🖥️ backend/                # NestJS后端源码
├── 📚 docs/                   # 项目文档
├── 🔧 scripts/               # 构建和部署脚本
└── 📋 配置文件               # 项目配置

```

### 前端结构
```
src/
├── components/               # 可复用组件
│   ├── common/              # 通用组件
│   ├── device/              # 设备相关组件
│   ├── navigation/          # 导航组件
│   └── ui/                  # UI基础组件
├── screens/                  # 页面组件
│   ├── CharacterScreen.tsx  # 角色展示页
│   ├── ExperienceScreen.tsx # 沉浸体验页
│   ├── ControlScreen.tsx    # 控制界面
│   └── ProfileScreen.tsx    # 个人中心
├── navigation/              # 路由配置
│   └── AppNavigator.tsx    # 主导航器
├── services/                # 业务服务
│   ├── api/               # API调用
│   ├── bluetooth/          # 蓝牙服务
│   └── audio/             # 音频处理
├── store/                   # Redux状态管理
│   ├── slices/            # 状态切片
│   └── index.ts           # Store配置
├── contexts/                # React Context
│   ├── ThemeContext.tsx   # 主题管理
│   └── BleContext.tsx     # 蓝牙状态
├── hooks/                   # 自定义Hooks
├── utils/                   # 工具函数
├── types/                   # TypeScript类型
└── assets/                  # 静态资源
    ├── images/            # 图片
    ├── fonts/             # 字体
    └── animations/        # 动画
```

### 后端结构
```
backend/
├── apps/                    # 微服务应用
│   ├── gateway/            # API网关
│   ├── auth-service/       # 认证服务
│   ├── device-service/     # 设备服务
│   ├── content-service/    # 内容服务
│   └── audio-service/      # 音频服务
├── libs/                    # 共享库
│   └── common/             # 公共模块
│       ├── database/       # 数据库配置
│       ├── entities/       # 数据实体
│       ├── schemas/        # MongoDB模式
│       ├── dto/           # 数据传输对象
│       ├── guards/        # 守卫
│       ├── interceptors/  # 拦截器
│       └── utils/         # 工具函数
├── scripts/                # 脚本文件
├── docker/                 # Docker配置
└── test/                   # 测试文件
```

---

## 🏗️ 技术架构

### 系统架构图
```
┌─────────────────────────────────────────────────┐
│                  客户端层                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   iOS    │  │ Android  │  │   Web    │    │
│  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────┐
│                 API 网关层                       │
│         (认证/路由/限流/负载均衡)                 │
└─────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────┐
│                 微服务层                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│  │Auth     │ │Device   │ │Content  │         │
│  │Service  │ │Service  │ │Service  │         │
│  └─────────┘ └─────────┘ └─────────┘         │
│  ┌─────────┐ ┌─────────┐                     │
│  │Audio    │ │User     │                     │
│  │Service  │ │Service  │                     │
│  └─────────┘ └─────────┘                     │
└─────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────┐
│                 数据层                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│  │ MySQL   │ │MongoDB  │ │ Redis   │         │
│  └─────────┘ └─────────┘ └─────────┘         │
│  ┌─────────┐ ┌─────────┐                     │
│  │RabbitMQ │ │ MinIO   │                     │
│  └─────────┘ └─────────┘                     │
└─────────────────────────────────────────────────┘
```

### 微服务通信

```yaml
通信方式:
  同步通信:
    - TCP: 微服务间直接调用
    - HTTP/REST: 外部API调用
    - gRPC: 高性能内部通信
    
  异步通信:
    - RabbitMQ: 消息队列
    - Redis Pub/Sub: 事件广播
    - WebSocket: 实时推送
```

---

## 💻 开发指南

### 开发规范

#### 代码风格
```typescript
// ✅ 好的命名
const getUserById = async (userId: string): Promise<User> => {
  // 实现
};

// ❌ 避免的命名
const get_data = (id) => {
  // 实现
};
```

#### 文件命名
- **组件**: PascalCase (UserProfile.tsx)
- **工具函数**: camelCase (formatDate.ts)
- **常量**: UPPER_SNAKE_CASE (API_ENDPOINTS.ts)
- **样式**: kebab-case (user-profile.module.css)

#### Git提交规范
```bash
# 格式: <type>(<scope>): <subject>

feat(auth): add OAuth login support
fix(device): resolve connection timeout issue
docs(api): update API documentation
style(ui): format code with prettier
refactor(bluetooth): optimize scanning logic
test(user): add unit tests for user service
chore(deps): update dependencies
```

### 前端开发

#### 创建新页面
```typescript
// src/screens/NewScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

const NewScreen: React.FC = () => {
  const { colors } = useTheme();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        New Screen
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default NewScreen;
```

#### 状态管理
```typescript
// src/store/slices/exampleSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ExampleState {
  data: any[];
  loading: boolean;
  error: string | null;
}

const initialState: ExampleState = {
  data: [],
  loading: false,
  error: null,
};

const exampleSlice = createSlice({
  name: 'example',
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<any[]>) => {
      state.data = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setData, setLoading, setError } = exampleSlice.actions;
export default exampleSlice.reducer;
```

#### API调用
```typescript
// src/services/api/userApi.ts
import axios from 'axios';
import { API_BASE_URL } from '../../constants/config';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API方法
export const userApi = {
  login: (credentials: LoginDto) => 
    api.post('/auth/login', credentials),
    
  getProfile: () => 
    api.get('/users/profile'),
    
  updateProfile: (data: UpdateProfileDto) => 
    api.patch('/users/profile', data),
};
```

### 后端开发

#### 创建新的微服务
```bash
# 使用NestJS CLI创建新服务
nest g app new-service

# 创建控制器
nest g controller users

# 创建服务
nest g service users

# 创建模块
nest g module users
```

#### 控制器示例
```typescript
// apps/gateway/src/modules/users/users.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards,
  ValidationPipe 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CurrentUser } from '../../decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: User) {
    return this.usersService.findById(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new user' })
  async create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
```

#### 服务示例
```typescript
// apps/gateway/src/modules/users/users.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { User } from '@app/common/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    @Inject('USER_SERVICE')
    private readonly userClient: ClientProxy,
  ) {}

  async findById(id: string): Promise<User> {
    // 尝试从缓存获取
    const cached = await this.cacheManager.get<User>(`user:${id}`);
    if (cached) return cached;

    // 从数据库获取
    const user = await this.userRepository.findOne({ where: { id } });
    
    // 缓存结果
    if (user) {
      await this.cacheManager.set(`user:${id}`, user, 3600);
    }
    
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }
}
```

#### 数据验证DTO
```typescript
// apps/gateway/src/modules/users/dto/create-user.dto.ts
import { 
  IsEmail, 
  IsString, 
  MinLength, 
  MaxLength,
  IsOptional,
  Matches 
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'johndoe' })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers and underscores',
  })
  username: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain uppercase, lowercase, number and special character',
  })
  password: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/)
  phone?: string;
}
```

---

## 📡 API规范

### RESTful API设计

#### 端点命名
```
GET    /api/v1/users          # 获取用户列表
GET    /api/v1/users/:id      # 获取单个用户
POST   /api/v1/users          # 创建用户
PUT    /api/v1/users/:id      # 更新用户(完整)
PATCH  /api/v1/users/:id      # 更新用户(部分)
DELETE /api/v1/users/:id      # 删除用户
```

#### 响应格式
```typescript
// 成功响应
{
  "success": true,
  "data": {
    // 实际数据
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0"
  }
}

// 错误响应
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found",
    "details": {
      // 额外错误信息
    }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "path": "/api/v1/users/123"
  }
}

// 分页响应
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### HTTP状态码使用
```
200 OK              # 成功
201 Created         # 创建成功
204 No Content      # 删除成功
400 Bad Request     # 请求错误
401 Unauthorized    # 未认证
403 Forbidden       # 无权限
404 Not Found       # 资源不存在
409 Conflict        # 冲突(如重复)
422 Unprocessable   # 验证失败
429 Too Many        # 请求过多
500 Internal Error  # 服务器错误
```

### WebSocket事件

#### 事件命名规范
```typescript
// 格式: namespace:action:status
'device:command:send'      // 发送设备命令
'device:status:update'     // 设备状态更新
'audio:stream:start'       // 开始音频流
'user:presence:change'     // 用户在线状态变化
```

#### 事件数据格式
```typescript
interface SocketEvent {
  event: string;
  data: any;
  timestamp: string;
  metadata?: {
    userId?: string;
    deviceId?: string;
    sessionId?: string;
  };
}
```

---

## 🗄️ 数据库设计

### MySQL表结构

#### users表
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'premium', 'admin') DEFAULT 'user',
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_status (status)
);
```

#### devices表
```sql
CREATE TABLE devices (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  device_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  mac_address VARCHAR(17) UNIQUE NOT NULL,
  model VARCHAR(50) NOT NULL,
  firmware_version VARCHAR(20),
  status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
  last_connected_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_device_id (device_id)
);
```

### MongoDB Schema

#### Device Schema
```javascript
{
  _id: ObjectId,
  deviceId: String,
  userId: String,
  settings: {
    autoConnect: Boolean,
    vibrationIntensity: Number,
    channelAEnabled: Boolean,
    channelBEnabled: Boolean
  },
  metrics: {
    totalUsageTime: Number,
    lastActiveAt: Date,
    dailyUsage: [{
      date: Date,
      duration: Number,
      sessions: Number
    }]
  },
  connectionHistory: [{
    connectedAt: Date,
    disconnectedAt: Date,
    duration: Number
  }],
  commands: [{
    command: String,
    params: Object,
    sentAt: Date,
    status: String
  }]
}
```

### Redis键设计

```
# 用户会话
session:{userId}:{sessionId}

# 设备状态
device:status:{deviceId}

# 缓存数据
cache:user:{userId}
cache:device:{deviceId}

# 实时数据
realtime:audio:{deviceId}
realtime:metrics:{deviceId}

# 限流计数
ratelimit:{userId}:{endpoint}

# 在线状态
online:users -> Set
online:devices -> Set
```

---

## 🚢 部署指南

### Docker部署

#### 构建镜像
```bash
# 构建所有服务
docker-compose build

# 构建单个服务
docker-compose build gateway
```

#### 启动服务
```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f gateway

# 停止服务
docker-compose down

# 清理数据
docker-compose down -v
```

### 生产环境配置

#### Nginx配置
```nginx
upstream api_gateway {
  server gateway:3000;
}

server {
  listen 80;
  server_name api.example.com;

  location / {
    proxy_pass http://api_gateway;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  location /socket.io/ {
    proxy_pass http://api_gateway;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

#### 环境变量管理
```bash
# 生产环境
NODE_ENV=production
LOG_LEVEL=error
DEBUG=false

# 数据库连接池
DB_POOL_MIN=2
DB_POOL_MAX=10

# Redis集群
REDIS_CLUSTER=true
REDIS_NODES=redis1:6379,redis2:6379,redis3:6379
```

### CI/CD Pipeline

#### GitHub Actions示例
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build Docker images
        run: docker-compose build
      - name: Push to Registry
        run: |
          docker tag app:latest registry.example.com/app:latest
          docker push registry.example.com/app:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl apply -f k8s/
          kubectl rollout status deployment/gateway
```

---

## 🧪 测试策略

### 单元测试

#### 前端测试
```typescript
// __tests__/components/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../src/components/Button';

describe('Button Component', () => {
  it('should render correctly', () => {
    const { getByText } = render(
      <Button title="Click me" onPress={() => {}} />
    );
    expect(getByText('Click me')).toBeTruthy();
  });

  it('should call onPress when clicked', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Click me" onPress={onPress} />
    );
    fireEvent.press(getByText('Click me'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

#### 后端测试
```typescript
// users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository;

  beforeEach(async () => {
    mockRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should find user by id', async () => {
    const user = { id: '1', email: 'test@test.com' };
    mockRepository.findOne.mockResolvedValue(user);

    const result = await service.findById('1');
    expect(result).toEqual(user);
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: '1' },
    });
  });
});
```

### 集成测试

```typescript
// app.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'password' })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('refreshToken');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

### 测试覆盖率

```bash
# 运行测试并生成覆盖率报告
npm run test:cov

# 覆盖率目标
- 语句覆盖率: > 80%
- 分支覆盖率: > 75%
- 函数覆盖率: > 80%
- 行覆盖率: > 80%
```

---

## ❓ 常见问题

### 开发环境问题

#### Q: Metro bundler无法启动
```bash
# 清理缓存
npx react-native start --reset-cache

# 重新安装依赖
rm -rf node_modules
npm install

# iOS特定问题
cd ios && pod install && cd ..
```

#### Q: Android构建失败
```bash
# 清理构建
cd android && ./gradlew clean && cd ..

# 重新构建
npx react-native run-android
```

#### Q: Docker容器无法启动
```bash
# 检查端口占用
lsof -i :3000

# 清理Docker
docker system prune -a

# 重新构建
docker-compose down -v
docker-compose up --build
```

### API问题

#### Q: 401 Unauthorized错误
```typescript
// 检查Token是否过期
const token = localStorage.getItem('token');
const decoded = jwt_decode(token);
if (decoded.exp < Date.now() / 1000) {
  // Token已过期，需要刷新
  await refreshToken();
}
```

#### Q: CORS错误
```typescript
// 后端配置CORS
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:8081'],
  credentials: true,
});
```

### 蓝牙问题

#### Q: 设备扫描不到
```javascript
// 检查权限
const granted = await PermissionsAndroid.request(
  PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
);

// 检查蓝牙状态
const state = await BleManager.checkState();
if (state !== 'PoweredOn') {
  // 提示用户开启蓝牙
}
```

### 数据库问题

#### Q: 连接超时
```yaml
# 增加连接池配置
typeorm:
  extra:
    connectionLimit: 10
    connectTimeout: 60000
```

---

## 📚 相关资源

### 官方文档
- [React Native](https://reactnative.dev/docs/getting-started)
- [NestJS](https://docs.nestjs.com/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Docker](https://docs.docker.com/)

### 工具和库
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Navigation](https://reactnavigation.org/)
- [TypeORM](https://typeorm.io/)
- [Socket.io](https://socket.io/docs/)

### 设计资源
- [Figma设计稿](https://figma.com/file/xxx)
- [品牌指南](./docs/brand-guidelines.md)
- [UI组件库](./docs/ui-components.md)

### 团队资源
- [开发规范](./docs/coding-standards.md)
- [Git工作流](./docs/git-workflow.md)
- [发布流程](./docs/release-process.md)

---

## 👥 团队联系

| 角色 | 负责人 | 联系方式 |
|------|--------|----------|
| 项目经理 | PM | pm@example.com |
| 技术负责人 | Tech Lead | tech@example.com |
| 前端负责人 | Frontend Lead | frontend@example.com |
| 后端负责人 | Backend Lead | backend@example.com |
| UI/UX设计 | Designer | design@example.com |
| 测试负责人 | QA Lead | qa@example.com |

---

## 📝 更新日志

### v2.0.0 (2024-01-07)
- ✨ 完成微服务架构搭建
- ✨ 实现WebSocket实时通信
- ✨ 添加Docker部署配置
- 📝 完善开发文档

### v1.0.0 (2024-01-01)
- 🎉 项目初始化
- ✨ 基础功能实现
- 📱 前端页面开发
- 🔧 后端API开发

---

**最后更新**: 2024-01-07
**文档版本**: v2.0.0
**维护者**: Development Team