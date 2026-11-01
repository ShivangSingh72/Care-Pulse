# CarePulse 🏥

**CarePulse** is an AI-assisted healthcare platform designed to provide health-related insights and support through machine learning and deep learning.

## Features

- 🩺 **Disease Prediction** — ML-based prediction using symptoms.
-  🩻 **X-Ray Analysis** — Deep learning-based chest X-ray findings.
- 🧬 **Cancer Prediction** — Chest and kidney cancer models.
- 💊 **Medicine Information** — Provides medicine-related information.
- 🧠 **Wellbeing Analysis** — ML-based wellbeing assessment.
- 🏥 **Hospital Locator** — Helps users find nearby hospitals.

## Tech Stack

**Frontend:** React, Vite  
**Backend:** Python, FastAPI  
**ML/DL:** Scikit-learn, TensorFlow/Keras  
**Models:** Random Forest, EfficientNetB0  
**Other:** Pandas, NumPy

## Project Structure

```text
Care-Pulse/
├── src/                  # Backend
├── carepulse-frontend/   # React frontend
├── models/               # Trained ML/DL models
├── notebooks/            # Model development
├── data/                 # Datasets (not included)
└── requirements.txt
```

## Run Locally

```bash
git clone https://github.com/ShivangSingh72/Care-Pulse.git
cd Care-Pulse
pip install -r requirements.txt
```

Start the backend:

```bash
python -m uvicorn main:app --reload
```

Start the frontend:

```bash
cd carepulse-frontend
npm install
npm run dev
```

> **Note:** CarePulse is intended for educational and informational purposes and should not be used as a substitute for professional medical diagnosis.