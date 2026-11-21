# brain_np.py — a from-scratch neural network, vectorized with NumPy.
# Same CLI, same datasets, and save/load files INTEROPERATE with brain.py.
# Trains thousands of points in well under a second, so you can run bigger
# nets / more epochs / Adam and get markedly higher accuracy.
import json, argparse
import numpy as np

# ---------- activations (operate on whole arrays at once) ----------
def _tanh(s):  return np.tanh(s)
def _tanh_d(y): return 1.0 - y * y
def _sig(s):   return 1.0 / (1.0 + np.exp(-np.clip(s, -700, 700)))
def _sig_d(y):  return y * (1.0 - y)
def _relu(s):  return np.maximum(s, 0.0)
def _relu_d(y): return (y > 0.0).astype(y.dtype)
ACT = {
    "tanh":    (_tanh, _tanh_d),
    "sigmoid": (_sig,  _sig_d),
    "relu":    (_relu, _relu_d),
}

# ---------- the network ----------
class Net:
    def __init__(self, sizes, act="tanh", seed=None):
        self.sizes, self.act = list(sizes), act
        rng = np.random.default_rng(seed)
        self.W, self.B = [], []
        for l in range(1, len(sizes)):
            fin, fout = sizes[l - 1], sizes[l]
            scale = np.sqrt(2.0 / (fin + fout))
            # W[l] shape (fout, fin) — matches brain.py row-per-neuron layout
            self.W.append(rng.uniform(-1, 1, size=(fout, fin)) * scale)
            self.B.append(np.zeros(fout))
        # Adam moment buffers (lazily used)
        self._mW = [np.zeros_like(w) for w in self.W]
        self._vW = [np.zeros_like(w) for w in self.W]
        self._mB = [np.zeros_like(b) for b in self.B]
        self._vB = [np.zeros_like(b) for b in self.B]
        self._t = 0

    @property
    def params(self):
        return int(sum(w.size + b.size for w, b in zip(self.W, self.B)))

    def forward(self, X):
        """X: (N, features). Returns list of activations, each (N, size)."""
        f, _ = ACT[self.act]
        a = [np.asarray(X, dtype=float)]
        for l, (w, b) in enumerate(zip(self.W, self.B)):
            s = a[-1] @ w.T + b                       # (N, fout)
            last = (l == len(self.W) - 1)
            a.append(_sig(s) if last else f(s))        # output always sigmoid
        return a

    def predict(self, x):
        """Single point -> scalar probability."""
        x = np.asarray(x, dtype=float)
        if x.shape[-1] != self.sizes[0]:
            raise ValueError(f"input must have {self.sizes[0]} features, got {x.shape[-1]}")
        return float(self.forward(x.reshape(1, -1))[-1][0, 0])

    def predict_batch(self, X):
        return self.forward(X)[-1].ravel()

    def _grads(self, X, Y):
        """Backprop over a batch. Returns (gW, gB, mean_BCE_loss)."""
        L, (_, df) = len(self.W), ACT[self.act]
        a = self.forward(X)
        N = len(X)
        out = a[L][:, 0]
        out_c = np.clip(out, 1e-9, 1 - 1e-9)
        loss = float(np.mean(-(Y * np.log(out_c) + (1 - Y) * np.log(1 - out_c))))
        delta = [None] * (L + 1)
        delta[L] = (a[L] - Y.reshape(-1, 1))           # (N,1)  BCE + sigmoid
        for l in range(L - 1, 0, -1):
            delta[l] = (delta[l + 1] @ self.W[l]) * df(a[l])
        gW = [(delta[l + 1].T @ a[l]) / N for l in range(L)]
        gB = [delta[l + 1].mean(axis=0) for l in range(L)]
        return gW, gB, loss

    def train(self, X, Y, lr, opt="adam", batch=None, seed=None):
        """One epoch. opt='adam'|'sgd'. batch=None -> full batch. Returns mean BCE loss."""
        X = np.asarray(X, dtype=float); Y = np.asarray(Y, dtype=float)
        if len(X) == 0:
            return float("nan")
        idx = np.arange(len(X))
        if batch:
            np.random.default_rng(seed).shuffle(idx)
        bs = batch or len(X)
        losses = []
        for start in range(0, len(X), bs):
            sel = idx[start:start + bs]
            gW, gB, loss = self._grads(X[sel], Y[sel])
            losses.append(loss)
            if opt == "adam":
                self._adam_step(gW, gB, lr)
            else:
                for l in range(len(self.W)):
                    self.W[l] -= lr * gW[l]
                    self.B[l] -= lr * gB[l]
        return float(np.mean(losses))

    def _adam_step(self, gW, gB, lr, b1=0.9, b2=0.999, eps=1e-8):
        self._t += 1
        bc1, bc2 = 1 - b1 ** self._t, 1 - b2 ** self._t
        for l in range(len(self.W)):
            self._mW[l] = b1 * self._mW[l] + (1 - b1) * gW[l]
            self._vW[l] = b2 * self._vW[l] + (1 - b2) * gW[l] ** 2
            self.W[l] -= lr * (self._mW[l] / bc1) / (np.sqrt(self._vW[l] / bc2) + eps)
            self._mB[l] = b1 * self._mB[l] + (1 - b1) * gB[l]
            self._vB[l] = b2 * self._vB[l] + (1 - b2) * gB[l] ** 2
            self.B[l] -= lr * (self._mB[l] / bc1) / (np.sqrt(self._vB[l] / bc2) + eps)

# ---------- datasets (points in [-1,1]^2, label 0/1) — identical math to brain.py ----------
def make_data(kind, n, noise=0.1, seed=None):
    rng = np.random.default_rng(seed)
    X, Y = [], []
    jit = lambda: (rng.random() * 2 - 1) * noise
    for _ in range(n):
        if kind == "xor":
            x, y = rng.uniform(-1, 1), rng.uniform(-1, 1)
            label = 1 if (x > 0) != (y > 0) else 0
            x += jit() * 0.4; y += jit() * 0.4
        elif kind == "circle":
            r = rng.uniform(0, .45) if rng.random() < .5 else rng.uniform(.6, .95)
            t = rng.uniform(0, 2 * np.pi)
            x, y, label = r * np.cos(t) + jit(), r * np.sin(t) + jit(), (1 if r < .5 else 0)
        elif kind == "blobs":
            c = rng.random() < .5; label = 1 if c else 0
            cx, cy = (-.45, -.45) if c else (.45, .45)
            x, y = cx + rng.uniform(-.3, .3) + jit(), cy + rng.uniform(-.3, .3) + jit()
        elif kind == "moons":
            c = rng.random() < .5; label = 1 if c else 0
            t = rng.uniform(0, np.pi)
            if c: x, y = np.cos(t) * .7 - .25, np.sin(t) * .7 - .2
            else: x, y = np.cos(t) * .7 + .25, -np.sin(t) * .7 + .2
            x += jit(); y += jit()
        else:  # spiral
            c = rng.random() < .5; label = 1 if c else 0
            t = rng.random() * 3.2; r = t * .28
            ang = t * 2.4 + (0 if c else np.pi)
            x, y = r * np.cos(ang) + jit(), r * np.sin(ang) + jit()
        X.append([max(-1.2, min(1.2, x)), max(-1.2, min(1.2, y))]); Y.append(label)
    return np.array(X, dtype=float), np.array(Y, dtype=float)

def accuracy(net, X, Y):
    if len(X) == 0: return float("nan")
    pred = net.predict_batch(X) > .5
    return float(np.mean(pred == (np.asarray(Y) > .5)))

# ---------- save / load (interoperates with brain.py; validates before trusting) ----------
def serialize_brain(net, ds="xor", epoch=0, lr=0.3):
    return {"fmt": "brain.py", "version": 1, "sizes": net.sizes, "act": net.act,
            "W": [w.tolist() for w in net.W], "B": [b.tolist() for b in net.B],
            "ds": ds, "epoch": epoch, "lr": lr}

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
    def finite(arr):  # arr is a python list (nested)
        a = np.asarray(arr, dtype=float)
        return np.all(np.isfinite(a))
    if not (isinstance(W, list) and len(W) == len(sizes) - 1
            and isinstance(B, list) and len(B) == len(sizes) - 1):
        raise ValueError("weights/biases do not match sizes")
    for l in range(len(sizes) - 1):
        w, b = W[l], B[l]
        if not (isinstance(w, list) and len(w) == sizes[l + 1]
                and isinstance(b, list) and len(b) == sizes[l + 1]):
            raise ValueError(f"layer {l} shape mismatch")
        if not all(isinstance(row, list) and len(row) == sizes[l] for row in w):
            raise ValueError(f"layer {l} malformed weights")
        if not (finite(w) and finite(b)):
            raise ValueError(f"layer {l} non-finite values")
    net = Net(sizes, act)
    net.W = [np.array(m, dtype=float) for m in W]
    net.B = [np.array(b, dtype=float) for b in B]
    net._mW = [np.zeros_like(w) for w in net.W]
    net._vW = [np.zeros_like(w) for w in net.W]
    net._mB = [np.zeros_like(b) for b in net.B]
    net._vB = [np.zeros_like(b) for b in net.B]
    return net

def save_file(net, path, **meta):
    with open(path, "w") as f: json.dump(serialize_brain(net, **meta), f)

def load_file(path):
    with open(path) as f: return load_brain(json.load(f))

# ---------- ASCII decision boundary ----------
def render(net, X, Y, w=48, h=24):
    gx = np.linspace(-1.2, 1.2, w)
    gy = np.linspace(1.2, -1.2, h)
    GX, GY = np.meshgrid(gx, gy)
    grid = np.column_stack([GX.ravel(), GY.ravel()])
    pred = (net.predict_batch(grid) > .5).reshape(h, w)
    rows = [["#" if pred[yi, xi] else "." for xi in range(w)] for yi in range(h)]
    for (px, py), lab in zip(X, Y):
        xi = int(round((px + 1.2) / 2.4 * (w - 1)))
        yi = int(round((1 - (py + 1.2) / 2.4) * (h - 1)))
        if 0 <= xi < w and 0 <= yi < h:
            rows[yi][xi] = "A" if lab else "B"
    print("\n".join("".join(r) for r in rows))

# ---------- run ----------
if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="from-scratch neural net (NumPy)")
    ap.add_argument("--data", default="xor",
                    choices=["xor", "circle", "spiral", "moons", "blobs"])
    ap.add_argument("--hidden", default="16,16", help="hidden layer sizes, e.g. 32,32,32")
    ap.add_argument("--act", default="tanh", choices=list(ACT))
    ap.add_argument("--opt", default="adam", choices=["adam", "sgd"])
    ap.add_argument("--lr", type=float, default=0.01)
    ap.add_argument("--epochs", type=int, default=2000)
    ap.add_argument("--points", type=int, default=1000)
    ap.add_argument("--batch", type=int, default=None, help="mini-batch size (default: full batch)")
    ap.add_argument("--noise", type=float, default=0.08)
    ap.add_argument("--seed", type=int, default=None)
    ap.add_argument("--save", default=None)
    ap.add_argument("--load", default=None, help="resume from a saved brain")
    args = ap.parse_args()

    X, Y = make_data(args.data, args.points, args.noise, seed=args.seed)
    if args.load:
        net = load_file(args.load)
        print(f"loaded {args.load}: {net.sizes}  act={net.act}")
    else:
        hidden = [int(s) for s in args.hidden.split(",") if s.strip()]
        net = Net([2, *hidden, 1], args.act, seed=args.seed)

    arch = "-".join(map(str, net.sizes))
    print(f"brain: {arch}  act={net.act}  opt={args.opt}  params={net.params}  data={args.data}  n={len(X)}")
    import time; t0 = time.time()
    for ep in range(1, args.epochs + 1):
        loss = net.train(X, Y, args.lr, opt=args.opt, batch=args.batch, seed=args.seed)
        if ep == 1 or ep % max(1, args.epochs // 10) == 0:
            print(f"  epoch {ep:5d}   loss {loss:.4f}   acc {accuracy(net, X, Y)*100:5.1f}%")
    dt = time.time() - t0
    print()
    render(net, X, Y)
    print(f"\nfinal accuracy: {accuracy(net, X, Y)*100:.1f}%   trained in {dt:.2f}s   (A=class1  B=class0  #=brain says A)")

    if args.save:
        save_file(net, args.save, ds=args.data, epoch=args.epochs, lr=args.lr)
        print(f"saved -> {args.save}")
