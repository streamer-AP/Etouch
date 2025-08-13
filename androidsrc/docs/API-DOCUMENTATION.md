# Smart Device Control System - API 接口文档

## 基础信息

- **Base URL**: `http://localhost:3001/api`
- **API Documentation (Swagger)**: `http://localhost:3001/api/docs`
- **认证方式**: JWT Bearer Token
- **Content-Type**: `application/json`

## 认证说明

大部分 API 需要在请求头中携带 JWT token：
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. 认证模块 (Auth)

### 1.1 用户注册
- **URL**: `/auth/register`
- **Method**: `POST`
- **Body**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "mobile": "string (optional)",
  "nickname": "string (optional)"
}
```
- **Response**:
```json
{
  "user": {
    "userId": "number",
    "username": "string",
    "email": "string",
    "nickname": "string"
  },
  "token": "string"
}
```

### 1.2 用户登录
- **URL**: `/auth/login`
- **Method**: `POST`
- **Body**:
```json
{
  "loginId": "string (username/email/mobile)",
  "password": "string",
  "rememberMe": "boolean (optional)"
}
```
- **Response**:
```json
{
  "user": {
    "userId": "number",
    "username": "string",
    "email": "string",
    "nickname": "string"
  },
  "token": "string",
  "refreshToken": "string"
}
```

### 1.3 刷新Token
- **URL**: `/auth/refresh`
- **Method**: `POST`
- **Body**:
```json
{
  "refreshToken": "string"
}
```
- **Response**:
```json
{
  "token": "string",
  "refreshToken": "string"
}
```

### 1.4 用户登出
- **URL**: `/auth/logout`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "message": "Logout successful"
}
```

### 1.5 获取用户信息
- **URL**: `/auth/profile`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "userId": "number",
  "username": "string",
  "email": "string",
  "nickname": "string",
  "mobile": "string",
  "createTime": "datetime"
}
```

### 1.6 修改密码
- **URL**: `/auth/change-password`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "oldPassword": "string",
  "newPassword": "string"
}
```
- **Response**:
```json
{
  "message": "Password changed successfully"
}
```

---

## 2. 设备管理模块 (Device)

### 2.1 绑定设备
- **URL**: `/devices/bind`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "deviceCode": "string",
  "nickname": "string (optional)"
}
```
- **Response**:
```json
{
  "userDeviceId": "number",
  "deviceId": "number",
  "nickname": "string",
  "connectionStatus": "string"
}
```

### 2.2 获取我的设备列表
- **URL**: `/devices/my-devices`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
[
  {
    "userDeviceId": "number",
    "device": {
      "deviceId": "number",
      "deviceName": "string",
      "deviceType": "vibrator|controller|sensor",
      "deviceCode": "string",
      "manufacturer": "string"
    },
    "nickname": "string",
    "connectionStatus": "connected|disconnected|pairing",
    "lastConnectTime": "datetime"
  }
]
```

### 2.3 获取设备统计信息
- **URL**: `/devices/my-devices/statistics`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "totalDevices": "number",
  "connectedDevices": "number",
  "devicesByType": {
    "vibrator": "number",
    "controller": "number",
    "sensor": "number"
  }
}
```

### 2.4 更新设备信息
- **URL**: `/devices/my-devices/{id}`
- **Method**: `PATCH`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "nickname": "string (optional)",
  "isDefault": "boolean (optional)"
}
```
- **Response**:
```json
{
  "message": "Device updated successfully"
}
```

### 2.5 解绑设备
- **URL**: `/devices/my-devices/{id}`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "message": "Device unbound successfully"
}
```

---

## 3. 虚拟角色商店模块 (Character Store)

### 3.1 获取角色列表
- **URL**: `/character-store/characters`
- **Method**: `GET`
- **Query Parameters**:
  - `category`: string (optional) - 角色分类
  - `tags`: string (optional) - 标签，逗号分隔
  - `isFree`: boolean (optional) - 是否免费
  - `sortBy`: string (optional) - 排序字段 (downloads|rating|updateTime)
  - `page`: number (optional) - 页码
  - `limit`: number (optional) - 每页数量
- **Response**:
```json
{
  "characters": [
    {
      "characterId": "number",
      "name": "string",
      "description": "string",
      "avatarUrl": "string",
      "previewUrl": "string",
      "category": "string",
      "tags": ["string"],
      "isFree": "boolean",
      "price": "number",
      "downloadCount": "number",
      "rating": "number",
      "reviewCount": "number"
    }
  ],
  "total": "number",
  "page": "number",
  "totalPages": "number"
}
```

### 3.2 获取角色详情
- **URL**: `/character-store/characters/{id}`
- **Method**: `GET`
- **Response**:
```json
{
  "characterId": "number",
  "name": "string",
  "description": "string",
  "avatarUrl": "string",
  "previewUrl": "string",
  "category": "string",
  "tags": ["string"],
  "isFree": "boolean",
  "price": "number",
  "downloadCount": "number",
  "rating": "number",
  "reviewCount": "number",
  "version": "string",
  "fileSize": "number",
  "scenes": [
    {
      "sceneId": "number",
      "title": "string",
      "description": "string",
      "orderIndex": "number",
      "duration": "number"
    }
  ],
  "reviews": [
    {
      "reviewId": "number",
      "username": "string",
      "rating": "number",
      "comment": "string",
      "createTime": "datetime"
    }
  ]
}
```

### 3.3 下载角色
- **URL**: `/character-store/download`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "characterId": "number"
}
```
- **Response**:
```json
{
  "downloadId": "number",
  "characterId": "number",
  "downloadUrl": "string",
  "message": "Character downloaded successfully"
}
```

### 3.4 获取我的下载
- **URL**: `/character-store/my-downloads`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `active`: boolean (optional) - 只显示激活的角色
- **Response**:
```json
[
  {
    "downloadId": "number",
    "character": {
      "characterId": "number",
      "name": "string",
      "avatarUrl": "string",
      "version": "string"
    },
    "downloadTime": "datetime",
    "isActive": "boolean",
    "isFavorite": "boolean",
    "lastUsedTime": "datetime",
    "usageCount": "number"
  }
]
```

### 3.5 切换收藏状态
- **URL**: `/character-store/favorites/{characterId}`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "isFavorite": "boolean",
  "message": "Favorite status updated"
}
```

### 3.6 获取场景进度
- **URL**: `/character-store/progress/{characterId}`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
[
  {
    "sceneId": "number",
    "title": "string",
    "progress": "number (0-100)",
    "isCompleted": "boolean",
    "lastPlayTime": "datetime"
  }
]
```

### 3.7 更新场景进度
- **URL**: `/character-store/progress`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "sceneId": "number",
  "progress": "number (0-100)",
  "isCompleted": "boolean"
}
```
- **Response**:
```json
{
  "message": "Progress updated successfully"
}
```

### 3.8 创建角色评价
- **URL**: `/character-store/reviews`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "characterId": "number",
  "rating": "number (1-5)",
  "comment": "string"
}
```
- **Response**:
```json
{
  "reviewId": "number",
  "message": "Review created successfully"
}
```

### 3.9 购买角色
- **URL**: `/character-store/purchase`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "characterId": "number",
  "paymentMethod": "string"
}
```
- **Response**:
```json
{
  "purchaseId": "number",
  "transactionId": "string",
  "amount": "number",
  "status": "pending",
  "paymentUrl": "string (optional)"
}
```

---

## 4. 音频管理模块 (Audio)

### 4.1 上传音频
- **URL**: `/audio`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "title": "string",
  "artist": "string (optional)",
  "album": "string (optional)",
  "durationSeconds": "number",
  "fileUrl": "string",
  "fileSize": "number (optional)",
  "format": "string (optional)",
  "bpm": "number (optional)",
  "category": "string (optional)",
  "tags": "string (optional)",
  "isPublic": "boolean (optional)",
  "autoGenerateSequence": "boolean (optional)"
}
```
- **Response**:
```json
{
  "audioId": "number",
  "title": "string",
  "fileUrl": "string",
  "sequenceId": "number (optional)"
}
```

### 4.2 浏览音频库
- **URL**: `/audio`
- **Method**: `GET`
- **Query Parameters**:
  - `category`: string (optional)
  - `isPublic`: boolean (optional)
  - `search`: string (optional)
  - `minBpm`: number (optional)
  - `maxBpm`: number (optional)
  - `sortBy`: string (optional) - playCount|createTime|title|bpm
  - `sortOrder`: ASC|DESC (optional)
  - `skip`: number (optional)
  - `take`: number (optional)
- **Response**:
```json
{
  "audios": [
    {
      "audioId": "number",
      "title": "string",
      "artist": "string",
      "album": "string",
      "durationSeconds": "number",
      "fileUrl": "string",
      "category": "string",
      "tags": "string",
      "playCount": "number",
      "sequence": {
        "sequenceId": "number",
        "name": "string"
      }
    }
  ],
  "total": "number"
}
```

### 4.3 获取推荐音频
- **URL**: `/audio/recommended`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
[
  {
    "audioId": "number",
    "title": "string",
    "artist": "string",
    "category": "string",
    "playCount": "number",
    "recommendReason": "string"
  }
]
```

### 4.4 获取音频详情
- **URL**: `/audio/{id}`
- **Method**: `GET`
- **Response**:
```json
{
  "audioId": "number",
  "title": "string",
  "artist": "string",
  "album": "string",
  "durationSeconds": "number",
  "fileUrl": "string",
  "waveformData": "object",
  "bpm": "number",
  "energyLevel": "number",
  "sequence": {
    "sequenceId": "number",
    "name": "string",
    "totalDurationMs": "number",
    "steps": [
      {
        "stepId": "number",
        "stepOrder": "number",
        "startTimeMs": "number",
        "durationMs": "number",
        "intensity": "number",
        "frequency": "number",
        "patternType": "constant|pulse|wave|fade_in|fade_out"
      }
    ]
  }
}
```

### 4.5 分析音频
- **URL**: `/audio/{id}/analyze`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "bpm": "number",
  "energyLevel": "number",
  "peakMoments": ["number"],
  "recommendedSequences": [
    {
      "sequenceId": "number",
      "name": "string",
      "matchScore": "number"
    }
  ]
}
```

### 4.6 创建震动序列
- **URL**: `/audio/sequences`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "name": "string",
  "description": "string (optional)",
  "sequenceType": "audio_sync|scene_sync|custom|preset",
  "totalDurationMs": "number",
  "loopEnabled": "boolean (optional)",
  "category": "string (optional)",
  "isPublic": "boolean (optional)"
}
```
- **Response**:
```json
{
  "sequenceId": "number",
  "name": "string",
  "sequenceType": "string"
}
```

### 4.7 获取震动序列列表
- **URL**: `/audio/sequences`
- **Method**: `GET`
- **Query Parameters**:
  - `public`: boolean (optional)
- **Response**:
```json
[
  {
    "sequenceId": "number",
    "name": "string",
    "description": "string",
    "sequenceType": "string",
    "totalDurationMs": "number",
    "category": "string",
    "steps": []
  }
]
```

### 4.8 分配震动序列到音频
- **URL**: `/audio/{audioId}/sequence/{sequenceId}`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "audioId": "number",
  "sequenceId": "number",
  "message": "Sequence assigned successfully"
}
```

### 4.9 播放音频
- **URL**: `/audio/play`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "audioId": "number",
  "deviceId": "number (optional)",
  "sequenceId": "number (optional)",
  "deviceConnected": "boolean (optional)"
}
```
- **Response**:
```json
{
  "historyId": "number",
  "audioId": "number",
  "playTime": "datetime"
}
```

### 4.10 完成播放
- **URL**: `/audio/play/complete`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "historyId": "number",
  "duration": "number"
}
```
- **Response**:
```json
{
  "message": "Playback completed"
}
```

### 4.11 获取播放历史
- **URL**: `/audio/history/my`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `limit`: number (optional, default: 50)
- **Response**:
```json
[
  {
    "historyId": "number",
    "audio": {
      "audioId": "number",
      "title": "string",
      "artist": "string"
    },
    "playTime": "datetime",
    "playDuration": "number",
    "completed": "boolean",
    "deviceConnected": "boolean"
  }
]
```

---

## 错误响应格式

所有 API 的错误响应格式统一如下：

```json
{
  "statusCode": "number",
  "message": "string",
  "error": "string (optional)",
  "timestamp": "datetime",
  "path": "string"
}
```

### 常见错误码

- `400` - Bad Request: 请求参数错误
- `401` - Unauthorized: 未认证或 token 过期
- `403` - Forbidden: 无权限访问
- `404` - Not Found: 资源不存在
- `409` - Conflict: 资源冲突（如用户名已存在）
- `500` - Internal Server Error: 服务器内部错误

---

## 使用示例

### 完整的认证流程示例

```javascript
// 1. 注册新用户
const register = async () => {
  const response = await fetch('http://localhost:3001/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test123456!',
      nickname: '测试用户'
    })
  });
  const data = await response.json();
  console.log('Token:', data.token);
  return data.token;
};

// 2. 使用 token 访问受保护的 API
const getMyDevices = async (token) => {
  const response = await fetch('http://localhost:3001/api/devices/my-devices', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const devices = await response.json();
  console.log('My devices:', devices);
};

// 3. 刷新 Token
const refreshToken = async (refreshToken) => {
  const response = await fetch('http://localhost:3001/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      refreshToken: refreshToken
    })
  });
  const data = await response.json();
  return data.token;
};
```

### 虚拟角色下载流程示例

```javascript
// 1. 浏览角色商店
const browseCharacters = async () => {
  const response = await fetch('http://localhost:3001/api/character-store/characters?category=romantic&isFree=true');
  const data = await response.json();
  return data.characters;
};

// 2. 下载角色
const downloadCharacter = async (token, characterId) => {
  const response = await fetch('http://localhost:3001/api/character-store/download', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      characterId: characterId
    })
  });
  return await response.json();
};

// 3. 获取场景进度
const getProgress = async (token, characterId) => {
  const response = await fetch(`http://localhost:3001/api/character-store/progress/${characterId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
};
```

### 音频播放与震动联动示例

```javascript
// 1. 获取音频详情（包含震动序列）
const getAudioWithVibration = async (audioId) => {
  const response = await fetch(`http://localhost:3001/api/audio/${audioId}`);
  const audio = await response.json();
  return {
    audio: audio,
    vibrationSequence: audio.sequence
  };
};

// 2. 开始播放音频
const playAudio = async (token, audioId, deviceId) => {
  const response = await fetch('http://localhost:3001/api/audio/play', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      audioId: audioId,
      deviceId: deviceId,
      deviceConnected: true
    })
  });
  return await response.json();
};

// 3. 在客户端处理震动序列
const processVibrationSequence = (sequence) => {
  if (!sequence || !sequence.steps) return;
  
  sequence.steps.forEach(step => {
    setTimeout(() => {
      // 发送蓝牙命令到设备
      sendBluetoothCommand({
        intensity: step.intensity,
        duration: step.durationMs,
        pattern: step.patternType
      });
    }, step.startTimeMs);
  });
};
```

---

## 注意事项

1. **认证**: 除了公开的角色浏览等接口，大部分 API 都需要携带有效的 JWT token
2. **Token 过期**: Token 默认有效期为 7 天，过期后需要使用 refresh token 刷新
3. **并发限制**: API 有请求频率限制，请避免短时间内大量请求
4. **文件上传**: 音频文件等大文件建议先上传到云存储，然后提供 URL
5. **蓝牙控制**: 设备的实际控制通过蓝牙在客户端完成，服务器只负责数据同步
6. **震动序列**: 震动序列数据在服务器生成，客户端负责解析并通过蓝牙发送给设备

---

## 测试账号

为了方便开发测试，系统预置了以下测试账号：

- **普通用户**
  - 用户名: `testuser`
  - 密码: `Test123456!`

- **管理员用户**
  - 用户名: `admin`
  - 密码: `Admin123456!`

---

## 更新日志

- **v1.0.0** (2024-01-10)
  - 初始版本发布
  - 包含认证、设备管理、角色商店、音频播放四大模块
  - 实现统一震动序列系统
  - 支持音频与设备震动联动