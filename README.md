# CarePulse: AI-Assisted Health & Wellbeing

CarePulse is a web application that combines symptom-based disease prediction, care guidance, digital wellbeing assessment, and hospital discovery in one interface.

> ⚠️ **Disclaimer:** CarePulse is an AI-assisted informational tool, not a medical diagnosis or a substitute for professional medical advice.

## 🧠 Overview

CarePulse currently provides three main sections:

- **Symptoms** — enter symptoms or use the symptom library to receive an AI-assisted disease prediction and care guidance.
- **Wellbeing** — assess lifestyle and wellbeing factors using a trained machine learning model.
- **Hospitals** — search for nearby hospitals and healthcare facilities.

## 🚀 Core Features

### 1. 🩺 Symptom Checker

- Natural-language symptom input
- Interactive symptom library
- Severity selection
- Random Forest disease prediction
- Top model predictions
- Matched symptom count
- Care Plan generated from the predicted condition

### 2. 📋 Care Plan

Displayed directly inside the Symptoms workflow.

Includes:

- Precautions
- Medications
- Exercises / workouts
- Diet guidance
- Interactive completion checkboxes

### 3. 🧘 Digital Wellbeing

- Lifestyle and wellbeing assessment
- Screen usage, sleep, activity, study, and stress inputs
- Machine learning wellbeing score
- 0–100 display scale
- Browser-local assessment history

### 4. 🏥 Hospitals

- Hospital discovery interface
- Location search
- Distance filtering
- Directions and contact actions

> Hospital backend integration is still being completed.

## 🧰 Technology Stack

| Area | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | CSS |
| Backend | FastAPI |
| Server | Uvicorn |
| ML | Scikit-learn |
| Disease model | Random Forest |
| Validation | Pydantic |

## 🔌 API Endpoints

```text
POST /predict-disease
POST /recommendations
POST /predict-wellbeing
```

The hospital interface is present, but its backend route integration is still pending.

## 📂 Project Structure

```text
CarePulse/
├── artifacts/
├── config/
├── data/
├── notebooks/
├── src/
├── tests/
├── carepulse-frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── pages/
│       └── styles/
├── main.py
├── documentation.md
└── README.md
```

## ⚙️ Setup

### Backend

```powershell
cd CarePulse
$env:PYTHONPATH="$PWD\src"
python -m uvicorn main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

### Frontend

```powershell
cd carepulse-frontend
npm.cmd install
npm.cmd run dev
```

Frontend:

```text
http://localhost:5173
```


## 📦 Installation

### Backend Dependencies

Clone the repository and move into the project directory:

git clone https://github.com/ShivangSingh72/Care-Pulse.git
cd Care-Pulse

Install the dependencies:

python -m pip install -r requirements.txt

From the project root:

```powershell
$env:PYTHONPATH="$PWD\src"
python -m pip install -r requirements.txt
```

### Frontend Dependencies

Move into the frontend directory:

```powershell
cd carepulse-frontend
npm.cmd install
```

### Environment Configuration

Keep API keys and other secrets in a local `.env` file and do not commit them to GitHub.

### Run the Application

Start the backend:

```powershell
cd CarePulse
$env:PYTHONPATH="$PWD\src"
python -m uvicorn main:app --reload
```

Start the frontend in a separate terminal:

```powershell
cd CarePulse\carepulse-frontend
npm.cmd run dev
```

## 🔜 Future Development

Planned **AI Health Document Analysis**:

- X-ray / medical image upload
- Handwritten prescription upload
- Medical report upload
- OCR and vision-based information extraction
- Structured, easy-to-read summaries
