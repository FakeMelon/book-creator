"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { useWizardStore } from "@/hooks/use-wizard-store";
import { Button } from "@/components/ui/button";
import { CHARACTER_ROLE_OPTIONS } from "@/constants";
import { cn } from "@/lib/utils";
import type { AdditionalCharacter } from "@/types";

interface StepPhotoUploadProps {
  uploadFile?: (file: File) => Promise<string>;
  allowSkip?: boolean;
}

function ChildPhotoDropzone() {
  const { childPhotos, addChildPhoto, removeChildPhoto } = useWizardStore();
  const [error, setError] = useState("");

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError("");
      for (const file of acceptedFiles) {
        if (file.size > 10 * 1024 * 1024) {
          setError("Each photo must be under 10MB");
          return;
        }
        if (childPhotos.length >= 5) {
          setError("Maximum 5 photos");
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          addChildPhoto({ file, preview: reader.result as string });
        };
        reader.readAsDataURL(file);
      }
    },
    [addChildPhoto, childPhotos.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 5,
    multiple: true,
  });

  return (
    <div>
      {/* Thumbnails grid */}
      {childPhotos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
          {childPhotos.map((photo, index) => (
            <div key={index} className="relative group">
              <div className="w-full aspect-square rounded-xl overflow-hidden shadow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.preview!}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeChildPhoto(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      {childPhotos.length < 5 && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <input {...getInputProps()} />
          <div className="space-y-2 py-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-muted flex items-center justify-center">
              <svg className="w-7 h-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-semibold">Drop photos here or click to browse</p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG or WebP, max 10MB each ({childPhotos.length}/5)
            </p>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  );
}

function AdditionalCharacterCard({
  character,
  index,
  onUpdate,
  onRemove,
}: {
  character: AdditionalCharacter;
  index: number;
  onUpdate: (index: number, character: AdditionalCharacter) => void;
  onRemove: (index: number) => void;
}) {
  const onPhotoDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate(index, {
          ...character,
          photoFile: file,
          photoPreview: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    },
    [character, index, onUpdate]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onPhotoDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div className="border border-border rounded-xl p-4 space-y-3 bg-background">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Character {index + 1}</span>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-sm text-destructive hover:underline"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">Name</label>
          <input
            type="text"
            value={character.name}
            onChange={(e) =>
              onUpdate(index, { ...character, name: e.target.value })
            }
            placeholder="Character name"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Role</label>
          <select
            value={character.role}
            onChange={(e) =>
              onUpdate(index, { ...character, role: e.target.value })
            }
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Select role</option>
            {CHARACTER_ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Photo */}
      <div
        {...getRootProps()}
        className={cn(
          "border border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors",
          character.photoPreview
            ? "border-primary/50 bg-primary/5"
            : "border-border hover:border-primary/50"
        )}
      >
        <input {...getInputProps()} />
        {character.photoPreview ? (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={character.photoPreview}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-muted-foreground">Click to replace photo</p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground py-1">
            Drop a photo or click to upload (optional)
          </p>
        )}
      </div>
    </div>
  );
}

export function StepPhotoUpload({ uploadFile, allowSkip }: StepPhotoUploadProps = {}) {
  const {
    childPhotos,
    childName,
    additionalCharacters,
    addAdditionalCharacter,
    updateAdditionalCharacter,
    removeAdditionalCharacter,
    setChildPhotoKeys,
    setPhotoKey,
    setPhoto,
    nextStep,
    prevStep,
    photoPreview,
  } = useWizardStore();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const hasPhotos = childPhotos.length > 0 || photoPreview;

  async function handleUploadAndContinue() {
    setUploading(true);
    setError("");

    try {
      const keys: string[] = [];

      // Upload child photos
      for (const photo of childPhotos) {
        if (!photo.file) continue;

        if (uploadFile) {
          const key = await uploadFile(photo.file);
          keys.push(key);
        } else {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: `child-photo-${keys.length + 1}.jpg`,
              contentType: photo.file.type,
            }),
          });
          if (!res.ok) throw new Error("Failed to get upload URL");
          const { uploadUrl, key } = await res.json();
          await fetch(uploadUrl, {
            method: "PUT",
            body: photo.file,
            headers: { "Content-Type": photo.file.type },
          });
          keys.push(key);
        }
      }

      // Fallback: upload legacy single photo if no multi-photos
      if (keys.length === 0 && photoPreview) {
        const photoFile = useWizardStore.getState().photoFile;
        if (photoFile) {
          if (uploadFile) {
            const key = await uploadFile(photoFile);
            keys.push(key);
          } else {
            const res = await fetch("/api/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                filename: "child-photo.jpg",
                contentType: "image/jpeg",
              }),
            });
            if (!res.ok) throw new Error("Failed to get upload URL");
            const { uploadUrl, key } = await res.json();
            await fetch(uploadUrl, {
              method: "PUT",
              body: photoFile,
              headers: { "Content-Type": photoFile.type },
            });
            keys.push(key);
          }
        }
      }

      setChildPhotoKeys(keys);
      if (keys.length > 0) {
        setPhotoKey(keys[0]);
      }

      // Upload additional character photos
      const store = useWizardStore.getState();
      for (let i = 0; i < store.additionalCharacters.length; i++) {
        const char = store.additionalCharacters[i];
        if (!char.photoFile) continue;

        if (uploadFile) {
          const key = await uploadFile(char.photoFile);
          updateAdditionalCharacter(i, { ...char, photoKey: key, photoFile: null });
        } else {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: `character-${i + 1}.jpg`,
              contentType: char.photoFile.type,
            }),
          });
          if (!res.ok) throw new Error("Failed to get upload URL");
          const { uploadUrl, key } = await res.json();
          await fetch(uploadUrl, {
            method: "PUT",
            body: char.photoFile,
            headers: { "Content-Type": char.photoFile.type },
          });
          updateAdditionalCharacter(i, { ...char, photoKey: key, photoFile: null });
        }
      }

      nextStep();
    } catch {
      setError("Upload failed. Please try again.");
    }

    setUploading(false);
  }

  function handleContinue() {
    if (hasPhotos) {
      handleUploadAndContinue();
    } else if (allowSkip) {
      nextStep();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 max-w-lg mx-auto"
    >
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold">Upload {childName}&apos;s Photos</h2>
        <p className="text-muted-foreground mt-2">
          We&apos;ll transform them into illustrated characters
        </p>
      </div>

      {/* Section A: Kid Photos */}
      <div>
        <h3 className="text-sm font-semibold mb-3">
          Kid Photos <span className="text-destructive">*</span>
        </h3>
        <ChildPhotoDropzone />
      </div>

      {/* Photo tips */}
      <div className="bg-muted/50 rounded-xl p-4 space-y-2">
        <p className="text-sm font-semibold">Tips for best results:</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>Upload multiple clear photos from different angles</li>
          <li>Good lighting, no heavy shadows</li>
          <li>Neutral or simple background</li>
          <li>Recent photos showing current appearance</li>
        </ul>
      </div>

      {/* Section B: Additional Characters */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">
            Additional Characters{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </h3>
          {additionalCharacters.length < 4 && (
            <button
              type="button"
              onClick={() =>
                addAdditionalCharacter({
                  name: "",
                  role: "",
                  photoFile: null,
                  photoPreview: null,
                  photoKey: null,
                })
              }
              className="text-sm text-primary font-medium hover:underline"
            >
              + Add Character
            </button>
          )}
        </div>

        {additionalCharacters.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Add family members, friends, or pets to include in the story.
          </p>
        )}

        <div className="space-y-3">
          {additionalCharacters.map((char, index) => (
            <AdditionalCharacterCard
              key={index}
              character={char}
              index={index}
              onUpdate={updateAdditionalCharacter}
              onRemove={removeAdditionalCharacter}
            />
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      <div className="flex gap-3">
        <Button onClick={prevStep} variant="outline" size="lg" className="flex-1">
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!hasPhotos && !allowSkip}
          loading={uploading}
          size="lg"
          className="flex-[2]"
        >
          {uploading ? "Uploading..." : !hasPhotos && allowSkip ? "Skip" : "Continue"}
        </Button>
      </div>
    </motion.div>
  );
}
