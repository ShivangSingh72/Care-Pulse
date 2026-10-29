import { post } from "./client";

// Connected: POST /predict-disease
// Backend: DiseasePredictor.predict() + predict_top3()
export function predictDisease(symptoms) {
  return post("/predict-disease", { symptoms });
}
