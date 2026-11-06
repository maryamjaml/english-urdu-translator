
from flask import Flask, render_template, request, jsonify
from translator import translate_text

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/translate", methods=["POST"])
def translate():

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "Invalid request."
            }), 400

        text = data.get("text", "").strip()
        direction = data.get("direction", "en-ur")

        if not text:
            return jsonify({
                "success": False,
                "error": "Please enter text to translate."
            }), 400

        if direction not in ["en-ur", "ur-en"]:
            return jsonify({
                "success": False,
                "error": "Invalid language selection."
            }), 400

        if len(text) > 3000:
            return jsonify({
                "success": False,
                "error": "Text must be 3000 characters or less."
            }), 400

        result = translate_text(text, direction)

        return jsonify({
            "success": True,
            "translation": result
        })

    except Exception as e:
        print("Translation Error:", str(e))

        return jsonify({
            "success": False,
            "error": "Translation failed. Please check your connection or try again."
        }), 500


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
