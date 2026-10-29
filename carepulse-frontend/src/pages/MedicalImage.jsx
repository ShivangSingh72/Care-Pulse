import { useEffect, useRef, useState } from "react";
import StatusBanner from "../components/StatusBanner";
import { predictChestImage } from "../api/chestApi";
import { predictKidneyImage } from "../api/kidneyApi";
import { ApiError } from "../api/client";

const IMAGE_TYPES = {
  chest: {
    title: "Chest X-ray",
    shortTitle: "Chest",
    description:
      "Upload a chest X-ray for AI-assisted image classification and finding analysis.",
    accept: "image/png,image/jpeg",
    formats: "PNG or JPG",
    endpointLabel: "Chest X-ray image analysis",
  },

  kidney: {
    title: "Kidney CT",
    shortTitle: "Kidney",
    description:
      "Upload a kidney CT image for AI-assisted image classification.",
    accept: "image/png,image/jpeg,image/webp",
    formats: "PNG, JPG, or WEBP",
    endpointLabel: "Kidney CT image classification",
  },
};

const FINDING_LABELS = {
  pneumonia: "Pneumonia",
  pleural_effusion: "Pleural Effusion",
  consolidation: "Consolidation",
  pulmonary_edema: "Pulmonary Edema",
};

function formatFindingName(finding) {
  return (
    FINDING_LABELS[finding] ||
    finding
      ?.replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}

function FindingCard({ finding }) {
  const score = Number(finding?.score_percent ?? 0);
  const detected = Boolean(finding?.detected);

  return (
    <div
      style={{
        padding: "1rem",
        border: detected
          ? "1px solid color-mix(in srgb, var(--primary) 35%, var(--border))"
          : "1px solid var(--border)",
        borderRadius: "var(--radius)",
        background: detected
          ? "var(--tertiary-wash)"
          : "var(--surface)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "0.75rem",
          marginBottom: "0.75rem",
        }}
      >
        <div>
          <strong
            style={{
              display: "block",
              fontSize: "0.9rem",
              marginBottom: "0.2rem",
            }}
          >
            {formatFindingName(finding.finding)}
          </strong>

          <span
            style={{
              fontSize: "0.74rem",
              color: "var(--on-surface-variant)",
            }}
          >
            Model score
          </span>
        </div>

        <span
          style={{
            padding: "0.3rem 0.55rem",
            borderRadius: "999px",
            fontSize: "0.7rem",
            fontWeight: 700,
            background: detected
              ? "var(--primary)"
              : "var(--surface-container)",
            color: detected ? "#fff" : "var(--on-surface-variant)",
            whiteSpace: "nowrap",
          }}
        >
          {detected ? "Detected" : "Not detected"}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.78rem",
          marginBottom: "0.35rem",
        }}
      >
        <span style={{ color: "var(--on-surface-variant)" }}>
          Score
        </span>

        <strong>{score.toFixed(1)}%</strong>
      </div>

      <div
        style={{
          height: "7px",
          borderRadius: "999px",
          background: "var(--surface-container)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.min(Math.max(score, 0), 100)}%`,
            height: "100%",
            background: detected
              ? "var(--primary)"
              : "var(--outline)",
            borderRadius: "999px",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

export default function MedicalImage() {
  const [imageType, setImageType] = useState("chest");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  const config = IMAGE_TYPES[imageType];

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function changeImageType(type) {
    setImageType(type);
    clearImage();
  }

  function selectFile(selectedFile) {
    if (!selectedFile) {
      return;
    }

    setErrorMessage("");
    setResult(null);

    const allowedTypes = config.accept
      .split(",")
      .map((type) => type.trim());

    if (!allowedTypes.includes(selectedFile.type)) {
      setFile(null);
      setPreview("");
      setStatus("error");
      setErrorMessage(
        `Please select a ${config.formats} medical image.`
      );
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setStatus("idle");
  }

  function handleFileChange(event) {
    selectFile(event.target.files?.[0]);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);

    selectFile(event.dataTransfer.files?.[0]);
  }

  function handleDragOver(event) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    setIsDragging(false);
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      setErrorMessage(
        `Please select a ${config.title.toLowerCase()} first.`
      );
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");
    setResult(null);

    try {
      const data =
        imageType === "chest"
          ? await predictChestImage(file)
          : await predictKidneyImage(file);

      setResult(data);
      setStatus("complete");
    } catch (error) {
      setStatus("error");

      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Something went wrong while analyzing the image."
      );
    }
  }

  function clearImage() {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(null);
    setPreview("");
    setResult(null);
    setErrorMessage("");
    setStatus("idle");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const isAnalyzing = status === "loading";

  const detectedFindings = Array.isArray(result?.detected_findings)
    ? result.detected_findings
    : [];

  const allFindings = Array.isArray(result?.findings)
    ? result.findings
    : [];

  const isChestResult =
    imageType === "chest" && Array.isArray(result?.findings);

  return (
    <div
      className="page"
      style={{
        maxWidth: "900px",
      }}
    >
      {/* PAGE HEADER */}

      <header>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.7rem",
            marginBottom: "0.45rem",
          }}
        >
          <span
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              background: "var(--tertiary-wash)",
              color: "var(--primary)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              fontWeight: 700,
            }}
          >
            +
          </span>

          <div>
            <p
              style={{
                margin: 0,
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--primary)",
              }}
            >
              AI-assisted analysis
            </p>

            <h1
              style={{
                fontSize: "1.65rem",
              }}
            >
              Medical image analysis
            </h1>
          </div>
        </div>

        <p className="page-lead">
          Upload a medical image and CarePulse will analyze it
          using the selected computer vision model.
        </p>
      </header>

      {/* UPLOAD CARD */}

      <section
        style={{
          background: "var(--surface-container-lowest)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-resting)",
          padding: "clamp(1rem, 3vw, 1.6rem)",
        }}
      >
        {/* STEP 1 */}

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0.8rem",
            marginBottom: "1.25rem",
          }}
        >
          <span
            style={{
              width: "36px",
              height: "36px",
              flexShrink: 0,
              borderRadius: "11px",
              background: "var(--tertiary-wash)",
              color: "var(--primary)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            1
          </span>

          <div>
            <h2
              style={{
                fontSize: "1.15rem",
                marginBottom: "0.2rem",
              }}
            >
              Choose the image type
            </h2>

            <p
              style={{
                margin: 0,
                color: "var(--on-surface-variant)",
                fontSize: "0.88rem",
              }}
            >
              Select the type of medical image you want CarePulse
              to analyze.
            </p>
          </div>
        </div>

        {/* TYPE SELECTOR */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
            gap: "0.65rem",
            marginBottom: "1.25rem",
          }}
        >
          {["chest", "kidney"].map((type) => {
            const selected = imageType === type;

            return (
              <button
                key={type}
                type="button"
                onClick={() => changeImageType(type)}
                style={{
                  minHeight: "74px",
                  padding: "0.85rem",
                  borderRadius: "var(--radius)",
                  border: selected
                    ? "1.5px solid var(--primary)"
                    : "1px solid var(--border)",
                  background: selected
                    ? "var(--tertiary-wash)"
                    : "var(--surface)",
                  color: "var(--on-surface)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "0.15s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.65rem",
                  }}
                >
                  <span
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "9px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: selected
                        ? "var(--primary)"
                        : "var(--surface-container)",
                      color: selected
                        ? "#fff"
                        : "var(--on-surface-variant)",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                    }}
                  >
                    {type === "chest" ? "C" : "K"}
                  </span>

                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.9rem",
                      }}
                    >
                      {IMAGE_TYPES[type].title}
                    </div>

                    <div
                      style={{
                        color: "var(--on-surface-variant)",
                        fontSize: "0.74rem",
                        marginTop: "0.1rem",
                      }}
                    >
                      {type === "chest"
                        ? "Chest X-ray"
                        : "Kidney CT image"}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* STEP 2 */}

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0.8rem",
            marginBottom: "1rem",
          }}
        >
          <span
            style={{
              width: "36px",
              height: "36px",
              flexShrink: 0,
              borderRadius: "11px",
              background: "var(--tertiary-wash)",
              color: "var(--primary)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            2
          </span>

          <div>
            <h2
              style={{
                fontSize: "1.15rem",
                marginBottom: "0.2rem",
              }}
            >
              Upload your {config.shortTitle.toLowerCase()} image
            </h2>

            <p
              style={{
                margin: 0,
                color: "var(--on-surface-variant)",
                fontSize: "0.88rem",
              }}
            >
              {config.description}
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={config.accept}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        {/* DROP ZONE */}

        {!preview ? (
          <button
            type="button"
            onClick={openFilePicker}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            style={{
              width: "100%",
              minHeight: "330px",
              borderRadius: "var(--radius-lg)",
              border: isDragging
                ? "2px solid var(--primary)"
                : "1.5px dashed var(--sage)",
              background: isDragging
                ? "var(--tertiary-wash)"
                : "var(--surface-container-low)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem",
              cursor: "pointer",
              color: "var(--on-surface)",
              transition: "0.18s ease",
            }}
          >
            <span
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "20px",
                background: "var(--surface-container-lowest)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                color: "var(--primary)",
                marginBottom: "1rem",
                boxShadow: "var(--shadow-resting)",
              }}
            >
              ↑
            </span>

            <strong
              style={{
                fontSize: "1rem",
                marginBottom: "0.35rem",
              }}
            >
              Choose a {config.title.toLowerCase()}
            </strong>

            <span
              style={{
                color: "var(--on-surface-variant)",
                fontSize: "0.9rem",
              }}
            >
              or drag and drop an image here
            </span>

            <span
              style={{
                marginTop: "1rem",
                color: "var(--primary)",
                fontSize: "0.78rem",
                fontWeight: 700,
              }}
            >
              {config.formats}
            </span>
          </button>
        ) : (
          /* PREVIEW */

          <div
            style={{
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border)",
              background: "var(--surface-container-low)",
              padding: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "0.8rem",
              }}
            >
              <div>
                <strong
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                  }}
                >
                  Image selected
                </strong>

                <span
                  style={{
                    fontSize: "0.76rem",
                    color: "var(--on-surface-variant)",
                    wordBreak: "break-all",
                  }}
                >
                  {file?.name}
                </span>
              </div>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={clearImage}
              >
                Change
              </button>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                background: "#000",
                borderRadius: "var(--radius)",
                overflow: "hidden",
              }}
            >
              <img
                src={preview}
                alt={`Selected ${config.title}`}
                style={{
                  width: "100%",
                  maxHeight: "460px",
                  objectFit: "contain",
                }}
              />
            </div>
          </div>
        )}

        {/* ERROR */}

        {status === "error" && (
          <div style={{ marginTop: "1rem" }}>
            <StatusBanner tone="error">
              {errorMessage}
            </StatusBanner>
          </div>
        )}

        {/* ANALYZE */}

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={isAnalyzing || !file}
          style={{
            width: "100%",
            marginTop: "1rem",
            minHeight: "52px",
            fontSize: "0.95rem",
          }}
        >
          {isAnalyzing
            ? "Analyzing image..."
            : `Analyze ${config.shortTitle} image`}
        </button>
      </section>

      {/* RESULT */}

      {result && (
        <section
          style={{
            background: "var(--surface-container-lowest)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-resting)",
            padding: "clamp(1rem, 3vw, 1.6rem)",
            marginTop: "1.25rem",
          }}
        >
          {/* RESULT HEADER */}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--primary)",
                }}
              >
                Analysis complete
              </p>

              <h2
                style={{
                  fontSize: "1.3rem",
                  marginTop: "0.2rem",
                }}
              >
                CarePulse Medical Image Report
              </h2>
            </div>

            <span className="badge badge-success">
              AI-assisted
            </span>
          </div>

          {/* CLASSIFICATION RESULT */}

          <div
            style={{
              background: "var(--surface-container-low)",
              borderRadius: "var(--radius)",
              padding: "1.2rem",
              border: "1px solid var(--border)",
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: "0.75rem",
                color: "var(--on-surface-variant)",
                marginBottom: "0.25rem",
              }}
            >
              Primary classification
            </span>

            <strong
              style={{
                display: "block",
                fontSize: "1.65rem",
                color: "var(--primary-deep)",
                marginBottom: "0.65rem",
              }}
            >
              {result.prediction}
            </strong>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.8rem",
                marginBottom: "0.35rem",
              }}
            >
              <span>Classification confidence</span>

              <strong>
                {Number(result.confidence ?? 0).toFixed(1)}%
              </strong>
            </div>

            <div
              style={{
                height: "8px",
                borderRadius: "999px",
                background: "var(--surface-container)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.min(
                    Math.max(Number(result.confidence ?? 0), 0),
                    100
                  )}%`,
                  height: "100%",
                  background: "var(--primary)",
                  borderRadius: "999px",
                }}
              />
            </div>
          </div>

          {/* CHEST FINDINGS */}

          {isChestResult && (
            <>
              {/* SUMMARY */}

              <div
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  borderRadius: "var(--radius)",
                  background: "var(--tertiary-wash)",
                  border: "1px solid var(--border)",
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--primary)",
                    marginBottom: "0.35rem",
                  }}
                >
                  Image findings
                </span>

                {detectedFindings.length > 0 ? (
                  <>
                    <strong
                      style={{
                        display: "block",
                        fontSize: "1rem",
                        marginBottom: "0.35rem",
                      }}
                    >
                      {detectedFindings.length} finding
                      {detectedFindings.length !== 1 ? "s" : ""} flagged
                    </strong>

                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.84rem",
                        lineHeight: 1.55,
                        color: "var(--on-surface-variant)",
                      }}
                    >
                      The CXR model flagged the findings listed
                      below. These are model outputs and should not
                      be interpreted as confirmed clinical findings.
                    </p>
                  </>
                ) : (
                  <>
                    <strong
                      style={{
                        display: "block",
                        fontSize: "1rem",
                        marginBottom: "0.35rem",
                      }}
                    >
                      No supported findings were flagged
                    </strong>

                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.84rem",
                        lineHeight: 1.55,
                        color: "var(--on-surface-variant)",
                      }}
                    >
                      The model did not flag any of the supported
                      findings above their evaluation thresholds.
                    </p>
                  </>
                )}
              </div>

              {/* DETECTED FINDINGS */}

              {detectedFindings.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                  <h3
                    style={{
                      fontSize: "1rem",
                      marginBottom: "0.65rem",
                    }}
                  >
                    Detected findings
                  </h3>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "0.7rem",
                    }}
                  >
                    {detectedFindings.map((finding) => (
                      <FindingCard
                        key={finding.finding}
                        finding={finding}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ALL MODEL FINDINGS */}

              <div style={{ marginTop: "1.25rem" }}>
                <h3
                  style={{
                    fontSize: "1rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  Finding scores
                </h3>

                <p
                  style={{
                    margin: "0 0 0.7rem",
                    fontSize: "0.78rem",
                    color: "var(--on-surface-variant)",
                  }}
                >
                  Scores are model outputs and are not calibrated
                  medical probabilities.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "0.7rem",
                  }}
                >
                  {allFindings.map((finding) => (
                    <FindingCard
                      key={finding.finding}
                      finding={finding}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* DETAILS */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "0.7rem",
              marginTop: "1.25rem",
            }}
          >
            <div
              style={{
                padding: "0.8rem",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: "0.7rem",
                  color: "var(--on-surface-variant)",
                }}
              >
                Analysis type
              </span>

              <strong
                style={{
                  display: "block",
                  marginTop: "0.2rem",
                  fontSize: "0.85rem",
                }}
              >
                {config.endpointLabel}
              </strong>
            </div>

            <div
              style={{
                padding: "0.8rem",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: "0.7rem",
                  color: "var(--on-surface-variant)",
                }}
              >
                Image
              </span>

              <strong
                style={{
                  display: "block",
                  marginTop: "0.2rem",
                  fontSize: "0.85rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={result.filename}
              >
                {result.filename}
              </strong>
            </div>

            {result.finding_model && (
              <div
                style={{
                  padding: "0.8rem",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontSize: "0.7rem",
                    color: "var(--on-surface-variant)",
                  }}
                >
                  Finding model
                </span>

                <strong
                  style={{
                    display: "block",
                    marginTop: "0.2rem",
                    fontSize: "0.85rem",
                  }}
                >
                  EfficientNetB0
                </strong>
              </div>
            )}
          </div>

          {/* AI SUMMARY */}

          <div style={{ marginTop: "1rem" }}>
            <StatusBanner tone="attention">
              <strong>Important:</strong> CarePulse provides
              AI-assisted image analysis for educational and
              decision-support purposes. Model scores are not
              calibrated medical probabilities and are not a
              confirmed diagnosis. The result does not provide
              lesion location or disease severity. A qualified
              healthcare professional should interpret the medical
              image and make clinical decisions.
            </StatusBanner>
          </div>

          {/* BACKEND DISCLAIMER */}

          {result.disclaimer && (
            <p
              style={{
                margin: "0.8rem 0 0",
                fontSize: "0.72rem",
                lineHeight: 1.5,
                color: "var(--on-surface-variant)",
              }}
            >
              {result.disclaimer}
            </p>
          )}
        </section>
      )}
    </div>
  );
}