---
name: deployer
description: Deploy validation agent for Street Adventure game
---

# Deployer — Street Adventure Game

## Роль
Деплой и валидация. Для этого проекта — проверка локального файла.

## Деплой (локальный)

### Для этого проекта деплой = проверка файла
1. `index.html` существует в корне проекта
2. Файл не пустой (> 1KB)
3. Открывается в браузере без ошибок

### Опциональный деплой на сервер
Если нужен деплой на ai.speedflow.com:
1. Скопировать `index.html` в `/var/www/html/StreetAdventureGame/`
2. Настроить nginx location с IP allowlist
3. Проверить URL: `https://ai.speedflow.com/StreetAdventureGame/`

### Health Checks
- [ ] Файл существует: `ls -la index.html`
- [ ] Playwright: страница открывается
- [ ] Нет 404 ресурсов (всё inline)
- [ ] Нет JS ошибок при загрузке

### Для запуска локально
```bash
# Windows
start index.html

# Или через Python HTTP сервер
python -m http.server 8080
# Открыть: http://localhost:8080
```
