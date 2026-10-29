from health_assist.mental_health.wellbeing_service import WellbeingService


service = WellbeingService()

input_data = {
    "Age": 21,
    "Gender": "Male",
    "Country": "India",
    "Academic_Level": "Undergraduate",
    "Most_Used_Platform": "Instagram",
    "Purpose_Of_Use": "Entertainment",
    "Avg_Daily_Usage_Hours": 5.0,
    "Daily_Unlocks": 50,
    "Study_Hours": 4.0,
    "Physical_Activity_Hours": 1.0,
    "Sleep_Hours_Per_Night": 7.0,
    "Stress_Level": "Medium"
}

result = service.predict_wellbeing(input_data)

print(result)