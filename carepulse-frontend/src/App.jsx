import { useState } from "react";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

import SymptomChecker from "./pages/SymptomChecker";
import MedicalImage from "./pages/MedicalImage";
import CarePlanPage from "./pages/CarePlan";
import Wellbeing from "./pages/Wellbeing";
import Hospitals from "./pages/Hospitals";

import { getPatientProfile } from "./utils/patientprofile";

import "./styles/sidebar.css";


const PAGE_META = {
  main: {
    title: "CarePulse",
    subtitle: "Main",
  },

  "care-plan": {
    title: "CarePulse",
    subtitle: "Care Plan",
  },

  wellbeing: {
    title: "CarePulse",
    subtitle: "Wellbeing",
  },

  "medical-image": {
    title: "CarePulse",
    subtitle: "Medical Image",
  },

  hospital: {
    title: "CarePulse",
    subtitle: "Hospital",
  },
};


function getSavedDisease() {
  try {
    return localStorage.getItem("carepulse:lastDisease") || null;
  } catch {
    return null;
  }
}


export default function App() {
  const [activePage, setActivePage] = useState("main");

  /*
   * Restore the last analyzed disease when the app starts.
   * This prevents the Care Plan from becoming empty after
   * navigating or refreshing the application.
   */
  const [activeDisease, setActiveDisease] = useState(() =>
    getSavedDisease()
  );

  // Global patient profile
  const [patientProfile, setPatientProfile] = useState(() =>
    getPatientProfile()
  );


  function navigate(page) {
    setActivePage(page);
  }


  function handleProfileChange(profile) {
    setPatientProfile(profile);
  }


  function handleDiseaseAnalyzed(disease) {
    if (!disease) {
      return;
    }

    setActiveDisease(disease);

    /*
     * Keep the most recently analyzed disease available
     * even after a page refresh.
     */
    try {
      localStorage.setItem(
        "carepulse:lastDisease",
        disease
      );
    } catch {
      // Ignore localStorage errors.
    }
  }


  const meta =
    PAGE_META[activePage] ||
    PAGE_META.main;


  return (
    <div className="app-shell">

      {/* ==============================
          HEADER
          ============================== */}

      <Header
        title={meta.title}
        subtitle={meta.subtitle}
        onLogoClick={() =>
          navigate("main")
        }
        profile={patientProfile}
        onProfileChange={
          handleProfileChange
        }
      />


      {/* ==============================
          BODY
          ============================== */}

      <div className="app-body">

        {/* LEFT SIDEBAR */}

        <Sidebar
          activePage={activePage}
          onNavigate={navigate}
        />


        {/* MAIN CONTENT */}

        <main className="main">

          {/* MAIN / SYMPTOMS */}

          {activePage === "main" && (
            <SymptomChecker
              patientProfile={
                patientProfile
              }
              onDiseaseAnalyzed={
                handleDiseaseAnalyzed
              }
            />
          )}


          {/* CARE PLAN */}

          {activePage === "care-plan" && (
            <CarePlanPage
              disease={activeDisease}
            />
          )}


          {/* WELLBEING */}

          {activePage === "wellbeing" && (
            <Wellbeing />
          )}


          {/* MEDICAL IMAGE */}

          {activePage === "medical-image" && (
            <MedicalImage />
          )}


          {/* HOSPITAL */}

          {activePage === "hospital" && (
            <Hospitals />
          )}

        </main>

      </div>

    </div>
  );
}