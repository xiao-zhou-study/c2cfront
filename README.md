# 校园物品共享平台

基于 Vue 3 + Vite + Element Plus 构建的现代化校园物品共享平台。

## 技术栈

- **框架**: Vue 3.5.24 (Composition API)
- **构建工具**: Vite 7.2.4
- **UI 库**: Element Plus 2.12.0
- **状态管理**: Pinia 2.2.6
- **路由**: Vue Router 4.6.4
- **HTTP 客户端**: Axios 1.7.7
- **代码规范**: ESLint + Prettier

## 项目特性

### ✨ 核心功能

- 🔐 用户认证（登录/注册）
- 📦 物品管理（发布/浏览/详情）
- 🔍 智能搜索（关键词/分类/历史记录）
- 💰 借用系统（申请/审核/归还）
- ⭐ 评价系统
- 📊 个人中心（发布记录/借用记录/动态）
- 🔔 通知中心

### 🛠️ 技术亮点

- **模块化架构**: 按功能模块组织代码，易于维护和扩展
- **状态管理**: 使用 Pinia 进行统一的状态管理
- **API 封装**: 统一的 API 请求层，支持拦截器和错误处理
- **路由守卫**: 完善的权限控制和路由守卫
- **响应式设计**: 完美适配桌面端、平板和移动端
- **代码规范**: ESLint + Prettier 保证代码质量
- **工具函数库**: 丰富的工具函数，提高开发效率

## 项目结构

```
src/
├── modules/              # 功能模块
│   ├── auth/            # 认证模块
│   ├── dashboard/       # 仪表盘模块
│   ├── items/           # 物品模块
│   └── profile/         # 个人中心模块
├── router/              # 路由配置
├── shared/              # 共享资源
│   ├── api/            # API 服务层
│   ├── assets/         # 静态资源
│   ├── components/     # 共享组件
│   ├── composables/    # 组合式函数
│   ├── stores/         # Pinia stores
│   └── utils/          # 工具函数
└── main.js             # 入口文件
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

### 代码格式化

```bash
npm run format
```

## 环境变量

项目支持环境变量配置，创建 `.env` 文件：

```env
# 应用基础配置
VITE_APP_TITLE=校园物品共享平台
VITE_APP_VERSION=1.0.0

# API 配置
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000

# 环境标识
VITE_NODE_ENV=development
```

## 核心功能说明

### 状态管理 (Pinia)

项目使用 Pinia 进行状态管理，主要 stores：

- `user`: 用户信息和认证状态
- `app`: 应用全局状态（加载状态、设备类型等）

### API 服务层

统一的 API 服务层位于 `src/shared/api/`，包含：

- `authAPI`: 认证相关 API
- `userAPI`: 用户相关 API
- `itemAPI`: 物品相关 API
- `categoryAPI`: 分类相关 API
- `borrowingAPI`: 借用记录相关 API
- `reviewAPI`: 评价相关 API
- `notificationAPI`: 通知相关 API
- `uploadAPI`: 文件上传 API

### 工具函数

丰富的工具函数库位于 `src/shared/utils/`：

- **日期处理**: `formatDate`, `formatTimeAgo`
- **防抖节流**: `debounce`, `throttle`
- **存储管理**: `storage` 对象
- **表单验证**: `validatePhone`, `validateEmail`, `validateStudentId`
- **文件处理**: `formatFileSize`, `compressImage`
- **其他**: `deepClone`, `generateId`, `formatPrice` 等

### 路由守卫

项目实现了完善的路由守卫：

- 认证检查：需要登录的页面会自动重定向到登录页
- 页面标题：自动设置页面标题
- 加载状态：统一管理页面加载状态
- 滚动行为：自动滚动到顶部

## 开发规范

### 代码风格

项目使用 ESLint + Prettier 进行代码规范：

- 使用单引号
- 不使用分号
- 2 空格缩进
- 最大行宽 100 字符

### 组件命名

- 组件文件使用 PascalCase：`UserProfile.vue`
- 组合式函数使用 camelCase：`useUser.js`

### 文件组织

- 按功能模块组织代码
- 每个模块包含 `components`, `composables`, `views` 目录
- 共享代码放在 `shared` 目录

## 最佳实践

### 使用 Store

```javascript
import { useUserStore } from '@/shared/stores/user'

const userStore = useUserStore()
// 访问状态
console.log(userStore.userInfo)
// 调用方法
await userStore.login(loginData)
```

### 使用 API

```javascript
import { itemAPI } from '@/shared/api'

// 获取物品列表
const items = await itemAPI.getItems({ page: 1, size: 10 })

// 创建物品
await itemAPI.createItem(itemData)
```

### 使用工具函数

```javascript
import { formatDate, debounce, storage } from '@/shared/utils'

// 格式化日期
const dateStr = formatDate(new Date(), 'YYYY-MM-DD')

// 防抖函数
const debouncedFn = debounce(() => {
  console.log('执行')
}, 300)

// 存储管理
storage.set('key', value)
const value = storage.get('key')
```

## 浏览器支持

- Chrome (最新)
- Firefox (最新)
- Safari (最新)
- Edge (最新)

## 许可证

MIT

## 贡献指南

欢迎提交 Issue 和 Pull Request！
