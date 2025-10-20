from flask import Flask, request, jsonify
from flask_cors import CORS
import openai, os

app = Flask(__name__)
CORS(app)  # allow all origins (you can restrict later)

# Make sure to set your OpenAI key as env variable
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route("/api/render-preview", methods=["POST"])
def render_preview():
    data = request.json
    
    # Build a prompt from client selections
    base_prompt = (
        f"A luxury cigar box in {data.get('box')} style containing "
        f"{data.get('quantity')} {data.get('size')} cigars. "
        f"Binder: {data.get('binder')}, Flavor: {data.get('flavor')}. "
        f"Engraving: '{data.get('engraving')}' on the box, "
        f"band text: '{data.get('bandText')}'. "
        f"Photorealistic product render, studio lighting."
    )
    
    try:
        # Call OpenAI DALL·E (gpt-image-1 is the latest)
        result = openai.images.generate(
            model="gpt-image-1",    # "dall-e-3" if your account has access
            prompt=base_prompt,
            size="1024x1024"
        )
        image_url = result.data[0].url

        return jsonify({
            "url": image_url,
            "prompt": base_prompt
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
