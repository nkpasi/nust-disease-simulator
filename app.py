from flask import Flask, render_template, request, jsonify
from models.sir_deterministic import run_sir, run_seir
from models.sir_stochastic import run_stochastic_sir
from models.monte_carlo import run_monte_carlo, run_r0_sweep

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/sir", methods=["POST"])
def api_sir():
    d = request.get_json()
    try:
        return jsonify({"status":"ok","data": run_sir(int(d["population"]),int(d["initial_infected"]),float(d["beta"]),float(d["gamma"]),int(d["days"]))})
    except Exception as e:
        return jsonify({"status":"error","message":str(e)}), 400

@app.route("/api/seir", methods=["POST"])
def api_seir():
    d = request.get_json()
    try:
        return jsonify({"status":"ok","data": run_seir(int(d["population"]),int(d["initial_infected"]),float(d["beta"]),float(d["gamma"]),float(d.get("sigma",0.33)),int(d["days"]))})
    except Exception as e:
        return jsonify({"status":"error","message":str(e)}), 400

@app.route("/api/stochastic", methods=["POST"])
def api_stochastic():
    d = request.get_json()
    try:
        return jsonify({"status":"ok","data": run_stochastic_sir(int(d["population"]),int(d["initial_infected"]),float(d["beta"]),float(d["gamma"]),int(d["days"]))})
    except Exception as e:
        return jsonify({"status":"error","message":str(e)}), 400

@app.route("/api/monte_carlo", methods=["POST"])
def api_monte_carlo():
    d = request.get_json()
    try:
        return jsonify({"status":"ok","data": run_monte_carlo(int(d["population"]),int(d["initial_infected"]),float(d["beta"]),float(d["gamma"]),int(d["days"]),int(d.get("n_simulations",300)))})
    except Exception as e:
        return jsonify({"status":"error","message":str(e)}), 400

@app.route("/api/r0_sweep", methods=["POST"])
def api_r0_sweep():
    d = request.get_json()
    try:
        return jsonify({"status":"ok","data": run_r0_sweep(int(d["population"]),int(d["initial_infected"]),float(d["gamma"]),int(d["days"]))})
    except Exception as e:
        return jsonify({"status":"error","message":str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True, port=5000)
