# Estándares de Testing para Code Mode

## Filosofía de Testing

### Testing Pyramid

```
    /\      E2E (10%)
   /  \     
  /____\    Integration (20%)
 /______\   Unit Tests (70%)
```

### Principios FIRST

- **Fast**: Tests deben ejecutarse rápidamente
- **Independent**: Tests no deben depender entre sí
- **Repeatable**: Resultados consistentes en cualquier ambiente
- **Self-Validating**: Test debe tener resultado claro (pass/fail)
- **Timely**: Tests escritos antes o durante desarrollo

## Unit Testing

### Estructura de Tests

```typescript
// Usar patrón AAA (Arrange, Act, Assert)
describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockEmailService: jest.Mocked<EmailService>;

  beforeEach(() => {
    // Arrange - Setup
    mockUserRepository = createMockUserRepository();
    mockEmailService = createMockEmailService();
    userService = new UserService(mockUserRepository, mockEmailService);
  });

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = { email: 'test@example.com', name: 'Test User' };
      const expectedUser = new User({ ...userData, id: 'uuid-123' });
      mockUserRepository.save.mockResolvedValue(expectedUser);

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(userData)
      );
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(expectedUser);
    });

    it('should throw error when user already exists', async () => {
      // Arrange
      const userData = { email: 'existing@example.com', name: 'Test User' };
      mockUserRepository.findByEmail.mockResolvedValue(new User(userData));

      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow(
        UserAlreadyExistsError
      );
    });
  });
});
```

### Mocking Guidelines

```typescript
// ✅ Mock external dependencies
const mockAxios = axios as jest.Mocked<typeof axios>;
mockAxios.get.mockResolvedValue({ data: { id: 1, name: 'Test' } });

// ✅ Use factory functions para mocks complejos
function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'test-id',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
    ...overrides
  };
}

// ✅ Mock modules con jest.mock
jest.mock('../services/EmailService', () => ({
  EmailService: jest.fn().mockImplementation(() => ({
    sendWelcomeEmail: jest.fn(),
    sendPasswordReset: jest.fn()
  }))
}));

// ❌ No mockear lo que estás testando
// ❌ No usar mocks muy específicos que hagan test frágil
```

### Test Data Builders

```typescript
class UserBuilder {
  private user: Partial<User> = {};

  withEmail(email: string): UserBuilder {
    this.user.email = email;
    return this;
  }

  withName(name: string): UserBuilder {
    this.user.name = name;
    return this;
  }

  withRole(role: UserRole): UserBuilder {
    this.user.role = role;
    return this;
  }

  build(): User {
    return new User({
      id: 'test-id',
      email: 'test@example.com',
      name: 'Test User',
      role: UserRole.USER,
      createdAt: new Date(),
      ...this.user
    });
  }
}

// Uso
const adminUser = new UserBuilder()
  .withEmail('admin@example.com')
  .withRole(UserRole.ADMIN)
  .build();
```

## Integration Testing

### Database Integration

```typescript
describe('UserRepository Integration', () => {
  let repository: UserRepository;
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = await TestDatabase.create();
    repository = new DatabaseUserRepository(testDb.connection);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  beforeEach(async () => {
    await testDb.seed();
  });

  afterEach(async () => {
    await testDb.clear();
  });

  it('should save and retrieve user', async () => {
    // Arrange
    const userData = { email: 'test@example.com', name: 'Test User' };
    const user = new User(userData);

    // Act
    const savedUser = await repository.save(user);
    const retrievedUser = await repository.findById(savedUser.id);

    // Assert
    expect(retrievedUser).toEqual(savedUser);
    expect(retrievedUser.email).toBe(userData.email);
  });
});
```

### API Integration Testing

```typescript
describe('User API Integration', () => {
  let app: Application;
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = await TestDatabase.create();
    app = await createTestApp(testDb.connection);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  describe('POST /api/users', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'SecurePass123!'
      };

      // Act
      const response = await request(app)
        .post('/api/users')
        .send(userData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        email: userData.email,
        name: userData.name
      });
      expect(response.body.password).toBeUndefined();
    });

    it('should return 400 for invalid email', async () => {
      // Arrange
      const userData = {
        email: 'invalid-email',
        name: 'Test User',
        password: 'SecurePass123!'
      };

      // Act
      const response = await request(app)
        .post('/api/users')
        .send(userData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('Invalid email format');
    });
  });
});
```

## Test Configuration

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.(ts|js)',
    '**/*.test.(ts|js)',
    '**/*.spec.(ts|js)'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
    '!src/**/*.config.{ts,js}'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testTimeout: 10000,
  clearMocks: true,
  restoreMocks: true
};
```

### Test Setup

```typescript
// src/test/setup.ts
import { TestDatabase } from './utils/TestDatabase';

// Global test setup
beforeAll(async () => {
  // Setup global test configuration
});

afterAll(async () => {
  // Cleanup global resources
});

// Custom matchers
expect.extend({
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid email`,
      pass
    };
  }
});
```

## Performance Testing

### Load Testing

```typescript
describe('User Service Performance', () => {
  it('should handle concurrent user creation', async () => {
    const userPromises = Array.from({ length: 100 }, (_, i) =>
      userService.createUser({
        email: `user${i}@example.com`,
        name: `User ${i}`
      })
    );

    const startTime = performance.now();
    const users = await Promise.all(userPromises);
    const endTime = performance.now();

    expect(users).toHaveLength(100);
    expect(endTime - startTime).toBeLessThan(5000); // 5 seconds max
  });

  it('should not have memory leaks', async () => {
    const initialMemory = process.memoryUsage().heapUsed;

    // Ejecutar operaciones que podrían causar memory leaks
    for (let i = 0; i < 1000; i++) {
      await userService.createUser({
        email: `user${i}@example.com`,
        name: `User ${i}`
      });
    }

    // Force garbage collection
    if (global.gc) {
      global.gc();
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;

    // Memory increase should be reasonable
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB max
  });
});
```

## Coverage y Quality Gates

### Coverage Reports

```bash
# Generar reporte de coverage
npm run test:coverage

# Coverage por tipo
npm run test:unit:coverage
npm run test:integration:coverage

# Watch mode para desarrollo
npm run test:watch
```

### Quality Metrics

- **Coverage mínimo**: 80% líneas, 80% branches
- **Mutation testing**: 70% mutation score
- **Performance**: Tests deben ejecutarse en < 30 segundos
- **Flakiness**: < 1% de tests flaky
