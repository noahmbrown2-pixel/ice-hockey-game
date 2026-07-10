---
name: data_ingestion_script
description: data ingestion script
tools: Read,Write,Bash
model: sonnet
---
Create Python script to ingest weather data from OpenWeatherMap API.

Your task:
1. Create src/database/ingest_weather.py with:
   - Fetch data from OpenWeatherMap API
   - Parse JSON response
   - Insert into TimescaleDB
   - Batch processing for efficiency
   - Error handling and logging
   - Schedule with cron capability

2. Use schema from src/database/schema.sql
3. Use connection from config/database.py