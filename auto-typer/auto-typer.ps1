# Auto Typer - save text snippets, press F1-F12 anywhere to type them.
# Types real keystrokes (SendInput), so it works where paste is blocked.
# Snippets are saved to %APPDATA%\AutoTyper\snippets.txt

$code = @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Windows.Forms;

public class Snippet {
    public string Name = "New snippet";
    public int Hotkey;          // 0 = none, 1..12 = F1..F12
    public string Text = "";
    public override string ToString() { return (Hotkey > 0 ? "[F" + Hotkey + "]  " : "") + Name; }
}

public class AutoTyperForm : Form {
    [DllImport("user32.dll")] static extern bool RegisterHotKey(IntPtr hWnd, int id, uint mods, uint vk);
    [DllImport("user32.dll")] static extern bool UnregisterHotKey(IntPtr hWnd, int id);
    [DllImport("user32.dll", SetLastError = true)] static extern uint SendInput(uint n, INPUT[] inputs, int size);

    [StructLayout(LayoutKind.Sequential)] struct INPUT { public uint type; public InputUnion u; }
    [StructLayout(LayoutKind.Explicit)] struct InputUnion { [FieldOffset(0)] public MOUSEINPUT mi; [FieldOffset(0)] public KEYBDINPUT ki; }
    [StructLayout(LayoutKind.Sequential)] struct MOUSEINPUT { public int dx, dy; public uint mouseData, dwFlags, time; public IntPtr dwExtraInfo; }
    [StructLayout(LayoutKind.Sequential)] struct KEYBDINPUT { public ushort wVk, wScan; public uint dwFlags, time; public IntPtr dwExtraInfo; }

    const int WM_HOTKEY = 0x0312;
    const int ESC_ID = 100;
    const uint KEYUP = 0x2, UNICODE = 0x4;

    List<Snippet> snippets = new List<Snippet>();
    string saveFile = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "AutoTyper", "snippets.txt");
    volatile bool cancel;
    bool typing, loading;

    ListBox list = new ListBox();
    TextBox nameBox = new TextBox();
    ComboBox hotkeyBox = new ComboBox();
    TextBox textBox = new TextBox();
    NumericUpDown speedBox = new NumericUpDown();
    NumericUpDown repeatBox = new NumericUpDown();
    CheckBox humanBox = new CheckBox();
    Label status = new Label();

    public AutoTyperForm() {
        Text = "Auto Typer";
        Font = new Font("Segoe UI", 10);
        ClientSize = new Size(640, 440);
        FormBorderStyle = FormBorderStyle.FixedSingle;
        MaximizeBox = false;

        list.SetBounds(10, 10, 200, 370);
        list.SelectedIndexChanged += delegate { ShowSelected(); };
        Controls.Add(list);
        AddButton("New", 10, 390, 95, delegate { NewSnippet(); });
        AddButton("Delete", 115, 390, 95, delegate { DeleteSnippet(); });

        AddLabel("Name", 225, 13);
        nameBox.SetBounds(300, 10, 330, 25); Controls.Add(nameBox);

        AddLabel("Hotkey", 225, 48);
        hotkeyBox.DropDownStyle = ComboBoxStyle.DropDownList;
        hotkeyBox.Items.Add("None");
        for (int i = 1; i <= 12; i++) hotkeyBox.Items.Add("F" + i);
        hotkeyBox.SetBounds(300, 45, 100, 25); Controls.Add(hotkeyBox);

        AddLabel("Text", 225, 83);
        textBox.Multiline = true; textBox.AcceptsReturn = true; textBox.AcceptsTab = true;
        textBox.ScrollBars = ScrollBars.Vertical;
        textBox.SetBounds(300, 80, 330, 170); Controls.Add(textBox);

        AddLabel("Speed (chars/min)", 225, 265);
        speedBox.Minimum = 30; speedBox.Maximum = 3000; speedBox.Increment = 50; speedBox.Value = 600;
        speedBox.SetBounds(370, 262, 90, 25); Controls.Add(speedBox);

        AddLabel("Repeat", 480, 265);
        repeatBox.Minimum = 1; repeatBox.Maximum = 999; repeatBox.Value = 1;
        repeatBox.SetBounds(540, 262, 90, 25); Controls.Add(repeatBox);

        humanBox.Text = "Human-like timing (random variation)";
        humanBox.SetBounds(225, 295, 405, 25); Controls.Add(humanBox);

        AddButton("Save snippet", 225, 330, 130, delegate { SaveSnippet(); });
        AddButton("Type in 3 seconds", 365, 330, 160, delegate {
            SetStatus("Click where you want to type... (3s)");
            StartTyping(textBox.Text, 3000);
        });

        status.SetBounds(225, 375, 405, 50);
        status.ForeColor = Color.DimGray;
        Controls.Add(status);

        Load();
        RefreshList(0);
        SetStatus("Press a snippet's F-key in any window to type it. Esc stops typing.");
    }

    void AddLabel(string text, int x, int y) {
        Label l = new Label(); l.Text = text; l.AutoSize = true; l.Location = new Point(x, y); Controls.Add(l);
    }

    void AddButton(string text, int x, int y, int w, EventHandler onClick) {
        Button b = new Button(); b.Text = text; b.SetBounds(x, y, w, 32); b.Click += onClick; Controls.Add(b);
    }

    void SetStatus(string s) { status.Text = s; }

    // ---------- snippet editing ----------

    void ShowSelected() {
        if (loading || list.SelectedIndex < 0) return;
        Snippet s = snippets[list.SelectedIndex];
        nameBox.Text = s.Name;
        hotkeyBox.SelectedIndex = s.Hotkey;
        textBox.Text = s.Text.Replace("\r\n", "\n").Replace("\n", "\r\n");
    }

    void NewSnippet() {
        snippets.Add(new Snippet());
        RefreshList(snippets.Count - 1);
        Persist();
        nameBox.Focus(); nameBox.SelectAll();
    }

    void DeleteSnippet() {
        int i = list.SelectedIndex;
        if (i < 0) return;
        snippets.RemoveAt(i);
        if (snippets.Count == 0) snippets.Add(new Snippet());
        RefreshList(Math.Min(i, snippets.Count - 1));
        RegisterHotkeys();
        Persist();
    }

    void SaveSnippet() {
        int i = list.SelectedIndex;
        if (i < 0) return;
        Snippet s = snippets[i];
        s.Name = nameBox.Text.Trim().Length > 0 ? nameBox.Text.Trim() : "Untitled";
        s.Hotkey = Math.Max(0, hotkeyBox.SelectedIndex);
        s.Text = textBox.Text.Replace("\r\n", "\n");
        // One snippet per F-key: take it away from any other snippet.
        foreach (Snippet o in snippets) if (o != s && s.Hotkey > 0 && o.Hotkey == s.Hotkey) o.Hotkey = 0;
        RefreshList(i);
        string failed = RegisterHotkeys();
        Persist();
        SetStatus(failed.Length > 0 ? "Saved, but these keys are used by another app: " + failed : "Saved.");
    }

    void RefreshList(int select) {
        loading = true;
        list.Items.Clear();
        foreach (Snippet s in snippets) list.Items.Add(s);
        loading = false;
        list.SelectedIndex = select;
    }

    // ---------- hotkeys ----------

    string RegisterHotkeys() {
        string failed = "";
        for (int k = 1; k <= 12; k++) UnregisterHotKey(Handle, k);
        foreach (Snippet s in snippets)
            if (s.Hotkey > 0 && !RegisterHotKey(Handle, s.Hotkey, 0, (uint)(0x70 + s.Hotkey - 1)))
                failed += "F" + s.Hotkey + " ";
        return failed;
    }

    protected override void OnHandleCreated(EventArgs e) {
        base.OnHandleCreated(e);
        string failed = RegisterHotkeys();
        if (failed.Length > 0) SetStatus("These keys are used by another app: " + failed);
    }

    protected override void WndProc(ref Message m) {
        if (m.Msg == WM_HOTKEY) {
            int id = m.WParam.ToInt32();
            if (id == ESC_ID) cancel = true;
            else foreach (Snippet s in snippets)
                if (s.Hotkey == id) { StartTyping(s.Text, 200); break; } // short wait so the F-key is released
        }
        base.WndProc(ref m);
    }

    // ---------- typing ----------

    void StartTyping(string text, int delayMs) {
        if (typing || text.Length == 0) return;
        typing = true; cancel = false;
        RegisterHotKey(Handle, ESC_ID, 0, 0x1B); // Esc only grabbed while typing
        if (delayMs < 1000) SetStatus("Typing... press Esc to stop.");
        int cpm = (int)speedBox.Value, repeat = (int)repeatBox.Value;
        bool human = humanBox.Checked;
        string t = text.Replace("\r\n", "\n");

        Thread th = new Thread(delegate () {
            Thread.Sleep(delayMs);
            if (delayMs >= 1000) BeginInvoke((Action)delegate { SetStatus("Typing... press Esc to stop."); });
            Random rnd = new Random();
            double baseDelay = 60000.0 / cpm;
            for (int r = 0; r < repeat && !cancel; r++) {
                foreach (char c in t) {
                    if (cancel) break;
                    SendChar(c);
                    double d = human ? baseDelay * (0.4 + rnd.NextDouble() * 1.2) : baseDelay;
                    Thread.Sleep((int)d);
                }
            }
            BeginInvoke((Action)delegate {
                UnregisterHotKey(Handle, ESC_ID);
                typing = false;
                SetStatus(cancel ? "Stopped." : "Done.");
            });
        });
        th.IsBackground = true;
        th.Start();
    }

    static void SendChar(char c) {
        if (c == '\n') { SendKey(0x0D, 0, 0); return; }     // Enter
        if (c == '\t') { SendKey(0x09, 0, 0); return; }     // Tab
        SendKey(0, c, UNICODE);
    }

    static void SendKey(ushort vk, ushort scan, uint flags) {
        INPUT[] inputs = new INPUT[2];
        inputs[0].type = 1; inputs[0].u.ki.wVk = vk; inputs[0].u.ki.wScan = scan; inputs[0].u.ki.dwFlags = flags;
        inputs[1].type = 1; inputs[1].u.ki.wVk = vk; inputs[1].u.ki.wScan = scan; inputs[1].u.ki.dwFlags = flags | KEYUP;
        SendInput(2, inputs, Marshal.SizeOf(typeof(INPUT)));
    }

    // ---------- save / load ----------

    static string Enc(string s) { return Convert.ToBase64String(Encoding.UTF8.GetBytes(s)); }
    static string Dec(string s) { return Encoding.UTF8.GetString(Convert.FromBase64String(s)); }

    void Persist() {
        Directory.CreateDirectory(Path.GetDirectoryName(saveFile));
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("settings\t" + speedBox.Value + "\t" + humanBox.Checked + "\t" + repeatBox.Value);
        foreach (Snippet s in snippets) sb.AppendLine(Enc(s.Name) + "\t" + s.Hotkey + "\t" + Enc(s.Text));
        File.WriteAllText(saveFile, sb.ToString());
    }

    new void Load() {
        if (File.Exists(saveFile)) {
            try {
                foreach (string line in File.ReadAllLines(saveFile)) {
                    string[] p = line.Split('\t');
                    if (p.Length < 3) continue;
                    if (p[0] == "settings") {
                        speedBox.Value = Math.Max(speedBox.Minimum, Math.Min(speedBox.Maximum, decimal.Parse(p[1])));
                        humanBox.Checked = bool.Parse(p[2]);
                        if (p.Length > 3) repeatBox.Value = Math.Max(1, Math.Min(999, decimal.Parse(p[3])));
                        continue;
                    }
                    Snippet s = new Snippet();
                    s.Name = Dec(p[0]); s.Hotkey = int.Parse(p[1]); s.Text = Dec(p[2]);
                    snippets.Add(s);
                }
            } catch (Exception ex) { MessageBox.Show("Couldn't read saved snippets: " + ex.Message); }
        }
        if (snippets.Count == 0) {
            Snippet s = new Snippet();
            s.Name = "Example"; s.Hotkey = 8; s.Text = "Hello! This was typed by Auto Typer.";
            snippets.Add(s);
        }
    }

    protected override void OnFormClosing(FormClosingEventArgs e) {
        cancel = true;
        Persist();
        base.OnFormClosing(e);
    }
}
'@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Windows.Forms, System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()
[System.Windows.Forms.Application]::Run((New-Object AutoTyperForm))
