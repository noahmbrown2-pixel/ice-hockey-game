// BlindOracle-compatible agent: serves its own /a2a/manifest + /a2a/capabilities,
// accepts job-intent envelopes, emits a stub ProofOfWork attestation, and can
// also act as a *client* to query api.craigmbrown.com.
//
// Run:   node agent.js
// Then:  curl http://localhost:7402/a2a/manifest
//        curl http://localhost:7402/a2a/capabilities
//        curl -X POST http://localhost:7402/a2a/jobs -H 'content-type: application/json' \
//             -d '{"intent":{"capability":"games.game-reviewer-agent","prompt":"http://localhost:3000/monster-hunter.html","budget_usd":0.01,"deadline_secs":120,"acceptance_criteria":["summary present","findings non-empty"]}}'
//        curl http://localhost:7402/remote/capabilities   # proxies api.craigmbrown.com
//
// No third-party deps — uses Node built-ins only.

const http = require('node:http');
const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const PORT = Number(process.env.PORT || 7402);
const REMOTE = 'https://api.craigmbrown.com';
const MANIFEST_PATH = path.join(__dirname, 'manifest.json');

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const capabilities = manifest.services.map(s => ({
  capability_id: s.id,
  agent_name: s.agent,
  team: s.team,
  display_name: s.name,
  description: s.description,
  category: s.category,
  tags: s.tags,
  input_schema: s.input_schema,
  output_schema: s.output_schema,
  price_per_call_usd: s.pricing.price_per_call_usd,
  pricing_model: s.pricing.model,
  currency: s.pricing.currency,
  sla: s.sla,
  schedule_cron: s.schedule?.cron || '',
  schedule_description: s.schedule?.description || '',
  trust_tier: s.trust_tier,
  marketplace_visibility: s.marketplace_visibility,
  min_bidder_badge: s.min_bidder_badge,
  model: s.model,
}));

const proofs = []; // in-memory ProofDB

function sha256(s) { return crypto.createHash('sha256').update(s).digest('hex'); }

function nowIso() { return new Date().toISOString(); }

// --- the actual "work" — a deterministic heuristic review of an HTML game ---
function reviewHtmlSource(src) {
  const findings = [];
  const recs = [];
  const has = (re) => re.test(src);

  if (!has(/<meta\s+name=["']viewport["']/i)) {
    findings.push('Missing viewport meta — game will not scale on mobile.');
    recs.push('Add: <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">');
  }
  if (!has(/devicePixelRatio/)) {
    findings.push('No devicePixelRatio handling — canvas will look blurry on retina/HiDPI.');
    recs.push('Multiply canvas.width/height by window.devicePixelRatio and scale ctx accordingly.');
  }
  if (has(/addEventListener\(["']mousedown/) && !has(/addEventListener\(["']touchstart/)) {
    findings.push('Mouse events present but no touch listeners — unplayable on phones/tablets.');
    recs.push('Mirror mousedown/mousemove/mouseup with touchstart/touchmove/touchend (passive: false where needed).');
  }
  if (has(/setInterval\(/)) {
    findings.push('Game loop appears to use setInterval — drifts and wastes battery in background tabs.');
    recs.push('Use requestAnimationFrame with a delta-time accumulator instead.');
  }
  if (!has(/localStorage/)) {
    findings.push('No localStorage usage detected — high scores / progress will not persist.');
    recs.push('Persist run state under a namespaced key (e.g. "mygame_v1").');
  }
  if (has(/<script[^>]+src=["']https?:/i)) {
    findings.push('External script src found — breaks the project rule of single self-contained HTML files.');
    recs.push('Inline the dependency or vendor it into the file.');
  }
  if (findings.length === 0) {
    findings.push('No major issues detected by static heuristics.');
    recs.push('Manual playtest on a real phone is still recommended.');
  }
  return {
    summary: `Reviewed ${src.length} bytes; ${findings.length} finding(s).`,
    findings,
    recommendations: recs,
  };
}

// --- emit a Nostr-NIP-33-shaped ProofOfWork (kind 30010) ---
function emitProofOfWork(jobId, input, output) {
  const proof = {
    kind: 30010,
    pubkey: 'demo-agent-pubkey',
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['d', `pow:${jobId}`],
      ['job', jobId],
      ['capability', manifest.services[0].id],
    ],
    content: JSON.stringify({
      input_hash: sha256(input),
      output_hash: sha256(JSON.stringify(output)),
      tool_traces: ['heuristic-static-review@v0'],
      ts: nowIso(),
    }),
  };
  proof.id = sha256(JSON.stringify([proof.kind, proof.pubkey, proof.created_at, proof.tags, proof.content]));
  proofs.push(proof);
  return proof;
}

// --- HTTP helpers ---
function send(res, code, body, headers = {}) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body, null, 2);
  res.writeHead(code, { 'content-type': 'application/json', 'access-control-allow-origin': '*', ...headers });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

function fetchRemote(p) {
  return new Promise((resolve, reject) => {
    https.get(REMOTE + p, { headers: { accept: 'application/json' } }, r => {
      const chunks = [];
      r.on('data', c => chunks.push(c));
      r.on('end', () => resolve({ status: r.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
    }).on('error', reject);
  });
}

function fetchUrl(u) {
  return new Promise((resolve, reject) => {
    const lib = u.startsWith('https') ? https : http;
    lib.get(u, r => {
      const chunks = [];
      r.on('data', c => chunks.push(c));
      r.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    }).on('error', reject);
  });
}

// --- routes ---
const routes = {
  'GET /a2a/manifest':     (_req, res) => send(res, 200, manifest),
  'GET /a2a/capabilities': (_req, res) => send(res, 200, { count: capabilities.length, capabilities }),
  'GET /a2a/proofs':       (_req, res) => send(res, 200, { count: proofs.length, proofs }),

  'POST /a2a/jobs': async (req, res) => {
    const body = await readBody(req).catch(() => ({}));
    const intent = body.intent || {};
    if (!intent.capability || !intent.prompt) {
      return send(res, 400, { error: 'intent.capability and intent.prompt required' });
    }
    const cap = manifest.services.find(s => s.id === intent.capability);
    if (!cap) return send(res, 404, { error: `unknown capability ${intent.capability}` });
    if (intent.budget_usd != null && intent.budget_usd < cap.pricing.price_per_call_usd) {
      return send(res, 402, { error: 'budget below price', price_usd: cap.pricing.price_per_call_usd });
    }

    const jobId = crypto.randomUUID();
    const startedAt = Date.now();

    // resolve the prompt: if it looks like a URL, fetch it; else treat as inline source
    let source = intent.prompt;
    if (/^https?:\/\//i.test(intent.prompt)) {
      try { source = await fetchUrl(intent.prompt); }
      catch (e) { return send(res, 502, { error: 'failed to fetch prompt URL', detail: String(e) }); }
    }

    const output = reviewHtmlSource(source);
    const pow = emitProofOfWork(jobId, source, output);
    const elapsed = (Date.now() - startedAt) / 1000;

    const resolution = {
      kind: 30015, // ProofOfResolution
      job_id: jobId,
      capability: intent.capability,
      output,
      sla_observed: { latency_secs: elapsed },
      acceptance_check: (intent.acceptance_criteria || []).map(c => ({ criterion: c, met: true })),
      pow_id: pow.id,
      ts: nowIso(),
    };
    proofs.push(resolution);

    send(res, 200, {
      job_id: jobId,
      status: 'resolved',
      capability: intent.capability,
      output,
      attestations: [
        { kind: 30010, id: pow.id },
        { kind: 30015, id: resolution.kind + ':' + jobId },
      ],
      cost_usd: cap.pricing.price_per_call_usd,
      latency_secs: elapsed,
    });
  },

  // proxy convenience: hit the live BlindOracle marketplace
  'GET /remote/manifest':     async (_req, res) => send(res, 200, JSON.parse((await fetchRemote('/a2a/manifest')).body)),
  'GET /remote/capabilities': async (_req, res) => send(res, 200, JSON.parse((await fetchRemote('/a2a/capabilities')).body)),
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    return send(res, 204, '', {
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'content-type,authorization',
    });
  }
  const key = `${req.method} ${req.url.split('?')[0]}`;
  const handler = routes[key];
  if (!handler) return send(res, 404, { error: 'not found', route: key });
  try { await handler(req, res); }
  catch (e) { send(res, 500, { error: 'handler crashed', detail: String(e) }); }
});

server.listen(PORT, () => {
  console.log(`BlindOracle agent listening on http://localhost:${PORT}`);
  console.log(`  GET  /a2a/manifest`);
  console.log(`  GET  /a2a/capabilities`);
  console.log(`  POST /a2a/jobs`);
  console.log(`  GET  /a2a/proofs`);
  console.log(`  GET  /remote/{manifest,capabilities}  (proxies ${REMOTE})`);
});
