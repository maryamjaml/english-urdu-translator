
import gc
import torch
from transformers import MarianMTModel, MarianTokenizer

# Translation models
MODEL_NAMES = {
    "en-ur": "Helsinki-NLP/opus-mt-en-ur",
    "ur-en": "Helsinki-NLP/opus-mt-ur-en"
}

# CPU par run karenge
DEVICE = "cpu"

# Only one model will remain loaded at a time
active_direction = None
active_tokenizer = None
active_model = None

torch.set_num_threads(2)


def load_translation_model(direction):

    global active_direction
    global active_tokenizer
    global active_model

    if direction not in MODEL_NAMES:
        raise ValueError("Invalid translation direction.")

    # Reuse model if already loaded
    if active_direction == direction and active_model is not None:
        return active_tokenizer, active_model

    # Release previous model from memory
    if active_model is not None:
        del active_model
        del active_tokenizer
        active_model = None
        active_tokenizer = None
        gc.collect()

    print("Loading NLP model:", MODEL_NAMES[direction])

    model_name = MODEL_NAMES[direction]

    tokenizer = MarianTokenizer.from_pretrained(model_name)

    model = MarianMTModel.from_pretrained(model_name)
    model.to(DEVICE)
    model.eval()

    active_direction = direction
    active_tokenizer = tokenizer
    active_model = model

    print("Model loaded successfully!")

    return active_tokenizer, active_model


def translate_text(text, direction="en-ur"):

    if not text or not text.strip():
        raise ValueError("Please enter some text.")

    tokenizer, model = load_translation_model(direction)

    # Convert text into tokens
    inputs = tokenizer(
        text.strip(),
        return_tensors="pt",
        truncation=True,
        max_length=256
    )

    # Generate translation
    with torch.inference_mode():
        translated_tokens = model.generate(
            **inputs,
            max_new_tokens=256,
            num_beams=4
        )

    # Convert tokens into readable text
    result = tokenizer.decode(
        translated_tokens[0],
        skip_special_tokens=True
    )

    return result
