"use client";
import { useEffect, useState } from "react";

const LoadingScreen = ({ logoSrc }) => {
  const [spinnerSize, setSpinnerSize] = useState({ width: 200, height: 200 });

  useEffect(() => {
    const updateSpinnerSize = () => {
      const img = document.getElementById("spinner-img");
      if (img) {
        setSpinnerSize({ width: img.clientWidth, height: img.clientHeight });
      }
    };

    updateSpinnerSize();
    window.addEventListener("resize", updateSpinnerSize);
    return () => window.removeEventListener("resize", updateSpinnerSize);
  }, []);

  return (
    <div style={styles.loadWrapper}>
      <div style={styles.spinContainer}>
        {/* Glowing Orange Spinner Rings */}
        <div
          style={{
            ...styles.spin,
            width: spinnerSize.width + 60,
            height: spinnerSize.height + 60,
            borderColor: "#E8602E transparent",
          }}
        ></div>
        <div
          style={{
            ...styles.spin,
            width: spinnerSize.width + 80,
            height: spinnerSize.height + 80,
            borderColor: "rgba(232, 96, 46, 0.45) transparent",
            animation: "rotate2 2s cubic-bezier(0.26, 1.36, 0.74, -0.29) infinite",
          }}
        ></div>
        <div
          style={{
            ...styles.spin,
            width: spinnerSize.width + 100,
            height: spinnerSize.height + 100,
            borderColor: "rgba(255, 255, 255, 0.05) transparent",
          }}
        ></div>
        <div
          style={{
            ...styles.spin,
            width: spinnerSize.width + 120,
            height: spinnerSize.height + 120,
            borderColor: "rgba(232, 96, 46, 0.75) transparent",
            animation: "rotate2 2s cubic-bezier(0.26, 1.36, 0.74, -0.29) infinite",
          }}
        ></div>

        {/* Logo Image */}
        <h1>
          <img
            id="spinner-img"
            src={logoSrc}
            alt="Loading..."
            style={{ width: "50vw", maxWidth: "200px", height: "auto" }}
          />
        </h1>
      </div>
    </div>
  );
};

// Inline Styles
const styles = {
  loadWrapper: {
    zIndex: 5000,
    width: "100%",
    height: "100%",
    position: "fixed",
    top: 0,
    left: 0,
    backgroundColor: "#060606", // Dark background matching website theme
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  spinContainer: {
    display: "flex",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  spin: {
    border: "3px solid #E8602E", // Burnt orange theme base
    position: "absolute",
    borderRadius: "50%",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    animation: "rotate 2s cubic-bezier(0.26, 1.36, 0.74, -0.29) infinite",
  },
};

// Inject keyframes safely
if (typeof document !== "undefined") {
  const styleSheet = document.styleSheets[0] || document.head.appendChild(document.createElement("style")).sheet;
  if (styleSheet) {
    try {
      styleSheet.insertRule(
        `@keyframes rotate { 0% { transform: rotateZ(-360deg); } 100% { transform: rotateZ(0deg); } }`,
        styleSheet.cssRules.length
      );
      styleSheet.insertRule(
        `@keyframes rotate2 { 0% { transform: rotateZ(360deg); } 100% { transform: rotateZ(0deg); } }`,
        styleSheet.cssRules.length
      );
    } catch (e) {
      console.warn("Failed to inject keyframes rules", e);
    }
  }
}

export default LoadingScreen;
