"use client";

import { useRef, useState, useCallback } from "react";
import {
  FaceDetector,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

const CDN_BASE =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";

let detectorPromise: Promise<FaceDetector> | null = null;

function getDetector(): Promise<FaceDetector> {
  if (!detectorPromise) {
    detectorPromise = FilesetResolver.forVisionTasks(CDN_BASE).then(
      (vision) =>
        FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
            delegate: "GPU",
          },
          runningMode: "IMAGE",
          minDetectionConfidence: 0.5,
        })
    );
  }
  return detectorPromise;
}

export function useFaceDetection() {
  const [loading, setLoading] = useState(false);
  const initRef = useRef(false);

  const detectFace = useCallback(
    async (image: HTMLImageElement): Promise<boolean> => {
      setLoading(true);
      try {
        const detector = await getDetector();
        const result = detector.detect(image);
        return result.detections.length > 0;
      } catch (err) {
        console.warn("Face detection failed, allowing upload:", err);
        // If detection fails (e.g. WebAssembly not supported), allow the upload
        return true;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Eagerly warm up the detector on first render
  const warmUp = useCallback(() => {
    if (!initRef.current) {
      initRef.current = true;
      getDetector().catch(() => {});
    }
  }, []);

  return { detectFace, loading, warmUp };
}
