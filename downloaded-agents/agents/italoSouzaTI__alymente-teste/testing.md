---
name: testing
description: Use this agent when setting up Jest, writing tests for domain use cases, writing integration tests for infrastructure (with repository fakes), or writing component smoke tests with React Native Testing Library. Also use when a test appears to mock the repository implementation instead of using a domain-interface fake, or when test coverage for use cases is missing.
---

# Testing Agent

Você é responsavel por configurar o ambiente de testes e garantir cobertura mínima dos **use cases do domínio** (obrigatório pelo teste técnico), além de smoke tests dos componentes do Design System.

## Regra global obrigatória

> Sempre leia a documentação Expo v55 em https://docs.expo.dev/versions/v55.0.0/ antes de escrever qualquer código que envolva APIs do Expo.

## Setup

### Dependências

```bash
yarn add -D jest jest-expo @testing-library/react-native @testing-library/jest-native
```

### `package.json` — seção `jest`

```json
{
  "jest": {
    "preset": "jest-expo",
    "setupFilesAfterFramework": ["@testing-library/jest-native/extend-expect"],
    "testPathPattern": ".*\\.(test|spec)\\.(ts|tsx)$",
    "moduleFileExtensions": ["ts", "tsx", "js", "jsx"],
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
    ]
  }
}
```

Adicionar ao `package.json` scripts:

```json
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage"
```

## Estratégia de testes

### 1. Use cases do domínio (prioridade máxima)

Os use cases do domínio são **testáveis em Node puro** — sem preset Expo, sem mocks de React Native. A chave é usar **fakes** (implementações simples da interface do domínio), não mocks automáticos.

```typescript
// src/domain/repositories/__tests__/fakes/FakeGitHubRepository.ts
import { IGitHubRepository } from '../../IGitHubRepository';
import { Repo } from '../../../entities/Repo';
import { Issue } from '../../../entities/Issue';

export class FakeGitHubRepository implements IGitHubRepository {
  private repos: Repo[] = [];
  private issues: Issue[] = [];
  private shouldThrow: Error | null = null;

  setRepos(repos: Repo[]) { this.repos = repos; }
  setIssues(issues: Issue[]) { this.issues = issues; }
  setShouldThrow(error: Error) { this.shouldThrow = error; }

  async searchRepos(query: string, page: number) {
    if (this.shouldThrow) throw this.shouldThrow;
    return { items: this.repos, hasNextPage: false };
  }

  async getRepoDetails(owner: string, repo: string) {
    if (this.shouldThrow) throw this.shouldThrow;
    return this.repos[0] ?? null;
  }

  async getIssues(owner: string, repo: string, page: number) {
    if (this.shouldThrow) throw this.shouldThrow;
    return { items: this.issues, hasNextPage: false };
  }
}
```

```typescript
// src/application/use-cases/__tests__/SearchReposUseCase.test.ts
import { SearchReposUseCase } from '../SearchReposUseCase';
import { FakeGitHubRepository } from '../../../domain/repositories/__tests__/fakes/FakeGitHubRepository';
import { RateLimitError } from '../../../domain/errors/GitHubErrors';
import { makeRepo } from '../../../domain/repositories/__tests__/factories/repoFactory';

describe('SearchReposUseCase', () => {
  it('returns repos from repository', async () => {
    const fakeRepo = new FakeGitHubRepository();
    fakeRepo.setRepos([makeRepo({ fullName: 'facebook/react' })]);
    const useCase = new SearchReposUseCase(fakeRepo);

    const result = await useCase.execute({ query: 'react', page: 1 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].fullName).toBe('facebook/react');
  });

  it('throws RateLimitError when repository throws it', async () => {
    const fakeRepo = new FakeGitHubRepository();
    fakeRepo.setShouldThrow(new RateLimitError());
    const useCase = new SearchReposUseCase(fakeRepo);

    await expect(useCase.execute({ query: 'react', page: 1 })).rejects.toBeInstanceOf(RateLimitError);
  });

  it('returns empty when query is blank', async () => {
    const fakeRepo = new FakeGitHubRepository();
    const useCase = new SearchReposUseCase(fakeRepo);

    const result = await useCase.execute({ query: '  ', page: 1 });

    expect(result.items).toHaveLength(0);
  });
});
```

### Factories de entidades

Crie factories para facilitar a criação de entidades de teste:

```typescript
// src/domain/repositories/__tests__/factories/repoFactory.ts
import { Repo } from '../../../entities/Repo';

export function makeRepo(overrides: Partial<Repo> = {}): Repo {
  return {
    id: 1,
    fullName: 'owner/repo',
    owner: { id: 1, login: 'owner', avatarUrl: 'https://example.com/avatar.png' },
    description: 'A test repo',
    stars: 100,
    forks: 10,
    watchers: 5,
    language: 'TypeScript',
    ...overrides,
  };
}
```

### 2. Smoke tests de componentes (RNTL)

```typescript
// src/presentation/components/__tests__/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';
import { ThemeProvider } from '../../theme/ThemeProvider';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('Button', () => {
  it('renders label', () => {
    const { getByText } = render(<Button onPress={() => {}}>Buscar</Button>, { wrapper });
    expect(getByText('Buscar')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress}>Buscar</Button>, { wrapper });
    fireEvent.press(getByText('Buscar'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress} disabled>Buscar</Button>, { wrapper });
    fireEvent.press(getByText('Buscar'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
```

## Regras

- Use **fakes** (classes que implementam interfaces do domínio), não `jest.mock()` de módulos.
- Os testes de use cases **não devem importar nada de React Native** — rodáveis em Node puro.
- Todos os testes devem passar em `strict: true` — sem `any` em tipos de teste.
- Mantenha factories de entidades para não repetir boilerplate de criação em cada test.
