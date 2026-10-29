import { post } from "./client";

// Connected: POST /predict-wellbeing
// Backend: WellbeingService.predict_wellbeing()
// Payload keys must match WellbeingRequest exactly (main.py):
// Age, Gender, Country, Academic_Level, Most_Used_Platform,
// Purpose_Of_Use, Avg_Daily_Usage_Hours, Daily_Unlocks, Study_Hours,
// Physical_Activity_Hours, Sleep_Hours_Per_Night, Stress_Level
export function predictWellbeing(payload) {
  return post("/predict-wellbeing", payload);
}
