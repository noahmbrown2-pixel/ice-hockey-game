# Troubleshooting Trees Skill

Auto-triggered skill for systematic problem diagnosis.

## Trigger Phrases

- "troubleshoot"
- "debug"
- "diagnose"
- "steps to fix"
- "not working"

## Troubleshooting Framework

### General Approach
1. **Reproduce**: Can we observe the issue?
2. **Isolate**: What's unique about this case?
3. **Identify**: What's the root cause?
4. **Resolve**: Apply the fix
5. **Verify**: Confirm resolution

## Common Issue Trees

### Login/Authentication Issues

```
User can't log in
├── Is the service up?
│   ├── No → Check status page, report outage
│   └── Yes → Continue
├── Error message shown?
│   ├── "Invalid credentials"
│   │   ├── Password reset
│   │   └── Check caps lock, copy-paste issues
│   ├── "Account locked"
│   │   └── Check lockout policy, unlock account
│   ├── "Session expired"
│   │   └── Clear cookies, try incognito
│   └── "SSO error"
│       └── Check SSO configuration, IdP status
├── No error, just fails
│   ├── Try different browser
│   ├── Check JavaScript enabled
│   └── Clear cache and cookies
└── Works in incognito?
    ├── Yes → Browser extension conflict
    └── No → Account/server issue
```

### Performance Issues

```
Application is slow
├── Is it slow for everyone?
│   ├── Yes → Check server performance, known issues
│   └── No → User-specific, continue
├── Which part is slow?
│   ├── Initial load
│   │   ├── Check network speed
│   │   ├── Check browser cache
│   │   └── Check for large file downloads
│   ├── Specific feature
│   │   ├── Data volume issue
│   │   ├── Feature-specific bug
│   │   └── Integration bottleneck
│   └── Everything
│       ├── Check local resources (RAM, CPU)
│       ├── VPN/network issues
│       └── Browser issues (try different)
└── When did it start?
    ├── After update → Possible regression
    ├── After account change → Configuration issue
    └── Gradually → Data growth or resource exhaustion
```

### Integration Issues

```
Integration not working
├── Was it working before?
│   ├── Yes → What changed?
│   │   ├── Credentials expired
│   │   ├── API version updated
│   │   └── Permission changed
│   └── No (new setup) → Configuration check
├── Connection test
│   ├── Can't connect at all
│   │   ├── Firewall/network
│   │   ├── URL/endpoint wrong
│   │   └── Service down
│   └── Connects but errors
│       ├── Authentication error → Credentials
│       ├── Permission error → Scope/access
│       └── Data error → Format/validation
└── Error in logs?
    └── Use specific error to diagnose
```

### Data/Sync Issues

```
Data not syncing
├── Source has data?
│   ├── No → Source-side issue
│   └── Yes → Continue
├── Sync enabled?
│   ├── Check sync status/toggle
│   └── Check sync schedule
├── Last successful sync?
│   ├── Never → Initial setup issue
│   ├── Recently → Check what's different
│   └── Long ago → Likely connection/auth issue
├── Specific records or all?
│   ├── Specific → Data validation issue
│   └── All → Systemic problem
└── Error messages?
    └── Parse error for specific cause
```

## Troubleshooting Template

```markdown
## Troubleshooting: {Issue Type}

### Reported Problem
{Customer's description}

### Environment
- Product version:
- Browser/OS:
- Account type:

### Diagnostic Steps
- [ ] Step 1: {action}
  - Expected: {result}
  - Actual: {result}

- [ ] Step 2: {action}
  - Expected: {result}
  - Actual: {result}

### Findings
{What was discovered}

### Resolution
{Solution applied}

### Verification
- [ ] Customer confirmed working
- [ ] Reproduced and verified fix
```

## Escalation Criteria

Escalate to engineering when:
- Issue reproducible but no known solution
- Data corruption or loss suspected
- Security concern identified
- Bug confirmed in code
