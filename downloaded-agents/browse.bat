@echo off
REM One-click launcher: starts the agent browser and opens it in your default browser.
cd /d "%~dp0"
python browse.py --open %*
