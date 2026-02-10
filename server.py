#!/usr/bin/env python3
from flask import Flask, request, make_response, send_file
from datetime import datetime
from collections import defaultdict, deque
import time
import os

app = Flask(__name__)

SAVE_PATH = "/tmp/valentine_replies.txt"
os.makedirs("/tmp", exist_ok=True)

# --- Simple in-memory rate limit: 30 req / 60s per IP ---
WINDOW_SECONDS = 60
MAX_REQ = 30
hits = defaultdict(deque)

def rate_limited(ip: str) -> bool:
    now = time.time()
    dq = hits[ip]
    dq.append(now)
    # pop old
    while dq and now - dq[0] > WINDOW_SECONDS:
        dq.popleft()
    return len(dq) > MAX_REQ

# --- CORS ---
@app.after_request
def add_cors(resp):
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS, GET"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return resp

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

@app.route("/replies", methods=["GET", "OPTIONS"])
def get_replies():
    if request.method == "OPTIONS":
        return make_response(("", 204))

    ip = request.remote_addr or "unknown"
    if rate_limited(ip):
        return make_response(("Too Many Requests", 429))

    limit = request.args.get("limit", type=int)
    if not os.path.exists(SAVE_PATH):
        return ("", 200)

    if limit and limit > 0:
        # Tail-like simple logic: read all, split by '---\n', take last N
        with open(SAVE_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        blocks = [b.strip() for b in content.split('---\n') if b.strip()]
        tail = blocks[-limit:]
        return ("\n---\n".join(tail) + ("\n" if tail else ""), 200, {"Content-Type": "text/plain; charset=utf-8"})
    else:
        with open(SAVE_PATH, "r", encoding="utf-8") as f:
            return (f.read(), 200, {"Content-Type": "text/plain; charset=utf-8"})

@app.route("/replies/download", methods=["GET"])
def download_replies():
    if not os.path.exists(SAVE_PATH):
        open(SAVE_PATH, "w", encoding="utf-8").close()
    return send_file(SAVE_PATH, mimetype="text/plain", as_attachment=True, download_name="valentine_replies.txt")

@app.route("/replies/clear", methods=["POST", "OPTIONS"])
def clear_replies():
    if request.method == "OPTIONS":
        return make_response(("", 204))

    ip = request.remote_addr or "unknown"
    if rate_limited(ip):
        return make_response(("Too Many Requests", 429))

    # Truncate file
    open(SAVE_PATH, "w", encoding="utf-8").close()
    return {"status": "cleared"}, 200

@app.route("/healthz")
def health():
    return {"status": "ok"}, 200

if __name__ == "__main__":
    # pip install flask
    app.run(host="0.0.0.0", port=8082)
