import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

import warnings
warnings.filterwarnings('ignore', category=FutureWarning)
warnings.filterwarnings('ignore', category=DeprecationWarning)
warnings.filterwarnings('ignore', category=UserWarning)

import logging
logging.getLogger('tensorflow').setLevel(logging.ERROR)
logging.getLogger('tensorflow_hub').setLevel(logging.ERROR)

import tensorflow as tf
import tensorflow_hub as hub
import numpy as np
import sys
import traceback
from PIL import Image, UnidentifiedImageError

print("LOADING MODEL…", flush=True)
try:
    hub_model = hub.load("https://tfhub.dev/google/magenta/arbitrary-image-stylization-v1-256/2")
    infer = hub_model.signatures['serving_default']
    z = tf.ones((1, 256, 256, 3), dtype=tf.float32) * 0.5
    _ = infer(placeholder=z, placeholder_1=z)
    print("MODEL LOADED", flush=True)
except Exception as e:
    print(f"MODEL_LOAD_ERROR: {e}", flush=True)
    sys.exit(1)

def load_image(path):
    try:
        img = Image.open(path).convert("RGB").resize((256, 256), Image.Resampling.LANCZOS)
        arr = np.array(img, dtype=np.float32) / 255.0
        return tf.constant(arr[np.newaxis, ...], dtype=tf.float32)
    except UnidentifiedImageError:
        raise ValueError("Invalid image file")
    except Exception as e:
        raise IOError(f"Could not load image: {e}")

def process_images(content_path, style_path):
    content = load_image(content_path)
    style = load_image(style_path)

    out = infer(placeholder=content, placeholder_1=style)
    stylized = out['output_0'][0].numpy()
    stylized = (np.clip(stylized, 0, 1) * 255).astype(np.uint8)

    return Image.fromarray(stylized)

if __name__ == "__main__":
    try:
        if len(sys.argv) != 4:
            raise ValueError("Usage: style_transfer.py content_path style_path output_path")
        c_path, s_path, out_path = sys.argv[1], sys.argv[2], sys.argv[3]

        for p in (c_path, s_path):
            if not os.path.exists(p):
                raise FileNotFoundError(f"File not found: {p}")

        output_dir = os.path.dirname(out_path)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)

        result = process_images(c_path, s_path)
        result.save(out_path, format='PNG')

        if not os.path.exists(out_path) or os.path.getsize(out_path) == 0:
            raise IOError("Failed to generate output image")

        print("SUCCESS", flush=True)
        sys.exit(0)

    except Exception as e:
        tb = traceback.format_exc()
        print(f"ERROR[{type(e).__name__}]: {e}", flush=True)
        print("TRACE:", tb, flush=True)
        sys.exit(1)
