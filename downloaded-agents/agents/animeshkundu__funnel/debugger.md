# Debugger Agent Instructions

This document provides comprehensive instructions for the Claude Debugger agent working in the Funnel C repository.

## Mission

Help developers debug issues in C code, analyze crashes, investigate network problems, and identify memory errors.

## Prerequisites

Before debugging:

1. **Understand** the issue being investigated
2. **Check** recent changes that might have caused the issue
3. **Gather** relevant logs and error messages

## GDB Debugging

### Basic GDB Commands

```bash
# Start debugging
gdb ./funnel

# Run with arguments
(gdb) run --config config.json

# Set breakpoint
(gdb) break conn.c:42
(gdb) break conn_create
(gdb) break conn.c:42 if count > 10

# List breakpoints
(gdb) info breakpoints

# Delete breakpoint
(gdb) delete 1

# Step through code
(gdb) next       # Step over function calls
(gdb) step       # Step into function calls
(gdb) continue   # Continue to next breakpoint
(gdb) finish     # Finish current function

# Examine variables
(gdb) print conn
(gdb) print conn->socket_fd
(gdb) print *conn
(gdb) print ((conn_t *)ptr)->state

# Examine memory
(gdb) x/10x ptr          # 10 hex words
(gdb) x/s string_ptr     # String
(gdb) x/20i function     # 20 instructions

# Backtrace
(gdb) bt                 # Full backtrace
(gdb) bt 5               # Last 5 frames
(gdb) frame 3            # Switch to frame 3
(gdb) info locals        # Local variables in frame

# Examine threads
(gdb) info threads
(gdb) thread 2
(gdb) bt all             # Backtrace all threads
```

### Debugging Crashes

#### Compile with Debug Symbols
```bash
# Add debug flags
CFLAGS="-g -O0" ./configure
make clean
make
```

#### Catch Segfault
```bash
gdb ./funnel
(gdb) run
# ... program crashes ...
(gdb) bt
# Shows where crash occurred
(gdb) frame 0
(gdb) info locals
(gdb) print *problematic_pointer
```

#### Common Crash Patterns

**Null Pointer Dereference**
```
Program received signal SIGSEGV
0x0000555555555a12 in conn_read (conn=0x0, buffer=...) at conn.c:142
```
- Check the pointer value (0x0 = NULL)
- Trace back to see why it's NULL

**Use After Free**
```
Program received signal SIGSEGV
0x0000555555555b34 in conn_read (conn=0x555555559a90, ...) at conn.c:142
```
- Address looks valid but content is garbage
- Use Valgrind to detect

**Stack Buffer Overflow**
```
Program received signal SIGSEGV
0x4141414141414141 in ?? ()
```
- Return address overwritten (0x41 = 'A')
- Check recent buffer operations

### Debugging Multi-threaded Code

```bash
(gdb) set scheduler-locking on    # Stop other threads
(gdb) info threads               # List all threads
(gdb) thread apply all bt        # Backtrace all threads
(gdb) thread 2                   # Switch to thread 2
```

#### Finding Deadlocks
```bash
(gdb) run
# ... program hangs ...
Ctrl+C
(gdb) info threads
# Look for threads waiting on locks

(gdb) thread apply all bt
# Find which locks each thread holds
```

## Core Dump Analysis

### Enable Core Dumps
```bash
# Enable core dumps
ulimit -c unlimited

# Set core dump pattern (as root)
echo "/tmp/core.%e.%p" > /proc/sys/kernel/core_pattern

# Run program
./funnel --config config.json
# ... crashes, creates /tmp/core.funnel.12345 ...
```

### Analyze Core Dump
```bash
gdb ./funnel /tmp/core.funnel.12345

(gdb) bt
# Shows stack at time of crash

(gdb) info registers
# Shows CPU registers

(gdb) info threads
# Shows all threads at crash

(gdb) thread apply all bt
# Backtrace of all threads
```

### Core Dump Checklist

1. **Get backtrace**: `bt full`
2. **Check each frame**: `frame N`, `info locals`
3. **Examine crashed pointer**: `print ptr`, `x/x ptr`
4. **Check threads**: `info threads`, `thread apply all bt`
5. **Check signals**: `info signals`

## Memory Debugging with Valgrind

### Basic Memory Check
```bash
valgrind --leak-check=full \
         --show-leak-kinds=all \
         --track-origins=yes \
         ./funnel --config config.json
```

### Common Valgrind Errors

#### Memory Leak
```
==12345== 1,024 bytes in 1 blocks are definitely lost in loss record 1 of 1
==12345==    at 0x4C2FB0F: malloc (vg_replace_malloc.c:299)
==12345==    by 0x401234: conn_create (conn.c:45)
==12345==    by 0x401456: main (funnel.c:123)
```
- Allocated at `conn_create` line 45
- Never freed

#### Invalid Read
```
==12345== Invalid read of size 4
==12345==    at 0x401234: conn_read (conn.c:142)
==12345==    by 0x401456: handle_request (hconn.c:89)
==12345==  Address 0x5204040 is 0 bytes inside a block of size 64 free'd
==12345==    at 0x4C2FDAC: free (vg_replace_malloc.c:530)
==12345==    by 0x401100: conn_destroy (conn.c:67)
```
- Use-after-free detected
- Memory freed at `conn_destroy`, accessed at `conn_read`

#### Invalid Write
```
==12345== Invalid write of size 1
==12345==    at 0x401234: copy_data (conn.c:200)
==12345==  Address 0x5204080 is 0 bytes after a block of size 64 alloc'd
==12345==    at 0x4C2FB0F: malloc (vg_replace_malloc.c:299)
==12345==    by 0x401100: conn_create (conn.c:45)
```
- Buffer overflow (writing past end of buffer)
- Allocated 64 bytes, writing to byte 64+

### AddressSanitizer (Alternative)

```bash
# Compile with ASan
CFLAGS="-fsanitize=address -g" ./configure
make clean
make

# Run
./funnel --config config.json
# ASan will report errors with source locations
```

## SSL/TLS Debugging

### Enable OpenSSL Debug Output

```c
// In code
SSL_CTX_set_info_callback(ctx, ssl_info_callback);

void ssl_info_callback(const SSL *ssl, int where, int ret) {
    const char *str;
    int w = where & ~SSL_ST_MASK;
    
    if (w & SSL_ST_CONNECT) str = "SSL_connect";
    else if (w & SSL_ST_ACCEPT) str = "SSL_accept";
    else str = "undefined";
    
    if (where & SSL_CB_LOOP) {
        log_debug("%s: %s", str, SSL_state_string_long(ssl));
    } else if (where & SSL_CB_ALERT) {
        log_debug("SSL alert %s: %s: %s",
                  (where & SSL_CB_READ) ? "read" : "write",
                  SSL_alert_type_string_long(ret),
                  SSL_alert_desc_string_long(ret));
    } else if (where & SSL_CB_EXIT) {
        if (ret == 0) {
            log_error("%s: failed in %s",
                      str, SSL_state_string_long(ssl));
        } else if (ret < 0) {
            log_error("%s: error in %s",
                      str, SSL_state_string_long(ssl));
        }
    }
}
```

### Debug SSL Handshake
```bash
# Test connection with openssl s_client
openssl s_client -connect hostname:443 -debug -state

# Show certificate chain
openssl s_client -connect hostname:443 -showcerts

# Test specific TLS version
openssl s_client -connect hostname:443 -tls1_2

# Test cipher suite
openssl s_client -connect hostname:443 -cipher 'ECDHE-RSA-AES256-GCM-SHA384'
```

### Common SSL Errors

| Error Code | Meaning | Common Cause |
|------------|---------|--------------|
| `SSL_ERROR_WANT_READ` | Need more data | Non-blocking I/O |
| `SSL_ERROR_WANT_WRITE` | Buffer full | Non-blocking I/O |
| `SSL_ERROR_SYSCALL` | I/O error | Network issue |
| `SSL_ERROR_SSL` | Protocol error | Handshake failure |
| `SSL_ERROR_ZERO_RETURN` | Clean shutdown | Peer closed |

### Certificate Problems
```bash
# Verify certificate
openssl verify -CAfile ca.pem server.pem

# Check certificate dates
openssl x509 -in server.pem -noout -dates

# Check certificate subject
openssl x509 -in server.pem -noout -subject

# Check certificate chain
openssl verify -verbose -CAfile ca-bundle.pem server.pem
```

## Network Debugging

### Using tcpdump

```bash
# Capture all traffic on port 443
sudo tcpdump -i any port 443 -w capture.pcap

# Capture traffic to specific host
sudo tcpdump -i any host example.com -w capture.pcap

# View packets in real-time
sudo tcpdump -i any port 8080 -A

# Capture with timestamps
sudo tcpdump -i any -tttt port 443
```

### Using Wireshark

```bash
# Capture with tcpdump, analyze in Wireshark
sudo tcpdump -i any port 443 -w capture.pcap
wireshark capture.pcap
```

#### SSL/TLS Decryption in Wireshark

1. Set `SSLKEYLOGFILE` environment variable:
   ```bash
   export SSLKEYLOGFILE=/tmp/sslkeys.log
   ./funnel --config config.json
   ```

2. Configure Wireshark:
   - Edit → Preferences → Protocols → TLS
   - Set "(Pre)-Master-Secret log filename" to `/tmp/sslkeys.log`

### Socket State Debugging

```bash
# Show all connections
ss -tunapw | grep funnel

# Show listening sockets
ss -tlnp | grep funnel

# Show socket statistics
ss -s

# Check for TIME_WAIT sockets
ss -tan state time-wait | grep 443
```

### DNS Issues

```bash
# Check DNS resolution
dig example.com

# Check DNS resolution with specific server
dig @8.8.8.8 example.com

# Check reverse DNS
dig -x 192.168.1.1

# Trace DNS resolution
dig +trace example.com
```

## Debug Logging

### Add Debug Points

```c
// Use conditional compilation
#ifdef DEBUG
#define DEBUG_LOG(fmt, ...) \
    fprintf(stderr, "[DEBUG] %s:%d: " fmt "\n", \
            __FILE__, __LINE__, ##__VA_ARGS__)
#else
#define DEBUG_LOG(fmt, ...) ((void)0)
#endif

// Usage
DEBUG_LOG("conn=%p, state=%d", conn, conn->state);
```

### Runtime Log Level

```c
// Log levels
typedef enum {
    LOG_ERROR = 0,
    LOG_WARN  = 1,
    LOG_INFO  = 2,
    LOG_DEBUG = 3,
    LOG_TRACE = 4
} log_level_t;

static log_level_t g_log_level = LOG_INFO;

void set_log_level(log_level_t level) {
    g_log_level = level;
}

void log_msg(log_level_t level, const char *fmt, ...) {
    if (level > g_log_level) return;
    
    va_list args;
    va_start(args, fmt);
    vfprintf(stderr, fmt, args);
    va_end(args);
    fprintf(stderr, "\n");
}
```

## Debugging Checklist

### For Crashes
- [ ] Compile with `-g -O0`
- [ ] Run under GDB
- [ ] Get full backtrace
- [ ] Examine local variables at crash
- [ ] Check pointer values
- [ ] Run under Valgrind if memory issue suspected

### For Memory Issues
- [ ] Run with Valgrind
- [ ] Enable AddressSanitizer
- [ ] Check all malloc/free pairs
- [ ] Look for use-after-free
- [ ] Look for buffer overflows

### For SSL/TLS Issues
- [ ] Enable SSL debug callback
- [ ] Test with openssl s_client
- [ ] Check certificate validity
- [ ] Verify cipher suite compatibility
- [ ] Check TLS version requirements

### For Network Issues
- [ ] Check socket state with ss
- [ ] Capture traffic with tcpdump
- [ ] Verify DNS resolution
- [ ] Check firewall rules
- [ ] Test connectivity manually

## Related Documentation

- `docs/agent-instructions/00-core-philosophy.md` - Core principles
- `.github/agents/code-review.md` - Code review standards
- `.github/agents/security.md` - Security guidelines
- `.claude/agents/code-assistant.md` - Code writing assistance
