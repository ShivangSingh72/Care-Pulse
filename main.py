from typing import List

from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel, Field

from health_assist.exception import AppException
from health_assist.logger import logger
from health_assist.prediction.prediction import DiseasePredictor
from health_assist.recommendation.recommendation_service import RecommendationService
from health_assist.mental_health.wellbeing_service import WellbeingService
from fastapi.middleware.cors import CORSMiddleware
from health_assist.hospital_service.hospital_locator import HospitalLocator

from health_assist.medical_image.chest_predictor import ChestCancerPredictor
from health_assist.medical_image.kidney_predictor import KidneyCancerPredictor

from health_assist.medical_image.cxr_finding_predictor import (
    predict_cxr_findings
)

app = FastAPI(
    title="CarePulse API",
    description=(
        "Backend API for CarePulse — disease prediction from symptoms, "
        "disease-based recommendations, and mental wellbeing scoring."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

disease_predictor = DiseasePredictor()
recommendation_service = RecommendationService()
wellbeing_service = WellbeingService()
chest_predictor = ChestCancerPredictor()
kidney_predictor = KidneyCancerPredictor()
hospital_locator = HospitalLocator()

class SymptomsRequest(BaseModel):
    symptoms: List[str] = Field(
        ...,
        min_length=1,
        description="List of symptom names, e.g. ['fever', 'cough']",
    )


class DiseaseRequest(BaseModel):
    disease: str = Field(
        ...,
        description="Disease name to fetch recommendations for",
    )


class WellbeingRequest(BaseModel):
    Age: int
    Gender: str
    Country: str
    Academic_Level: str
    Most_Used_Platform: str
    Purpose_Of_Use: str
    Avg_Daily_Usage_Hours: float
    Daily_Unlocks: int
    Study_Hours: float
    Physical_Activity_Hours: float
    Sleep_Hours_Per_Night: float
    Stress_Level: str

class HospitalLocationRequest(BaseModel):
    location: str = Field(
        ...,
        min_length=1,
        description="City, area, or address",
    )
    radius: int | None = Field(
        default=None,
        description="Search radius in meters",
    )
    max_results: int | None = Field(
        default=None,
        description="Maximum number of hospitals to return",
    )


class HospitalCoordinatesRequest(BaseModel):
    lat: float
    lon: float
    radius: int | None = None
    max_results: int | None = None

@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "CarePulse API",
        "version": app.version,
    }


@app.post("/predict-disease")
def predict_disease(request: SymptomsRequest):
    try:
        prediction = disease_predictor.predict(request.symptoms)

        if "error" in prediction:
            raise HTTPException(
                status_code=400,
                detail=prediction["error"],
            )

        top3 = disease_predictor.predict_top3(request.symptoms)

        return {
            "prediction": prediction,
            "top3_predictions": top3,
        }

    except HTTPException:
        raise

    except AppException as e:
        logger.error(f"Disease prediction failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )

    except Exception as e:
        logger.error(f"Unexpected error in /predict-disease: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error.",
        )


@app.post("/recommendations")
def get_recommendations(request: DiseaseRequest):
    try:
        recommendations = recommendation_service.get_recommendations(
            request.disease
        )

        if not recommendations.get("found"):
            raise HTTPException(
                status_code=404,
                detail=f"No recommendations found for disease: {request.disease}",
            )

        return recommendations

    except HTTPException:
        raise

    except AppException as e:
        logger.error(f"Recommendation lookup failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )

    except Exception as e:
        logger.error(f"Unexpected error in /recommendations: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error.",
        )


@app.post("/predict-wellbeing")
def predict_wellbeing(request: WellbeingRequest):
    try:
        result = wellbeing_service.predict_wellbeing(
            request.model_dump()
        )

        return result

    except AppException as e:
        logger.error(f"Wellbeing prediction failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )

    except Exception as e:
        logger.error(f"Unexpected error in /predict-wellbeing: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error.",
        )

@app.post("/hospitals")
def find_hospitals(
    request: HospitalLocationRequest
):
    try:
        result = hospital_locator.find_nearby(
            location=request.location,
            radius=request.radius,
            max_results=request.max_results,
        )

        if result.get("error"):
            raise HTTPException(
                status_code=404,
                detail=result["error"],
            )

        return result

    except HTTPException:
        raise

    except AppException as e:
        logger.error(
            f"Hospital lookup failed: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )

    except Exception as e:
        logger.error(
            f"Unexpected error in /hospitals: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to find nearby hospitals.",
        )


@app.post("/hospitals/coordinates")
def find_hospitals_by_coordinates(
    request: HospitalCoordinatesRequest
):
    try:
        result = (
            hospital_locator.find_nearby_coordinates(
                lat=request.lat,
                lon=request.lon,
                radius=request.radius,
                max_results=request.max_results,
            )
        )

        return result

    except AppException as e:
        logger.error(
            f"Hospital coordinate lookup failed: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )

    except Exception as e:
        logger.error(
            f"Unexpected error in /hospitals/coordinates: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to find nearby hospitals.",
        )

@app.post("/predict-chest")
async def predict_chest(
    file: UploadFile = File(...)
):
    try:

        if not file.content_type:
            raise HTTPException(
                status_code=400,
                detail="File type could not be determined.",
            )

        allowed_types = [
            "image/jpeg",
            "image/png",
            "image/jpg",
        ]

        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="Please upload a JPG or PNG medical image.",
            )

        image_bytes = await file.read()

        if not image_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty.",
            )

        # ------------------------------------------
        # Existing cancer classification
        # ------------------------------------------

        cancer_result = chest_predictor.predict(
            image_bytes
        )

        # ------------------------------------------
        # New CXR finding classification
        # ------------------------------------------

        finding_result = predict_cxr_findings(
            image_bytes
        )

        # ------------------------------------------
        # Combined response
        # ------------------------------------------

        return {
            "filename": file.filename,

            "prediction": cancer_result["prediction"],
            "confidence": cancer_result["confidence"],

            "findings": finding_result["findings"],
            "detected_findings": finding_result[
                "detected_findings"
            ],

            "finding_model": finding_result["model"],

            "disclaimer": finding_result["disclaimer"],
        }

    except HTTPException:
        raise

    except Exception as e:
        logger.error(
            f"Chest image prediction failed: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to analyze the chest image.",
        )
    
@app.post("/predict-kidney")
async def predict_kidney(file: UploadFile = File(...)):
    try:
        if not file.content_type:
            raise HTTPException(
                status_code=400,
                detail="File type could not be determined.",
            )

        allowed_types = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/jpg",
        ]

        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="Please upload a JPG, PNG, or WEBP medical image.",
            )

        image_bytes = await file.read()

        if not image_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty.",
            )

        result = kidney_predictor.predict(image_bytes)

        return {
            "filename": file.filename,
            "prediction": result["prediction"],
            "confidence": result["confidence"],
        }

    except HTTPException:
        raise

    except Exception as e:
        logger.error(
            f"Kidney image prediction failed: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to analyze the kidney image.",
        )