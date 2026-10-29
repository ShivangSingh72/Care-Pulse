import os

import numpy as np
import tensorflow as tf


class ChestCancerPredictor:

    def __init__(self):
        model_path = os.path.join(
            os.path.dirname(
                os.path.dirname(
                    os.path.dirname(
                        os.path.dirname(os.path.abspath(__file__))
                    )
                )
            ),
            "models",
            "chest_cancer_model.keras",
        )

        self.model = tf.keras.models.load_model(model_path)

        self.class_names = [
            "Adenocarcinoma",
            "Large Cell Carcinoma",
            "Normal",
        ]

        self.image_size = (224, 224)

    def predict(self, image_bytes):

        image = tf.io.decode_image(
            image_bytes,
            channels=3,
            expand_animations=False,
        )

        image = tf.image.resize(
            image,
            self.image_size,
        )

        image = tf.cast(
            image,
            tf.float32,
        )

        image = tf.expand_dims(
            image,
            axis=0,
        )

        predictions = self.model.predict(
            image,
            verbose=0,
        )[0]

        predicted_index = int(
            np.argmax(predictions)
        )

        predicted_class = self.class_names[
            predicted_index
        ]

        confidence = float(
            predictions[predicted_index]
        )

        return {
            "prediction": predicted_class,
            "confidence": round(
                confidence * 100,
                2,
            ),
        }