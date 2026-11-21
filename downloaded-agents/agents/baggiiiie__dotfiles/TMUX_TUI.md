# Using tmux to drive a TUI

This is a small recipe for launching a terminal UI inside `tmux`, sending keys to it, and inspecting what it rendered.

## Example command set

```bash
# start a named session and run the TUI inside it
tmux new-session -d -s $SessionName '$ProcessName'

# Reuse the session if it already exists
tmux new-session -A -s $SessionName '$SessionName'

# press keys
tmux send-keys -t $SessionName 'j' 'j' 'j'
tmux send-keys -t $SessionName Enter
tmux send-keys -t $SessionName C-c

# Start in a specific working directory
tmux new-session -d -s $SessionName -c /path/to/repo 'go run ./cmd/$SessionName'

# inspect without color
tmux capture-pane -p -t $SessionName | tail -n 30

# To include terminal escape sequences (ANSI styling/colors), capture with `-e`:
# This is useful when you want to confirm that the TUI is emitting styling
tmux capture-pane -e -p -t $SessionName > /tmp/$SessionName-pane.ansi

# For a more explicit view of the escapes:
tmux capture-pane -e -p -t $SessionName | sed -n 'l'

# attach visually
tmux attach -t $SessionName

# kill a session
tmux kill-session -t $SessionName
```

## Example workflow:

```bash
tmux send-keys -t $SessionName 'w' 'b'
sleep 0.2
tmux capture-pane -p -t $SessionName | tail -n 30
```

This is the easiest way to understand:
- what screen is open
- whether a menu/modal appeared
- where the cursor/focus likely moved
- what help/footer text is visible

## Practical note

For an automated coding agent, the usual pattern is:
1. start the TUI in detached tmux
2. send a key sequence
3. capture the pane as plain text
4. optionally capture again with `-e` if color/styling matters
5. repeat

That is enough to drive many TUIs reliably without taking over your terminal.
