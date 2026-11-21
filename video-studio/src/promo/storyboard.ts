// Storyboard for "Agents You Can Verify" — 30s @ 30fps.
// Scene durations include the 15-frame overlap of each transition, so
// total = sum(frames) - (scenes - 1) * TRANSITION = 900 frames.
// All names (Acme Robotics, Paper Co.) are fictional placeholders.

export const TRANSITION = 15;

export const scenes = [
  {
    id: "hook",
    frames: 135,
    headline: "AI agents are starting to transact.",
    sub: "So who are they — and who said they could?",
    shot: "Dim network of agents lights up; packets flicker between them. Headline rises centre-frame.",
  },
  {
    id: "identity",
    frames: 195,
    kicker: ["01", "IDENTITY"],
    headline: "Every agent carries a verifiable identity.",
    sub: "Keys bind the agent to the organization that runs it.",
    shot: "Identity card swings in on a 3D spring; fields fill in; signature check draws; VERIFIED chip pops.",
  },
  {
    id: "authority",
    frames: 195,
    kicker: ["02", "DELEGATED AUTHORITY"],
    headline: "People grant scoped, expiring permission.",
    sub: "Authority can only narrow as it's delegated — never grow.",
    shot: "Person → agent → sub-agent chain draws left to right; permission chips land on each link, the second set tighter.",
  },
  {
    id: "payments",
    frames: 195,
    kicker: ["03", "PAYMENTS"],
    headline: "Money moves only inside the mandate.",
    sub: "",
    shot: "$86.40 packet passes a policy gate (3 checks tick) and settles. A $240 packet hits the gate and is denied.",
  },
  {
    id: "audit",
    frames: 165,
    kicker: ["04", "AUDIT"],
    headline: "Every action leaves a tamper-evident receipt.",
    sub: "Each record carries the hash of the one before it.",
    shot: "The scenes above replay as hash-chained log rows stacking upward, links drawing between them.",
  },
  {
    id: "end",
    frames: 90,
    headline: "Autonomy you can verify.",
    pillars: ["Identity", "Authority", "Payment", "Audit"],
    shot: "Four pillars snap in; tagline lands; accent rule draws under it.",
  },
] as const;

export const PROMO_FRAMES = scenes.reduce((n, s) => n + s.frames, 0) - (scenes.length - 1) * TRANSITION;

export const copy = <T extends (typeof scenes)[number]["id"]>(id: T) =>
  scenes.find((s) => s.id === id) as Extract<(typeof scenes)[number], { id: T }>;
