# 测试指导 Agent

## 职责
专门负责测试策略制定、测试用例编写、测试工具配置和质量保证，为AI生成高质量的测试代码提供专业指导。

## 🎯 测试策略

### 1. 测试金字塔
```
    /\
   /E2E\     <- 少量端到端测试
  /______\
 /        \
/Integration\ <- 适量集成测试
/____________\
/            \
/  Unit Tests  \ <- 大量单元测试
/________________\
```

### 2. 测试分类
- **单元测试**: 测试独立的函数、组件和模块
- **集成测试**: 测试组件间的交互和API集成
- **端到端测试**: 测试完整的用户流程
- **视觉回归测试**: 测试UI的视觉一致性

### 3. 测试原则
- **快速反馈**: 测试应该快速执行并提供即时反馈
- **可靠性**: 测试结果应该稳定可重复
- **可维护性**: 测试代码应该易于理解和维护
- **覆盖率**: 关键业务逻辑应该有充分的测试覆盖

## 🛠️ 测试工具配置

### Vitest 配置
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  test: {
    // 测试环境
    environment: 'jsdom',
    
    // 全局配置
    globals: true,
    
    // 设置文件
    setupFiles: ['./tests/setup.ts'],
    
    // 包含的测试文件
    include: [
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,ts,jsx,tsx}',
    ],
    
    // 排除的文件
    exclude: [
      'node_modules',
      'dist',
      'build',
      '.nuxt',
      'coverage',
    ],
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        'packages/*/test{,s}/**',
        '**/*.d.ts',
        'cypress/**',
        'test{,s}/**',
        'test{,-*}.{js,cjs,mjs,ts,tsx,jsx}',
        '**/*{.,-}test.{js,cjs,mjs,ts,tsx,jsx}',
        '**/*{.,-}spec.{js,cjs,mjs,ts,tsx,jsx}',
        '**/__tests__/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
        '**/.{eslint,mocha,prettier}rc.{js,cjs,yml}',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    
    // 并发配置
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 测试设置文件
```typescript
// tests/setup.ts
import { beforeAll, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/vue';
import '@testing-library/jest-dom/vitest';

// 全局测试设置
beforeAll(() => {
  // Mock全局对象
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

// 每个测试后清理
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
```

## 🧪 单元测试

### 工具函数测试
```typescript
// tests/utils/date.test.ts
import { describe, it, expect } from 'vitest';
import { DateUtils } from '@/utils/date';

describe('DateUtils', () => {
  describe('format', () => {
    it('应该正确格式化日期', () => {
      const date = new Date('2023-12-25 15:30:45');
      const result = DateUtils.format(date, 'YYYY-MM-DD HH:mm:ss');
      expect(result).toBe('2023-12-25 15:30:45');
    });

    it('应该使用默认格式', () => {
      const date = new Date('2023-12-25 15:30:45');
      const result = DateUtils.format(date);
      expect(result).toBe('2023-12-25 15:30:45');
    });

    it('应该处理字符串日期', () => {
      const result = DateUtils.format('2023-12-25', 'YYYY-MM-DD');
      expect(result).toBe('2023-12-25');
    });

    it('应该处理时间戳', () => {
      const timestamp = new Date('2023-12-25').getTime();
      const result = DateUtils.format(timestamp, 'YYYY-MM-DD');
      expect(result).toBe('2023-12-25');
    });
  });

  describe('isToday', () => {
    it('应该正确判断今天', () => {
      const today = new Date();
      expect(DateUtils.isToday(today)).toBe(true);
    });

    it('应该正确判断不是今天', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(DateUtils.isToday(yesterday)).toBe(false);
    });
  });

  describe('getDateRange', () => {
    it('应该返回正确的日期范围', () => {
      const start = '2023-12-01';
      const end = '2023-12-03';
      const result = DateUtils.getDateRange(start, end);
      
      expect(result).toEqual([
        '2023-12-01',
        '2023-12-02',
        '2023-12-03',
      ]);
    });

    it('应该处理单天范围', () => {
      const date = '2023-12-01';
      const result = DateUtils.getDateRange(date, date);
      expect(result).toEqual(['2023-12-01']);
    });
  });
});
```

### Pinia Store 测试
```typescript
// tests/store/user.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '@/store/modules/user';
import { UserApi } from '@/api/modules/user';
import type { IUserInfo, ILoginRequest } from '@/interface';

// Mock API
vi.mock('@/api/modules/user');
const mockedUserApi = vi.mocked(UserApi);

describe('useUserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    
    // 清理localStorage
    localStorage.clear();
  });

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const store = useUserStore();
      
      expect(store.token).toBe('');
      expect(store.userInfo).toBeNull();
      expect(store.permissions).toEqual([]);
      expect(store.isLoggedIn).toBe(false);
    });

    it('应该从localStorage恢复token', () => {
      localStorage.setItem('token', 'saved-token');
      
      const store = useUserStore();
      expect(store.token).toBe('saved-token');
      expect(store.isLoggedIn).toBe(true);
    });
  });

  describe('login', () => {
    it('应该成功登录并更新状态', async () => {
      const mockUserInfo: IUserInfo = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user'],
        status: 'active',
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      };

      const mockLoginResponse = {
        code: 200,
        message: '登录成功',
        data: {
          token: 'mock-token',
          userInfo: mockUserInfo,
          permissions: ['user:read'],
        },
      };

      mockedUserApi.login.mockResolvedValueOnce(mockLoginResponse);

      const store = useUserStore();
      const credentials: ILoginRequest = {
        username: 'testuser',
        password: 'password123',
      };

      await store.login(credentials);

      expect(store.token).toBe('mock-token');
      expect(store.userInfo).toEqual(mockUserInfo);
      expect(store.permissions).toEqual(['user:read']);
      expect(store.isLoggedIn).toBe(true);
      expect(localStorage.getItem('token')).toBe('mock-token');
    });

    it('应该在登录失败时抛出错误', async () => {
      const error = new Error('登录失败');
      mockedUserApi.login.mockRejectedValueOnce(error);

      const store = useUserStore();
      const credentials: ILoginRequest = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      await expect(store.login(credentials)).rejects.toThrow('登录失败');
      expect(store.token).toBe('');
      expect(store.userInfo).toBeNull();
    });
  });

  describe('logout', () => {
    it('应该成功登出并清理状态', async () => {
      mockedUserApi.logout.mockResolvedValueOnce({
        code: 200,
        message: '登出成功',
        data: undefined,
      });

      const store = useUserStore();
      
      // 设置初始状态
      store.token = 'test-token';
      store.userInfo = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user'],
        status: 'active',
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      };
      store.permissions = ['user:read'];
      localStorage.setItem('token', 'test-token');

      await store.logout();

      expect(store.token).toBe('');
      expect(store.userInfo).toBeNull();
      expect(store.permissions).toEqual([]);
      expect(store.isLoggedIn).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('应该在API调用失败时仍然清理状态', async () => {
      mockedUserApi.logout.mockRejectedValueOnce(new Error('网络错误'));

      const store = useUserStore();
      store.token = 'test-token';
      localStorage.setItem('token', 'test-token');

      await store.logout();

      expect(store.token).toBe('');
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('hasPermission', () => {
    it('应该正确检查权限', () => {
      const store = useUserStore();
      store.permissions = ['user:read', 'user:write'];

      expect(store.hasPermission('user:read')).toBe(true);
      expect(store.hasPermission('user:write')).toBe(true);
      expect(store.hasPermission('admin:read')).toBe(false);
    });
  });
});
```

### Vue 组件测试
```typescript
// tests/components/QuickActions.test.ts
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ElRow, ElCol, ElIcon } from 'element-plus';
import QuickActions from '@/components/QuickActions/index.vue';
import type { ActionItem } from '@/components/QuickActions/index.vue';

// Mock Element Plus 组件
vi.mock('element-plus', () => ({
  ElRow: { name: 'ElRow', template: '<div class="el-row"><slot /></div>' },
  ElCol: { name: 'ElCol', template: '<div class="el-col"><slot /></div>' },
  ElIcon: { name: 'ElIcon', template: '<i class="el-icon"><slot /></i>' },
}));

describe('QuickActions', () => {
  const mockActions: ActionItem[] = [
    {
      key: 'add',
      icon: 'Plus',
      title: '添加用户',
      description: '创建新用户',
      color: '#409eff',
    },
    {
      key: 'edit',
      icon: 'Edit',
      title: '编辑用户',
      description: '修改用户信息',
      color: '#67c23a',
    },
  ];

  it('应该正确渲染组件', () => {
    const wrapper = mount(QuickActions, {
      props: {
        title: '快捷操作',
        actions: mockActions,
      },
      global: {
        components: {
          ElRow,
          ElCol,
          ElIcon,
        },
      },
    });

    expect(wrapper.find('h2').text()).toBe('快捷操作');
    expect(wrapper.findAll('.action-card')).toHaveLength(2);
  });

  it('应该使用默认标题', () => {
    const wrapper = mount(QuickActions, {
      props: {
        actions: mockActions,
      },
      global: {
        components: {
          ElRow,
          ElCol,
          ElIcon,
        },
      },
    });

    expect(wrapper.find('h2').text()).toBe('快捷操作');
  });

  it('应该正确渲染操作项', () => {
    const wrapper = mount(QuickActions, {
      props: {
        actions: mockActions,
      },
      global: {
        components: {
          ElRow,
          ElCol,
          ElIcon,
        },
      },
    });

    const actionCards = wrapper.findAll('.action-card');
    
    expect(actionCards[0].find('.action-title').text()).toBe('添加用户');
    expect(actionCards[0].find('.action-desc').text()).toBe('创建新用户');
    
    expect(actionCards[1].find('.action-title').text()).toBe('编辑用户');
    expect(actionCards[1].find('.action-desc').text()).toBe('修改用户信息');
  });

  it('应该在点击操作项时触发事件', async () => {
    const wrapper = mount(QuickActions, {
      props: {
        actions: mockActions,
      },
      global: {
        components: {
          ElRow,
          ElCol,
          ElIcon,
        },
      },
    });

    await wrapper.findAll('.action-card')[0].trigger('click');

    expect(wrapper.emitted('action-click')).toBeTruthy();
    expect(wrapper.emitted('action-click')?.[0]).toEqual(['add']);
  });

  it('应该正确计算span值', () => {
    // 测试2个操作项
    const wrapper2 = mount(QuickActions, {
      props: {
        actions: mockActions.slice(0, 2),
      },
      global: {
        components: {
          ElRow,
          ElCol,
          ElIcon,
        },
      },
    });

    // 2个操作项应该各占12span (24/2=12)
    expect(wrapper2.vm.actionSpan).toBe(12);

    // 测试5个操作项
    const wrapper5 = mount(QuickActions, {
      props: {
        actions: [...mockActions, ...mockActions, mockActions[0]],
      },
      global: {
        components: {
          ElRow,
          ElCol,
          ElIcon,
        },
      },
    });

    // 超过4个操作项应该使用默认6span
    expect(wrapper5.vm.actionSpan).toBe(6);
  });

  it('应该正确设置图标颜色', () => {
    const wrapper = mount(QuickActions, {
      props: {
        actions: mockActions,
      },
      global: {
        components: {
          ElRow,
          ElCol,
          ElIcon,
        },
      },
    });

    const firstIcon = wrapper.findAll('.action-icon')[0];
    expect(firstIcon.attributes('style')).toContain('color: #409eff');
  });
});
```

## 🔗 集成测试

### API 集成测试
```typescript
// tests/integration/api.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { UserApi } from '@/api/modules/user';
import type { IUserInfo } from '@/interface';

// Mock服务器设置
const server = setupServer(
  // 用户登录
  rest.post('/api/auth/login', (req, res, ctx) => {
    const { username, password } = req.body as any;
    
    if (username === 'testuser' && password === 'password123') {
      return res(
        ctx.json({
          code: 200,
          message: '登录成功',
          data: {
            token: 'mock-token-123',
            userInfo: {
              id: '1',
              username: 'testuser',
              email: 'test@example.com',
              roles: ['user'],
              status: 'active',
              createdAt: '2023-01-01T00:00:00Z',
              updatedAt: '2023-01-01T00:00:00Z',
            },
            permissions: ['user:read'],
          },
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({
        code: 401,
        message: '用户名或密码错误',
      })
    );
  }),

  // 获取用户列表
  rest.get('/api/users', (req, res, ctx) => {
    const page = req.url.searchParams.get('page') || '1';
    const pageSize = req.url.searchParams.get('pageSize') || '10';
    
    const mockUsers: IUserInfo[] = [
      {
        id: '1',
        username: 'user1',
        email: 'user1@example.com',
        roles: ['user'],
        status: 'active',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
      {
        id: '2',
        username: 'user2',
        email: 'user2@example.com',
        roles: ['admin'],
        status: 'active',
        createdAt: '2023-01-02T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z',
      },
    ];

    return res(
      ctx.json({
        code: 200,
        message: '获取成功',
        data: mockUsers,
        total: 2,
        current: parseInt(page),
        pageSize: parseInt(pageSize),
        pages: 1,
      })
    );
  }),

  // 创建用户
  rest.post('/api/users', (req, res, ctx) => {
    const userData = req.body as any;
    
    return res(
      ctx.json({
        code: 200,
        message: '创建成功',
        data: {
          id: '3',
          ...userData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })
    );
  })
);

describe('API Integration Tests', () => {
  beforeAll(() => {
    server.listen();
  });

  afterAll(() => {
    server.close();
  });

  describe('UserApi', () => {
    it('应该成功登录', async () => {
      const result = await UserApi.login({
        username: 'testuser',
        password: 'password123',
      });

      expect(result.code).toBe(200);
      expect(result.data.token).toBe('mock-token-123');
      expect(result.data.userInfo.username).toBe('testuser');
    });

    it('应该在错误凭据时返回401', async () => {
      await expect(
        UserApi.login({
          username: 'testuser',
          password: 'wrongpassword',
        })
      ).rejects.toThrow();
    });

    it('应该获取用户列表', async () => {
      const result = await UserApi.getUserList({
        page: 1,
        pageSize: 10,
      });

      expect(result.code).toBe(200);
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('应该创建新用户', async () => {
      const newUser = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        roles: ['user'],
      };

      const result = await UserApi.createUser(newUser);

      expect(result.code).toBe(200);
      expect(result.data.username).toBe('newuser');
      expect(result.data.id).toBe('3');
    });
  });
});
```

### 组件集成测试
```typescript
// tests/integration/user-management.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ElMessage } from 'element-plus';
import UserManagement from '@/views/UserManagement/index.vue';
import { UserApi } from '@/api/modules/user';

// Mock API
vi.mock('@/api/modules/user');
const mockedUserApi = vi.mocked(UserApi);

// Mock Element Plus Message
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus');
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    },
  };
});

describe('UserManagement Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('应该正确加载和显示用户列表', async () => {
    const mockUsers = [
      {
        id: '1',
        username: 'user1',
        email: 'user1@example.com',
        roles: ['user'],
        status: 'active' as const,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
    ];

    mockedUserApi.getUserList.mockResolvedValueOnce({
      code: 200,
      message: '获取成功',
      data: mockUsers,
      total: 1,
      current: 1,
      pageSize: 10,
      pages: 1,
    });

    const wrapper = mount(UserManagement, {
      global: {
        plugins: [createPinia()],
      },
    });

    // 等待组件加载完成
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockedUserApi.getUserList).toHaveBeenCalled();
    expect(wrapper.text()).toContain('user1');
  });

  it('应该处理用户删除操作', async () => {
    const mockUsers = [
      {
        id: '1',
        username: 'user1',
        email: 'user1@example.com',
        roles: ['user'],
        status: 'active' as const,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
    ];

    // Mock初始加载
    mockedUserApi.getUserList.mockResolvedValueOnce({
      code: 200,
      message: '获取成功',
      data: mockUsers,
      total: 1,
      current: 1,
      pageSize: 10,
      pages: 1,
    });

    // Mock删除操作
    mockedUserApi.deleteUser.mockResolvedValueOnce({
      code: 200,
      message: '删除成功',
      data: undefined,
    });

    // Mock删除后重新加载
    mockedUserApi.getUserList.mockResolvedValueOnce({
      code: 200,
      message: '获取成功',
      data: [],
      total: 0,
      current: 1,
      pageSize: 10,
      pages: 0,
    });

    const wrapper = mount(UserManagement, {
      global: {
        plugins: [createPinia()],
      },
    });

    // 等待初始加载
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 0));

    // 模拟删除操作
    const deleteButton = wrapper.find('[data-testid="delete-user-1"]');
    await deleteButton.trigger('click');

    // 确认删除
    const confirmButton = wrapper.find('[data-testid="confirm-delete"]');
    await confirmButton.trigger('click');

    expect(mockedUserApi.deleteUser).toHaveBeenCalledWith('1');
    expect(ElMessage.success).toHaveBeenCalledWith('删除成功');
  });
});
```

## 🌐 端到端测试

### Playwright 配置
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  
  // 并行运行测试
  fullyParallel: true,
  
  // 失败时重试
  retries: process.env.CI ? 2 : 0,
  
  // 并发worker数量
  workers: process.env.CI ? 1 : undefined,
  
  // 测试报告
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  
  use: {
    // 基础URL
    baseURL: 'http://localhost:5173',
    
    // 浏览器配置
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // 开发服务器
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 端到端测试用例
```typescript
// e2e/user-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('用户管理', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // 等待跳转到首页
    await page.waitForURL('/');
    
    // 导航到用户管理页面
    await page.click('[data-testid="user-management-menu"]');
    await page.waitForURL('/users');
  });

  test('应该显示用户列表', async ({ page }) => {
    // 等待用户列表加载
    await page.waitForSelector('[data-testid="user-table"]');
    
    // 检查表格是否存在
    const table = page.locator('[data-testid="user-table"]');
    await expect(table).toBeVisible();
    
    // 检查是否有用户数据
    const userRows = page.locator('[data-testid^="user-row-"]');
    await expect(userRows).toHaveCountGreaterThan(0);
  });

  test('应该能够搜索用户', async ({ page }) => {
    // 等待页面加载
    await page.waitForSelector('[data-testid="search-input"]');
    
    // 输入搜索关键词
    await page.fill('[data-testid="search-input"]', 'admin');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // 等待搜索结果
    await page.waitForTimeout(1000);
    
    // 检查搜索结果
    const userRows = page.locator('[data-testid^="user-row-"]');
    const count = await userRows.count();
    
    // 验证搜索结果包含关键词
    for (let i = 0; i < count; i++) {
      const userRow = userRows.nth(i);
      const text = await userRow.textContent();
      expect(text?.toLowerCase()).toContain('admin');
    }
  });

  test('应该能够创建新用户', async ({ page }) => {
    // 点击添加用户按钮
    await page.click('[data-testid="add-user-button"]');
    
    // 等待弹窗出现
    await page.waitForSelector('[data-testid="user-form-dialog"]');
    
    // 填写用户信息
    await page.fill('[data-testid="username-input"]', 'newuser');
    await page.fill('[data-testid="email-input"]', 'newuser@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    
    // 选择角色
    await page.click('[data-testid="roles-select"]');
    await page.click('[data-testid="role-option-user"]');
    
    // 提交表单
    await page.click('[data-testid="submit-button"]');
    
    // 等待成功消息
    await page.waitForSelector('[data-testid="success-message"]');
    
    // 验证用户已添加到列表
    await page.waitForTimeout(1000);
    const newUserRow = page.locator('[data-testid="user-row-newuser"]');
    await expect(newUserRow).toBeVisible();
  });

  test('应该能够编辑用户信息', async ({ page }) => {
    // 点击第一个用户的编辑按钮
    await page.click('[data-testid^="edit-user-"]:first-child');
    
    // 等待编辑弹窗
    await page.waitForSelector('[data-testid="user-form-dialog"]');
    
    // 修改用户名
    await page.fill('[data-testid="username-input"]', 'updateduser');
    
    // 提交修改
    await page.click('[data-testid="submit-button"]');
    
    // 等待成功消息
    await page.waitForSelector('[data-testid="success-message"]');
    
    // 验证修改已生效
    await page.waitForTimeout(1000);
    const updatedRow = page.locator('text=updateduser');
    await expect(updatedRow).toBeVisible();
  });

  test('应该能够删除用户', async ({ page }) => {
    // 获取删除前的用户数量
    const initialCount = await page.locator('[data-testid^="user-row-"]').count();
    
    // 点击第一个用户的删除按钮
    await page.click('[data-testid^="delete-user-"]:first-child');
    
    // 等待确认弹窗
    await page.waitForSelector('[data-testid="confirm-dialog"]');
    
    // 确认删除
    await page.click('[data-testid="confirm-delete-button"]');
    
    // 等待成功消息
    await page.waitForSelector('[data-testid="success-message"]');
    
    // 验证用户已被删除
    await page.waitForTimeout(1000);
    const finalCount = await page.locator('[data-testid^="user-row-"]').count();
    expect(finalCount).toBe(initialCount - 1);
  });

  test('应该正确处理分页', async ({ page }) => {
    // 等待分页组件加载
    await page.waitForSelector('[data-testid="pagination"]');
    
    // 检查当前页码
    const currentPage = page.locator('[data-testid="current-page"]');
    await expect(currentPage).toHaveText('1');
    
    // 如果有下一页，点击下一页
    const nextButton = page.locator('[data-testid="next-page"]');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      
      // 验证页码已更新
      await expect(currentPage).toHaveText('2');
      
      // 验证URL已更新
      await expect(page).toHaveURL(/page=2/);
    }
  });
});
```

## 📊 测试覆盖率和质量

### 覆盖率配置
```typescript
// vitest.config.ts 中的覆盖率配置
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      
      // 覆盖率阈值
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        // 特定文件的阈值
        'src/utils/': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'src/api/': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
      },
      
      // 排除文件
      exclude: [
        'coverage/**',
        'dist/**',
        '**/*.d.ts',
        'src/main.ts',
        'src/App.vue',
        '**/*.config.*',
        '**/mock/**',
      ],
    },
  },
});
```

### 测试质量检查
```typescript
// tests/utils/test-quality.ts

/**
 * 测试质量检查工具
 */
export class TestQualityChecker {
  /**
   * 检查测试文件命名规范
   */
  static checkTestFileNaming(filePath: string): boolean {
    const validPatterns = [
      /\.test\.(js|ts|jsx|tsx)$/,
      /\.spec\.(js|ts|jsx|tsx)$/,
    ];
    
    return validPatterns.some(pattern => pattern.test(filePath));
  }

  /**
   * 检查测试用例描述质量
   */
  static checkTestDescription(description: string): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    // 检查长度
    if (description.length < 10) {
      issues.push('测试描述过短，应该清楚说明测试内容');
    }
    
    if (description.length > 100) {
      issues.push('测试描述过长，应该简洁明了');
    }
    
    // 检查是否使用"应该"开头
    if (!description.startsWith('应该')) {
      issues.push('测试描述应该以"应该"开头，明确期望行为');
    }
    
    // 检查是否包含动词
    const hasAction = /应该.*?(能够|正确|成功|失败|返回|抛出|显示|隐藏)/.test(description);
    if (!hasAction) {
      issues.push('测试描述应该包含明确的动作词');
    }
    
    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * 检查测试用例结构
   */
  static checkTestStructure(testCode: string): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    // 检查是否有Arrange-Act-Assert结构
    const hasArrange = /\/\/ Arrange|\/\/ 准备/.test(testCode);
    const hasAct = /\/\/ Act|\/\/ 执行/.test(testCode);
    const hasAssert = /expect\(/.test(testCode);
    
    if (!hasAssert) {
      issues.push('测试用例缺少断言');
    }
    
    // 检查是否有过多的断言
    const assertCount = (testCode.match(/expect\(/g) || []).length;
    if (assertCount > 5) {
      issues.push('单个测试用例断言过多，建议拆分');
    }
    
    return {
      valid: issues.length === 0,
      issues,
    };
  }
}
```

## 📋 测试最佳实践

### 1. 测试命名规范
```typescript
// ✅ 好的测试命名
describe('UserService', () => {
  describe('createUser', () => {
    it('应该成功创建用户并返回用户信息', () => {});
    it('应该在邮箱已存在时抛出错误', () => {});
    it('应该在密码强度不足时抛出错误', () => {});
  });
});

// ❌ 不好的测试命名
describe('UserService', () => {
  it('test1', () => {});
  it('creates user', () => {});
  it('error case', () => {});
});
```

### 2. 测试数据管理
```typescript
// tests/fixtures/user.ts
export const createMockUser = (overrides: Partial<IUserInfo> = {}): IUserInfo => ({
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  roles: ['user'],
  status: 'active',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  ...overrides,
});

export const createMockUsers = (count: number): IUserInfo[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockUser({
      id: `${index + 1}`,
      username: `user${index + 1}`,
      email: `user${index + 1}@example.com`,
    })
  );
};
```

### 3. 异步测试处理
```typescript
// ✅ 正确的异步测试
it('应该正确处理异步操作', async () => {
  const promise = UserApi.getUserList();
  
  // 等待Promise完成
  const result = await promise;
  
  expect(result.code).toBe(200);
});

// ✅ 测试Promise拒绝
it('应该正确处理Promise拒绝', async () => {
  mockedApi.getUserList.mockRejectedValueOnce(new Error('网络错误'));
  
  await expect(UserApi.getUserList()).rejects.toThrow('网络错误');
});
```

### 4. Mock 使用规范
```typescript
// ✅ 正确的Mock使用
beforeEach(() => {
  vi.clearAllMocks();
});

it('应该调用API并处理响应', async () => {
  const mockResponse = { code: 200, data: [] };
  mockedApi.getUserList.mockResolvedValueOnce(mockResponse);
  
  const result = await service.getUsers();
  
  expect(mockedApi.getUserList).toHaveBeenCalledWith({ page: 1 });
  expect(result).toEqual([]);
});
```

通过遵循这些测试规范和最佳实践，可以构建出高质量、可维护的测试套件，确保代码质量和系统稳定性。
