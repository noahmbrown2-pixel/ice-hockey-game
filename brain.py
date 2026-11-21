# brain.py — a from-scratch neural network, pure Python (no dependencies)
import math, random, json, argparse

# ---------- activations ----------
def _tanh(x): return math.tanh(x)
def _tanh_d(y): return 1 - y * y
def _sig(x):  return 1 / (1 + math.exp(-x)) if x > -700 else 0.0
def _sig_d(y): return y * (1 - y)
def _relu(x): return x if x > 0 else 0.0
def _relu_d(y): return 1.0 if y > 0 else 0.0
ACT = {
    "tanh":    (_tanh, _tanh_d),
    "sigmoid": (_sig,  _sig_d),
    "relu":    (_relu, _relu_d),
}

# ---------- the network ----------
class Net:
    def __init__(self, sizes, act="tanh"):
        self.sizes, self.act = sizes, act
        self.W, self.B = [], []
        for l in range(1, len(sizes)):
            fin, fout = sizes[l - 1], sizes[l]
            scale = math.sqrt(2 / (fin + fout))
            self.W.append([[random.uniform(-1, 1) * scale for _ in range(fin)]
                           for _ in range(fout)])
            self.B.append([0.0] * fout)

    @property
    def params(self):
        return sum(len(w) * len(w[0]) + len(w) for w in self.W)

    def forward(self, x):
        f, _ = ACT[self.act]
        a = [list(x)]
        for l, (w, b) in enumerate(zip(self.W, self.B)):
            last = (l == len(self.W) - 1)
            prev, al = a[-1], []
            for j in range(len(w)):
                s = b[j] + sum(w[j][i] * prev[i] for i in range(len(prev)))
                al.append(_sig(s) if last else f(s))   # output always sigmoid
            a.append(al)
        return a

    def predict(self, x):
        if len(x) != self.sizes[0]:
            raise ValueError(f"input must have {self.sizes[0]} features, got {len(x)}")
        return self.forward(x)[-1][0]

    def train(self, X, Y, lr):
        """One full-batch gradient-descent epoch. Returns mean BCE loss."""
        if not X:
            return float("nan")
        L, (_, df), N = len(self.W), ACT[self.act], len(X)
        gW = [[[0.0] * len(r) for r in w] for w in self.W]
        gB = [[0.0] * len(b) for b in self.B]
        loss = 0.0
        for n in range(N):
            a = self.forward(X[n])
            out, y = a[L][0], Y[n]
            loss += -(y * math.log(out + 1e-9) + (1 - y) * math.log(1 - out + 1e-9))
            delta = [None] * (L + 1)
            delta[L] = [out - y]                       # BCE + sigmoid
            for l in range(L - 1, 0, -1):
                dl = []
                for i in range(self.sizes[l]):
                    s = sum(self.W[l][j][i] * delta[l + 1][j] for j in range(len(self.W[l])))
                    dl.append(s * df(a[l][i]))
                delta[l] = dl
            for l in range(L):
                prev, d = a[l], delta[l + 1]
                for j in range(len(gW[l])):
                    for i in range(len(prev)):
                        gW[l][j][i] += d[j] * prev[i]
                    gB[l][j] += d[j]
        k = lr / N
        for l in range(L):
            for j in range(len(self.W[l])):
                for i in range(len(self.W[l][j])):
                    self.W[l][j][i] -= k * gW[l][j][i]
                self.B[l][j] -= k * gB[l][j]
        return loss / N

# ---------- datasets (points in [-1,1]^2, label 0/1) ----------
def make_data(kind, n, noise=0.1):
    X, Y = [], []
    jit = lambda: (random.random() * 2 - 1) * noise
    for _ in range(n):
        if kind == "xor":
            x, y = random.uniform(-1, 1), random.uniform(-1, 1)
            label = 1 if (x > 0) != (y > 0) else 0
            x += jit() * 0.4; y += jit() * 0.4
        elif kind == "circle":
            r = random.uniform(0, .45) if random.random() < .5 else random.uniform(.6, .95)
            t = random.uniform(0, 2 * math.pi)
            x, y, label = r * math.cos(t) + jit(), r * math.sin(t) + jit(), (1 if r < .5 else 0)
        elif kind == "blobs":
            c = random.random() < .5; label = 1 if c else 0
            cx, cy = (-.45, -.45) if c else (.45, .45)
            x, y = cx + random.uniform(-.3, .3) + jit(), cy + random.uniform(-.3, .3) + jit()
        elif kind == "moons":
            c = random.random() < .5; label = 1 if c else 0
            t = random.uniform(0, math.pi)
            if c: x, y = math.cos(t) * .7 - .25, math.sin(t) * .7 - .2
            else: x, y = math.cos(t) * .7 + .25, -math.sin(t) * .7 + .2
            x += jit(); y += jit()
        else:  # spiral
            c = random.random() < .5; label = 1 if c else 0
            t = random.random() * 3.2; r = t * .28
            ang = t * 2.4 + (0 if c else math.pi)
            x, y = r * math.cos(ang) + jit(), r * math.sin(ang) + jit()
        X.append([max(-1.2, min(1.2, x)), max(-1.2, min(1.2, y))]); Y.append(label)
    return X, Y

def accuracy(net, X, Y):
    if not X: return float("nan")
    ok = sum(1 for i in range(len(X)) if (net.predict(X[i]) > .5) == bool(Y[i]))
    return ok / len(X)

# ---------- save / load (validates before trusting a file) ----------
def serialize_brain(net, ds="xor", epoch=0, lr=0.3):
    return {"fmt": "brain.py", "version": 1, "sizes": net.sizes, "act": net.act,
            "W": net.W, "B": net.B, "ds": ds, "epoch": epoch, "lr": lr}

def load_brain(o):
    if not isinstance(o, dict) or o.get("fmt") != "brain.py" or "sizes" not in o:
        raise ValueError("not a brain file")
    act = o.get("act", "tanh")
    if act not in ACT: raise ValueError(f"unknown activation: {act}")
    sizes = o["sizes"]
    if not (isinstance(sizes, list) and len(sizes) >= 2
            and all(isinstance(s, int) and not isinstance(s, bool) and s > 0 for s in sizes)):
        raise ValueError("bad network sizes")
    W, B = o.get("W"), o.get("B")
    isnum = lambda v: isinstance(v, (int, float)) and not isinstance(v, bool) and math.isfinite(v)
    if not (isinstance(W, list) and len(W) == len(sizes) - 1
            and isinstance(B, list) and len(B) == len(sizes) - 1):
        raise ValueError("weights/biases do not match sizes")
    for l in range(len(sizes) - 1):
        w, b = W[l], B[l]
        if not (isinstance(w, list) and len(w) == sizes[l + 1]
                and isinstance(b, list) and len(b) == sizes[l + 1]):
            raise ValueError(f"layer {l} shape mismatch")
        if not all(isnum(v) for v in b): raise ValueError(f"layer {l} bad bias")
        for row in w:
            if not (isinstance(row, list) and len(row) == sizes[l] and all(isnum(v) for v in row)):
                raise ValueError(f"layer {l} malformed weights")
    net = Net(sizes, act)
    net.W = [[row[:] for row in m] for m in W]
    net.B = [b[:] for b in B]
    return net

def save_file(net, path, **meta):
    with open(path, "w") as f: json.dump(serialize_brain(net, **meta), f)

def load_file(path):
    with open(path) as f: return load_brain(json.load(f))

# ---------- ASCII decision boundary ----------
def render(net, X, Y, w=48, h=24):
    rows = []
    for yi in range(h):
        line = []
        for xi in range(w):
            gx = xi / (w - 1) * 2.4 - 1.2
            gy = (1 - yi / (h - 1)) * 2.4 - 1.2
            line.append("#" if net.predict([gx, gy]) > .5 else ".")
        rows.append(line)
    for (px, py), lab in zip(X, Y):           # overlay data points
        xi = round((px + 1.2) / 2.4 * (w - 1))
        yi = round((1 - (py + 1.2) / 2.4) * (h - 1))
        if 0 <= xi < w and 0 <= yi < h:
            rows[yi][xi] = "A" if lab else "B"
    print("\n".join("".join(r) for r in rows))

# ---------- run ----------
if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="from-scratch neural net")
    ap.add_argument("--data", default="xor",
                    choices=["xor", "circle", "spiral", "moons", "blobs"])
    ap.add_argument("--hidden", default="6,6", help="hidden layer sizes, e.g. 8,8,8")
    ap.add_argument("--act", default="tanh", choices=list(ACT))
    ap.add_argument("--lr", type=float, default=0.3)
    ap.add_argument("--epochs", type=int, default=2000)
    ap.add_argument("--points", type=int, default=240)
    ap.add_argument("--noise", type=float, default=0.08)
    ap.add_argument("--seed", type=int, default=None)
    ap.add_argument("--save", default=None)
    args = ap.parse_args()

    if args.seed is not None: random.seed(args.seed)
    hidden = [int(s) for s in args.hidden.split(",") if s.strip()]
    X, Y = make_data(args.data, args.points, args.noise)
    net = Net([2, *hidden, 1], args.act)

    print(f"brain: 2-{'-'.join(map(str, hidden))}-1  act={args.act}  params={net.params}  data={args.data}")
    for ep in range(1, args.epochs + 1):
        loss = net.train(X, Y, args.lr)
        if ep == 1 or ep % max(1, args.epochs // 10) == 0:
            print(f"  epoch {ep:5d}   loss {loss:.4f}   acc {accuracy(net, X, Y)*100:5.1f}%")
    print()
    render(net, X, Y)
    print(f"\nfinal accuracy: {accuracy(net, X, Y)*100:.1f}%   (A=class1  B=class0  #=brain says A)")

    if args.save:
        save_file(net, args.save, ds=args.data, epoch=args.epochs, lr=args.lr)
        print(f"saved -> {args.save}")
