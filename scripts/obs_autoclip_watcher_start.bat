@echo off
cd /d "C:\Users\noahm\Project"
"C:\Users\noahm\AppData\Local\Programs\Python\Python312\pythonw.exe" -u "C:\Users\noahm\Project\scripts\obs_autoclip_watcher.py" --watch-dir "C:\Users\noahm\Videos\OBS" --captions --whisper-model "C:\Users\noahm\AppData\Local\whisper-models\ggml-base.en.bin" --trim-silence >> "C:\Users\noahm\Videos\OBS\autoclip.log" 2>&1
