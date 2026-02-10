#!/usr/bin/env python3
from flask import Flask, request, make_response
from datetime import datetime
import os

app = Flask(__name__)
SAVE_PATH = "/tmp/valentine_replies.txt"

@app.after_request
def add_cors(resp):
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS, GET"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type, X-From"
    return resp

@app.route("/reply", methods=["POST", "OPTIONS"])
def reply():
    if request.method == "OPTIONS":
        return make_response(("", 204))

    body = request.get_data(as_text=True) or ""
    sender = request.headers.get("X-From", "Unknown")
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    line = f"[{now}] From={sender} IP={request.remote_addr}\n{body}\n---\n"

    os.makedirs("/tmp", exist_ok=True)
    with open(SAVE_PATH, "a", encoding="utf-8") as f:
        f.write(line)

    return {"status": "ok", "saved_to": SAVE_PATH}, 200

@app.route("/healthz")
def health():
    return {"status": "ok"}, 200

if __name__ == "__main__":
    # pip install flask
    app.run(host="0.0.0.0", port=8081)
