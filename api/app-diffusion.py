from huggingface_hub import login

key = os.getenv("HUGGING_FACES_KEY")
login(token=key)

from flask_cors import CORS
from flask import Flask, request, jsonify
from transformers import pipeline
from diffusers import StableDiffusionPipeline
import torch, uuid, os

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost"}})
PREVIEW_DIR = os.path.join("static", "previews")
os.makedirs(PREVIEW_DIR, exist_ok=True)

# 1. Mini LLaMA for prompt enrichment
#print("Loading Mini LLaMA...")
#llama = pipeline("text-generation", model="meta-llama/Llama-2-7b-chat-hf", use_auth_token=True,device=0)

# 2. Stable Diffusion for image rendering
print("Loading Stable Diffusion...")
sd = StableDiffusionPipeline.from_pretrained(
    "stabilityai/stable-diffusion-2-1", torch_dtype=torch.float16
).to("cuda")

@app.route("/api/render-preview", methods=["POST"])
def render_preview():
    selection = request.json

    # Build base prompt from selection
    base_prompt = (
        f"A {selection.get('box')} cigar box with "
        f"{selection.get('quantity')} {selection.get('size')} cigars. "
        f"Binder: {selection.get('binder')}; Flavor: {selection.get('flavor')}. "
        f"Box Engraving: {selection.get('engraving')}; Band: {selection.get('bandText')}."
    )

    # Use Mini LLaMA to expand the description
    #prompt = llama(base_prompt, max_new_tokens=80)[0]["generated_text"]

    print("Prompt:", base_prompt)

    # Generate image with Stable Diffusion
    image = sd(base_prompt).images[0]
    filename = f"{uuid.uuid4().hex}.png"
    filepath = os.path.join(PREVIEW_DIR, filename)
    image.save(filepath)

    return jsonify({"url": f"/static/previews/{filename}"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)