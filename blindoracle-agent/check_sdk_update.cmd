@echo off
rem Daily: upgrade blindoracle-sdk in the local venv and log the version.
cd /d "%~dp0"
for /f "tokens=2" %%v in ('.venv\Scripts\python -m pip show blindoracle-sdk ^| findstr /b Version') do set OLD=%%v
.venv\Scripts\python -m pip install -q --upgrade blindoracle-sdk >nul 2>&1
for /f "tokens=2" %%v in ('.venv\Scripts\python -m pip show blindoracle-sdk ^| findstr /b Version') do set NEW=%%v
if "%OLD%"=="%NEW%" (
  echo %date% %time% no update, still %NEW%>> sdk_updates.log
) else (
  echo %date% %time% UPDATED %OLD% -^> %NEW%>> sdk_updates.log
)
