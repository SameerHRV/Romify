import { CheckCircle2, ImageIcon, UploadIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";
import {
  PROGRESS_INTERVAL_MS,
  PROGRESS_STEP,
  REDIRECT_DELAY_MS,
} from "../lib/constants";

interface AuthContext {
  isSignedIn: boolean;
}

interface UploadProps {
  onComplete?: (base64Data: string) => void;
}

const Upload = ({ onComplete }: UploadProps = {}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { isSignedIn } = useOutletContext<AuthContext>();

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isSignedIn) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      const selectedFile = droppedFiles[0];
      if (selectedFile.type.startsWith("image/")) {
        setFile(selectedFile);
        processFile(selectedFile);
      } else {
        setError("Please drop an image file (JPG, JPEG, PNG)");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSignedIn) return;

    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
      processFile(selectedFile);
    } else if (selectedFile) {
      setError("Please select an image file (JPG, JPEG, PNG)");
    }
  };

  const processFile = (file: File) => {
    setProgress(0);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === "string") {
        const base64Data = e.target.result;
        if (intervalRef.current) clearInterval(intervalRef.current);

        // Simulate progress completion
        setProgress(100);

        // Call onComplete after delay
        setTimeout(() => {
          onComplete?.(base64Data);
        }, REDIRECT_DELAY_MS);
      }
    };

    reader.onerror = () => {
      setError("Error reading file");
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    // Start progress simulation
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 100; // Cap at 100
        return Math.min(prev + PROGRESS_STEP, 95);
      });
    }, PROGRESS_INTERVAL_MS);

    // Read the file as Data URL (Base64)
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="upload">
      {!file ? (
        <div
          className={`dropzone ${isDragging ? "is-dragging" : ""} ${!isSignedIn ? "disabled" : ""}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            className="drop-input"
            type="file"
            accept="image/jpeg, image/png"
            onChange={handleFileChange}
            disabled={!isSignedIn}
          />
          <div className="drop-content">
            <div className="drop-icon">
              <UploadIcon size={20} />
            </div>
            <p>
              {isSignedIn
                ? isDragging
                  ? "Drop the image here"
                  : "Click to Upload or Drag and Drop"
                : "Sign in or Register to Upload"}
            </p>
            <p className="help">Maximum file size: 50 MB</p>
          </div>
        </div>
      ) : (
        <div>
          {error && (
            <div className="upload-error">
              <p className="error-message">⚠️ {error}</p>
            </div>
          )}

          <div className="upload-status">
            <div className="status-content">
              <div className="status-icon">
                {progress === 100 ? (
                  <CheckCircle2 className="check" />
                ) : (
                  <ImageIcon className="image" />
                )}
              </div>

              <h3>{file?.name || "Upload Image"}</h3>

              <div className="progress">
                <div style={{ width: `${progress}%` }} className="bar" />

                <p className="status-text">
                  {progress < 100
                    ? "Processing Image..."
                    : "Processing Complete!"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
