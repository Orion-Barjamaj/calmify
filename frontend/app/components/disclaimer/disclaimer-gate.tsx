"use client";

import { useEffect, useState } from "react";
import styles from "./disclaimer-gate.module.css";

const DISCLAIMER_STORAGE_KEY = "calmify-disclaimer-accepted";

export default function DisclaimerGate() {
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const hasAccepted =
        window.localStorage.getItem(DISCLAIMER_STORAGE_KEY) === "true";
      setIsOpen(!hasAccepted);
    } catch (error) {
      console.error("Error reading disclaimer state:", error);
      setIsOpen(true);
    } finally {
      setHasCheckedStorage(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      window.localStorage.setItem(DISCLAIMER_STORAGE_KEY, "true");
    } catch (error) {
      console.error("Error saving disclaimer state:", error);
    }

    setIsOpen(false);
  };

  if (!hasCheckedStorage || !isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-disclaimer-title"
      >
        <span className={styles.eyebrow}>Before you continue</span>
        <h2 id="app-disclaimer-title" className={styles.title}>
          Disclaimer
        </h2>
        <p className={styles.description}>
          This application uses biometric data to analyze and detect whether
          the user may be experiencing stress. This data is used solely for
          this purpose and is not stored, shared, or distributed to any third
          parties.
        </p>
        <button type="button" className={styles.button} onClick={handleAccept}>
          I understand
        </button>
      </div>
    </div>
  );
}
