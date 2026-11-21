// --- SETTINGS TAB ---
function renderSettings() {
  const team = G.teams[G.userTeamId];
  const lastSaved = (() => {
    try {
      const raw = localStorage.getItem("footballCEO_save");
      if (!raw) return "Never";
      const d = JSON.parse(raw);
      return `Season ${d.season}, Week ${d.week} — ${d.teams[d.userTeamId]?.name || ""}`;
    } catch { return "Unknown"; }
  })();
  document.getElementById("tabContent").innerHTML = `
    <div style="max-width:560px; margin:0 auto;">

      <div class="card">
        <div class="card-title">💾 Save Game</div>
        <div style="color:#8b949e; font-size:13px; margin-bottom:14px;">
          Your game auto-saves after every week, but you can manually save here at any time.
          Use Export to keep a backup file you can reload later even if you clear browser data.
        </div>
        <div class="stat-row"><span>Last Save</span><span style="color:#2ea043;">${lastSaved}</span></div>
        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:14px;">
          <button class="btn btn-gold" onclick="manualSave()">Save Now</button>
          <button class="btn btn-ghost" onclick="exportSave()">Export Save File</button>
          <label class="btn btn-ghost" style="cursor:pointer;">
            Import Save File
            <input type="file" accept=".json" style="display:none;" onchange="importSave(this)">
          </label>
        </div>
      </div>

      <div class="card">
        <div class="card-title">🔄 Switch Club</div>
        <div style="color:#8b949e; font-size:13px; margin-bottom:14px;">
          Take charge of a different ${G.division} club. Your current squad and coaches stay with ${team ? team.name : "your team"}; you inherit the new club's squad and a fresh £150M budget.
        </div>
        <button class="btn btn-gold" onclick="showSwitchClubPicker()">Choose New Club</button>
      </div>

      <div class="card">
        <div class="card-title">🗑️ Reset</div>
        <div style="color:#8b949e; font-size:13px; margin-bottom:14px;">
          Start a completely fresh career. This cannot be undone — export your save first if you want to keep it.
        </div>
        <button class="btn btn-red" onclick="confirmReset()">Start New Career</button>
      </div>

      <div class="card">
        <div class="card-title">ℹ️ About</div>
        <div class="stat-row"><span>Game</span><span>Football CEO</span></div>
        <div class="stat-row"><span>Season</span><span>${G.season}</span></div>
        <div class="stat-row"><span>Club</span><span>${team ? team.name : "—"}</span></div>
        <div class="stat-row"><span>Division</span><span>${G.division}</span></div>
        <div class="stat-row"><span>Week</span><span>${G.week}</span></div>
        <div class="stat-row"><span>Budget</span><span>${fmtMoney(G.budget)}</span></div>
      </div>

    </div>
  `;
}

function showSwitchClubPicker() {
  const candidates = Object.values(G.teams)
    .filter(t => t.division === G.division && t.id !== G.userTeamId)
    .sort((a, b) => (b.coachHeadRating || 65) - (a.coachHeadRating || 65));
  if (candidates.length === 0) { toast("No other clubs in this division", "error"); return; }
  const currentName = G.teams[G.userTeamId]?.name || "your club";
  const html = `
    <button class="modal-close" onclick="closeModal()">×</button>
    <div class="card-title" style="margin-bottom:8px;">Switch from ${currentName}</div>
    <div style="color:#8b949e; font-size:12px; margin-bottom:14px;">
      Pick any other ${G.division} club. Your current squad stays at ${currentName}; you take over the new club's existing players with a fresh £150M war chest.
    </div>
    <div style="max-height:420px; overflow-y:auto;">
      ${candidates.map(t => {
        const squadSize = (t.players || []).length;
        const avgRating = squadSize > 0
          ? Math.round((t.players || []).map(id => G.players[id]?.rating || 50).reduce((s,v)=>s+v,0) / squadSize)
          : (t.coachHeadRating || 65);
        return `
          <div onclick="confirmSwitchClub(${t.id})" style="display:flex; align-items:center; gap:12px; padding:10px; cursor:pointer; border-radius:8px; margin-bottom:6px; background:#161b22; border:1px solid #30363d;" onmouseover="this.style.background='#21262d'; this.style.borderColor='#d29922';" onmouseout="this.style.background='#161b22'; this.style.borderColor='#30363d';">
            <div style="width:38px; height:38px; border-radius:50%; background:${['#c0392b','#2980b9','#27ae60','#d35400','#8e44ad','#16a085'][t.id % 6]}; display:flex; align-items:center; justify-content:center; font-weight:700; color:white; font-size:13px;">${t.name.split(" ").map(w=>w[0]).join("").substring(0,2).toUpperCase()}</div>
            <div style="flex:1;">
              <div style="font-weight:700; font-size:14px;">${t.name}</div>
              <div style="font-size:11px; color:#8b949e;">${t.city || ""} · Squad: ${squadSize} · Avg rating: ${avgRating}</div>
            </div>
            <button class="btn btn-sm btn-gold" style="font-size:11px; padding:4px 10px;">Take Over →</button>
          </div>
        `;
      }).join("")}
    </div>
  `;
  showModal(html);
}

function confirmSwitchClub(newTeamId) {
  const newTeam = G.teams[newTeamId];
  const oldTeam = G.teams[G.userTeamId];
  if (!newTeam || !oldTeam) { toast("Team not found", "error"); return; }
  const html = `
    <button class="modal-close" onclick="closeModal()">×</button>
    <div class="card-title" style="margin-bottom:14px;">Confirm Club Switch</div>
    <div style="padding:12px; background:#0d1117; border:1px solid #30363d; border-radius:8px; margin-bottom:14px;">
      <div style="color:#8b949e; font-size:12px;">LEAVING</div>
      <div style="font-weight:700; font-size:18px;">${oldTeam.name}</div>
    </div>
    <div style="text-align:center; color:#d29922; font-size:24px; margin:6px 0;">↓</div>
    <div style="padding:12px; background:#0d1117; border:1px solid #d29922; border-radius:8px; margin-bottom:14px;">
      <div style="color:#d29922; font-size:12px;">TAKING OVER</div>
      <div style="font-weight:700; font-size:18px;">${newTeam.name}</div>
    </div>
    <div style="color:#8b949e; font-size:12px; margin-bottom:14px; line-height:1.5;">
      • Your current squad of ${G.myPlayers.length} players stays at ${oldTeam.name}<br>
      • You inherit ${(newTeam.players || []).length} players already at ${newTeam.name}<br>
      • Coaches: released (hire new ones)<br>
      • Budget: reset to £150M<br>
      • Season stats and standings stay as they are
    </div>
    <div style="display:flex; gap:8px;">
      <button class="btn btn-ghost" style="flex:1;" onclick="closeModal()">Cancel</button>
      <button class="btn btn-gold" style="flex:1;" onclick="doSwitchClub(${newTeamId})">Confirm Switch</button>
    </div>
  `;
  showModal(html);
}

function doSwitchClub(newTeamId) {
  const newTeam = G.teams[newTeamId];
  const oldTeam = G.teams[G.userTeamId];
  if (!newTeam || !oldTeam) return;
  // Old team becomes AI — hand it the user's current squad
  oldTeam.players = [...G.myPlayers];
  oldTeam.players.forEach(id => { if (G.players[id]) G.players[id].teamId = oldTeam.id; });
  // Derive an AI coach rating for old team from user's best coach (or default)
  const userCoaches = (G.myCoaches || []).map(id => G.coaches[id]).filter(c => c);
  const head = userCoaches.find(c => c.role === "Head Coach");
  oldTeam.coachHeadRating = head ? head.rating : (oldTeam.coachHeadRating || 65);
  // Release user's coaches (they stay attached to old club, or just orphan them)
  userCoaches.forEach(c => { c.teamId = oldTeam.id; });
  // Take over new team's squad
  G.myPlayers = [...(newTeam.players || [])];
  G.myPlayers.forEach(id => { if (G.players[id]) G.players[id].teamId = newTeamId; });
  newTeam.players = [];
  G.myCoaches = [];
  // Reset user-specific state
  G.userTeamId = newTeamId;
  G.budget = 150e6;
  G.manualSlots = {};
  G.userFormation = null;
  G.incomingBids = [];
  G.transferList = [];
  G.lossStreak = 0;
  G.stadium = { capacity: 30000, tier: 1, ticketPrice: 35 };
  addMessage("Board", `You've taken charge at ${newTeam.name}. The board has given you £150M to make your mark.`);
  toast(`Now managing ${newTeam.name}`, "gold");
  closeModal();
  saveGame();
  renderGameHeader();
  switchTab("team");
}

function manualSave() {
  saveGame();
  toast("Game saved!", "gold");
  renderSettings();
}

function exportSave() {
  try {
    const data = localStorage.getItem("footballCEO_save");
    if (!data) { toast("Nothing to export — save first!", "error"); return; }
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const team = G.teams[G.userTeamId];
    a.href = url;
    a.download = `football-ceo-${team ? team.name.replace(/\s+/g,"-").toLowerCase() : "save"}-s${G.season}w${G.week}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Save file downloaded!", "gold");
  } catch (e) { toast("Export failed: " + e.message, "error"); }
}

function importSave(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed.userTeamId || !parsed.teams) throw new Error("Invalid save file");
      localStorage.setItem("footballCEO_save", e.target.result);
      G = parsed;
      toast("Save loaded! Refreshing…", "gold");
      setTimeout(() => { showScreen("game"); renderGameHeader(); switchTab("advance"); }, 800);
    } catch (err) { toast("Invalid save file: " + err.message, "error"); }
  };
  reader.readAsText(file);
  input.value = "";
}

function confirmReset() {
  const html = `
    <button class="modal-close" onclick="closeModal()">×</button>
    <div class="card-title" style="color:#da3633;">Start New Career?</div>
    <div style="color:#8b949e; font-size:14px; margin:12px 0 20px;">
      All progress will be deleted. Export your save first if you want to keep it.
    </div>
    <div style="display:flex; gap:10px; justify-content:flex-end;">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-red" onclick="hardReset()">Delete &amp; Restart</button>
    </div>
  `;
  showModal(html);
}

function hardReset() {
  localStorage.removeItem("footballCEO_save");
  closeModal();
  G = null;
  showScreen("welcome");
  initWelcome();
}

// --- INIT ---
initWelcome();

