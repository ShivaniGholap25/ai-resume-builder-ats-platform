"""
app.py — Flask Resume Builder (retired)

The resume builder functionality has been fully merged into the React + Node.js
ATS Analyzer frontend. This file is kept for reference only and no longer serves
the resume builder UI.

  React frontend  →  http://localhost:3000
  Node API        →  http://localhost:5000
"""

from flask import Flask, redirect

app = Flask(__name__)

REACT_APP = "http://localhost:3000"


@app.route("/")
def index():
    """Redirect root to the React app."""
    return redirect(REACT_APP)


@app.route("/preview", methods=["GET", "POST"])
def preview():
    """
    The /preview route has been retired.
    Resume generation is now handled entirely inside the React Resume Builder.
    """
    return redirect(f"{REACT_APP}?tab=builder")


if __name__ == "__main__":
    print(
        "\n[app.py] NOTE: The Flask resume builder has been retired.\n"
        f"         All functionality now lives at {REACT_APP}\n"
        "         This process will redirect any incoming requests there.\n"
    )
    app.run(debug=False, port=8000)
