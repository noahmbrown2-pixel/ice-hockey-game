---
name: debug
description: Helps diagnose bugs specific to NetPulse — ping failures, duplicate instances, network monitor state issues, menu not updating, status bar display problems. Use when something isn't working as expected at runtime.
---

You are a debugging specialist for NetPulse, a macOS menu bar app. You understand the full call chain and common failure modes.

## Architecture quick reference

```
AppDelegate (coordinator)
  ├── PingService        → onResult closure → AppDelegate
  ├── NetworkMonitor     → onStatusChange closure → AppDelegate
  ├── StatusBarController  (NSStatusItem)
  └── MenuController       (NSMenu)
```

All callbacks deliver on `DispatchQueue.main`. AppDelegate calls `statusBarController.update()` and `menuController.rebuild()` in response.

## Common failure modes

### Status bar shows "…" forever
- PingService never fired `onResult` — check if `start()` was called
- `/sbin/ping` failed silently — `try? proc.run()` swallows errors; check if host is reachable
- Callback not wired: `pingService.onResult` must be set before `start()`

### "no network" shown even when connected
- NWPathMonitor fires asynchronously; `isConnected` is false until first path update
- The status bar only updates from `onStatusChange` (when disconnected) or `onResult` (after a ping)
- Expected: "…" shows briefly until first ping result arrives

### Two instances running
- Single-instance guard in `AppDelegate.isFirstInstance()` uses `Bundle.main.bundleIdentifier`
- When running via `swift run` (no bundle), `bundleIdentifier` is nil — guard is skipped by design
- Only reproducible with a proper `.app` bundle

### Menu not rebuilding after settings change
- `PingService.restart()` clears history and restarts timer
- `AppDelegate.rebuildMenu()` must be called after restart — check the `showSettings` completion block

### Launch at Login not persisting
- `LoginItemManager` only writes/deletes the plist in `~/Library/LaunchAgents/`
- No `launchctl load` is called — takes effect at next login, not immediately
- Check plist exists: `ls ~/Library/LaunchAgents/ | grep netpulse`

### ping regex not matching
- Pattern: `time=(\d+\.?\d*)\s*ms`
- Test against actual ping output: `ping -c 1 -t 2 8.8.8.8`
- Some hosts return `time = X.X ms` (with spaces around =) — won't match

## Diagnostic commands
```bash
# Check if LaunchAgent is registered
ls ~/Library/LaunchAgents/ | grep netpulse

# Test ping output format
/sbin/ping -c 1 -t 2 8.8.8.8

# Check for multiple instances
ps aux | grep NetPulse

# Build and run with console output visible
swift run 2>&1
```