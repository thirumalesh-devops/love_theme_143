#!/usr/bin/env python3
from flask import Flask, request, make_response, send_file
from datetime import datetime
from collections import defaultdict, deque
import base64
import time
import os

app = Flask(__name__)

SAVE_PATH = "/tmp/valentine_replies.txt"
os.makedirs("/tmp", exist_ok=True)

# --- Admin credentials (override with env vars if needed) ---
ADMIN_USER = os.getenv("ADMIN_USER", "admin")
ADMIN_PASS = os.getenv("ADMIN_PASS", "admin@143")

# --- Simple in-memory rate limit: 30 req / 60s per IP ---
WINDOW_SECONDS = 60
MAX_REQ = 30
hits = defaultdict(deque)

def rate_limited(ip: str) -> bool:
    now = time.time()
    dq = hits[ip]
    dq.append(now)
    while dq and now - dq[0] > WINDOW_SECONDS:
        dq.popleft()
    return len(dq) > MAX_REQ

def unauthorized():
    resp = make_response(("Unauthorized", 401))
    # Let browsers show a credential prompt if navigated directly
    resp.headers["WWW-Authenticate"] = 'Basic realm="Admin"'
    return resp

def is_admin_request(req) -> bool:
    """Return True if Authorization Basic matches admin creds."""
    auth = req.headers.get("Authorization", "")
    if not auth.startswith("Basic "):
        return False
    try:
        raw = base64.b64decode(auth.split(" ", 1)[1]).decode("utf-8")
        user, pwd = raw.split(":", 1)
        return (user == ADMIN_USER and pwd == ADMIN_PASS)
    except Exception:
        return False

# --- CORS ---
@app.after_request
def add_cors(resp):
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS, GET"
    # Allow Authorization header for admin endpoints
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return resp

# ===== PUBLIC: Save reply =====
@app.route("/reply", methods=["POST", "OPTIONS"])
def reply():
    if request.method == "OPTIONS":
        return make_response(("", 204))

    ip = request.remote_addr or "unknown"
    if rate_limited(ip):
        return make_response(("Too Many Requests", 429))

    body = request.get_data(as_text=True) or ""
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    line = f"[{now}] From={ip}\n{body}\n---\n"

    with open(SAVE_PATH, "a", encoding="utf-8") as f:
        f.write(line)

    return {"status": "ok", "saved_to": SAVE_PATH}, 200

# ===== ADMIN: View replies =====
@app.route("/replies", methods=["GET", "OPTIONS"])
def get_replies():
    if request.method == "OPTIONS":
        return make_response(("", 204))

    ip = request.remote_addr or "unknown"
    if rate_limited(ip):
        return make_response(("Too Many Requests", 429))

    if not is_admin_request(request):
        return unauthorized()

    limit = request.args.get("limit", type=int)
    if not os.path.exists(SAVE_PATH):
        return ("", 200)

    if limit and limit > 0:
        with open(SAVE_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        blocks = [b.strip() for b in content.split('---\n') if b.strip()]
        tail = blocks[-limit:]
        return ("\n---\n".join(tail) + ("\n" if tail else ""), 200, {"Content-Type": "text/plain; charset=utf-8"})
    else:
        with open(SAVE_PATH, "r", encoding="utf-8") as f:
            return (f.read(), 200, {"Content-Type": "text/plain; charset=utf-8"})

# ===== ADMIN: Download replies =====
@app.route("/replies/download", methods=["GET", "OPTIONS"])
def download_replies():
    if request.method == "OPTIONS":
        return make_response(("", 204))

    if not is_admin_request(request):
        return unauthorized()

    if not os.path.exists(SAVE_PATH):
        open(SAVE_PATH, "w", encoding="utf-8").close()

    return send_file(SAVE_PATH, mimetype="text/plain", as_attachment=True, download_name="valentine_replies.txt")

# ===== ADMIN: Clear replies =====
@app.route("/replies/clear", methods=["POST", "OPTIONS"])
def clear_replies():
    if request.method == "OPTIONS":
        return make_response(("", 204))

    ip = request.remote_addr or "unknown"
    if rate_limited(ip):
        return make_response(("Too Many Requests", 429))

    if not is_admin_request(request):
        return unauthorized()

    # Truncate file
    open(SAVE_PATH, "w", encoding="utf-8").close()
    return {"status": "cleared"}, 200

@app.route("/healthz")
def health():
    return {"status": "ok"}, 200

if __name__ == "__main__":
    # pip install flask
    app.run(host="0.0.0.0", port=8082)
