import tensorflow as tf
import numpy as np
from PIL import Image
import io

# Define the file path for your pre-trained model
MODEL_PATH = 'my_module.h5'

# Global variable to hold the loaded model
model = None

def load_model():
    """Loads the Keras model once."""
    global model
    if model is None:
        try:
            # Load the model from the specified path
            # The model should be a ResNet/CNN trained for your specific task (e.g., ROP classification)
            model = tf.keras.models.load_model(MODEL_PATH)
            print("INFO: AI Model loaded successfully.")
        except Exception as e:
            print(f"ERROR: Failed to load AI model from {MODEL_PATH}. Check file path and TensorFlow installation. Error: {e}")
            model = False # Set to False to indicate a failed load but prevent repeated attempts
    return model

def preprocess_image(image_bytes):
    """
    Preprocesses the raw image bytes for model inference.
    
    The preprocessing steps should match what was used during model training.
    For typical CNNs like ResNet, this involves resizing and normalizing.
    """
    try:
        # Open image from bytes and convert to RGB
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        # Resize the image (e.g., to 224x224 for many ResNet variants)
        # **NOTE: Adjust target_size to match your model's input size**
        target_size = (224, 224) 
        image = image.resize(target_size)
        
        # Convert to numpy array
        image_array = np.array(image)
        
        # Rescale pixel values (e.g., to 0-1)
        image_array = image_array / 255.0
        
        # Add batch dimension (e.g., (224, 224, 3) -> (1, 224, 224, 3))
        image_array = np.expand_dims(image_array, axis=0)
        
        return image_array
    except Exception as e:
        print(f"ERROR: Image preprocessing failed: {e}")
        return None

def run_inference(image_bytes):
    """
    Runs the AI model prediction on the preprocessed image.
    """
    model = load_model()
    if not model:
        return {"prediction": "Model Error", "probability": 0.0, "status": "failed"}

    processed_image = preprocess_image(image_bytes)
    if processed_image is None:
        return {"prediction": "Preprocessing Error", "probability": 0.0, "status": "failed"}
    
    try:
        # Run prediction
        predictions = model.predict(processed_image)
        
        # Get the class with the highest probability (assuming a multi-class model)
        # **NOTE: Adjust logic for your specific output (e.g., binary vs. multi-class)**
        predicted_class_index = np.argmax(predictions, axis=1)[0]
        probability = float(np.max(predictions))
        
        # Define class labels corresponding to your model's output indices
        # Example: 'No ROP', 'Pre-ROP', 'ROP Stage 1', 'ROP Stage 2', etc.
        class_labels = ["Stage 0 (Normal)", "Stage 1", "Stage 2", "Stage 3 (High-Risk)"]
        
        prediction_label = class_labels[predicted_class_index]
        
        return {
            "prediction": prediction_label,
            "probability": round(probability, 4),
            "status": "processed"
        }
        
    except Exception as e:
        print(f"ERROR: Model inference failed: {e}")
        return {"prediction": "Inference Exception", "probability": 0.0, "status": "failed"}

# Load the model when the ai_service module is imported
load_model()