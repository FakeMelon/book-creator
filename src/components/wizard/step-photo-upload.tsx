"use client";

import { useState, useCallback, useEffect, createContext, useContext } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useDropzone } from "react-dropzone";
import { useWizardStore } from "@/hooks/use-wizard-store";
import { useFaceDetection } from "@/hooks/use-face-detection";
import { Button } from "@/components/ui/button";
import { CHARACTER_ROLE_OPTIONS } from "@/constants";
import { cn } from "@/lib/utils";
import type { AdditionalCharacter } from "@/types";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/* ── No-face modal ──────────────────────────────────────────────── */

interface NoFaceModalProps {
  open: boolean;
  previewSrc: string | null;
  onClose: () => void;
}

function NoFaceModal({ open, previewSrc, onClose }: NoFaceModalProps) {
  const t = useTranslations("Wizard.photos");

  // Lock body scroll while open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-card rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-5 text-center"
          >
            {/* Rejected thumbnail */}
            {previewSrc && (
              <div className="mx-auto w-24 h-24 rounded-xl overflow-hidden border-2 border-destructive/30 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewSrc} alt="" className="w-full h-full object-cover opacity-60" />
              </div>
            )}

            <div className="space-y-2">
              <h3 className="font-display text-xl font-bold">
                {t("noFaceHeading")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("noFaceMessage")}
              </p>
            </div>

            {/* Tips */}
            <div className="bg-muted/60 rounded-xl p-4 text-start space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("quickTipsHeading")}
              </p>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li className="flex gap-2 items-start">
                  <span className="shrink-0">&#10003;</span>
                  <span>{t("tip1")}</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="shrink-0">&#10003;</span>
                  <span>{t("tip2")}</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="shrink-0">&#10003;</span>
                  <span>{t("tip3")}</span>
                </li>
              </ul>
            </div>

            <Button onClick={onClose} size="lg" className="w-full">
              {t("noFaceDismiss")}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* ── Incomplete character modal ─────────────────────────────────── */

function IncompleteCharacterModal({
  open,
  characters,
  onRemoveIncomplete,
  onClose,
}: {
  open: boolean;
  characters: AdditionalCharacter[];
  onRemoveIncomplete: () => void;
  onClose: () => void;
}) {
  const t = useTranslations("Wizard.photos");

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (typeof window === "undefined") return null;

  const incomplete = characters.filter((c) => !c.name.trim() || !c.photoPreview);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-card rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-5 text-center"
          >
            <div className="space-y-2">
              <h3 className="font-display text-xl font-bold">
                {t("incompleteHeading")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("incompleteMessage", { count: incomplete.length })}
                {" "}{t("incompleteNeedsBoth")}
              </p>
            </div>

            <div className="space-y-3">
              <Button onClick={onClose} variant="outline" size="lg" className="w-full">
                {t("incompleteGoBack")}
              </Button>
              <Button
                onClick={() => { onRemoveIncomplete(); onClose(); }}
                size="lg"
                className="w-full"
              >
                {t("incompleteRemove")}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* ── Photo required modal ───────────────────────────────────────── */

function PhotoRequiredModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("Wizard.photos");

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-card rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-5 text-center"
          >
            <div className="space-y-2">
              <h3 className="font-display text-xl font-bold">
                {t("requiredHeading")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("requiredMessage")}
              </p>
            </div>

            <Button onClick={onClose} size="lg" className="w-full">
              {t("requiredDismiss")}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/* ── Context so child components can trigger the modal ──────────── */

const NoFaceContext = createContext<(previewSrc: string) => void>(() => {});

interface StepPhotoUploadProps {
  uploadFile?: (file: File) => Promise<string>;
}

function PhotoSlot({
  photo,
  index,
  label,
  altText,
  checkingText,
  onRemove,
  getRootProps,
  getInputProps,
  detectingFace,
}: {
  photo?: { preview?: string | null } | null;
  index: number;
  label: string;
  altText: string;
  checkingText: string;
  onRemove: (index: number) => void;
  getRootProps: ReturnType<typeof useDropzone>["getRootProps"];
  getInputProps: ReturnType<typeof useDropzone>["getInputProps"];
  detectingFace: boolean;
}) {
  if (photo?.preview) {
    return (
      <div className="relative group h-full">
        <div className="w-full h-full rounded-lg overflow-hidden shadow-sm bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.preview}
            alt={altText}
            className="w-full h-full object-cover"
          />
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(index); }}
          className="absolute -top-1.5 -end-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          x
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className="w-full h-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200 border-border hover:border-primary/50 hover:bg-muted/50 gap-1 p-2"
    >
      <input {...getInputProps()} />
      {detectingFace ? (
        <p className="text-xs text-muted-foreground font-medium">{checkingText}</p>
      ) : (
        <>
          <svg
            className="w-5 h-5 text-muted-foreground/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="text-xs leading-tight text-muted-foreground font-medium text-center">
            {label}
          </span>
        </>
      )}
    </div>
  );
}

function ChildPhotoDropzone() {
  const { childPhotos, addChildPhoto, removeChildPhoto } = useWizardStore();
  const [error, setError] = useState("");
  const { detectFace, loading: detectingFace, warmUp } = useFaceDetection();
  const showNoFaceModal = useContext(NoFaceContext);
  const t = useTranslations("Wizard.photos");

  const slotLabels = [
    t("slotLabel1"),
    t("slotLabel2"),
    t("slotLabel3"),
    t("slotLabel4"),
  ];

  useEffect(() => { warmUp(); }, [warmUp]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError("");
      for (const file of acceptedFiles) {
        if (file.size > 10 * 1024 * 1024) {
          setError(t("errorTooLarge"));
          return;
        }
        if (useWizardStore.getState().childPhotos.length >= 4) {
          setError(t("errorMaxPhotos"));
          return;
        }
        const preview = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        const img = await loadImage(preview);
        const hasFace = await detectFace(img);
        if (!hasFace) {
          showNoFaceModal(preview);
          continue;
        }
        addChildPhoto({ file, preview });
      }
    },
    [addChildPhoto, detectFace, showNoFaceModal, t]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 4,
    multiple: true,
  });

  return (
    <div className="space-y-2.5">
      {/* Side-by-side: big square left, 3 small squares stacked right */}
      <div className="grid grid-cols-4 grid-rows-3 gap-2.5 aspect-[4/3]">
        {/* Big square: spans 3 cols x 3 rows */}
        <div className="col-span-3 row-span-3">
          <PhotoSlot
            photo={childPhotos[0]}
            index={0}
            label={slotLabels[0]}
            altText={t("photoAlt", { index: 1 })}
            checkingText={t("checking")}
            onRemove={removeChildPhoto}
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            detectingFace={detectingFace}
          />
        </div>

        {/* 3 small squares in the right column, one per row */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="col-start-4">
            <PhotoSlot
              photo={childPhotos[i]}
              index={i}
              label={slotLabels[i]}
              altText={t("photoAlt", { index: i + 1 })}
              checkingText={t("checking")}
              onRemove={removeChildPhoto}
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              detectingFace={detectingFace}
            />
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground text-center">
        {t("multipleAnglesInfo")}
      </p>

      {error && <p className="text-sm text-destructive text-center mt-1">{error}</p>}
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
  const { detectFace } = useFaceDetection();
  const showNoFaceModal = useContext(NoFaceContext);
  const t = useTranslations("Wizard.photos");
  const tRoles = useTranslations("Constants.roles");

  const roleOption = CHARACTER_ROLE_OPTIONS.find((r) => r.id === character.role);
  const emoji = roleOption?.emoji ?? "👤";

  const onPhotoDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) return;

      const preview = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const img = await loadImage(preview);
      const hasFace = await detectFace(img);
      if (!hasFace) {
        showNoFaceModal(preview);
        return;
      }

      onUpdate(index, {
        ...character,
        photoFile: file,
        photoPreview: preview,
      });
    },
    [character, index, onUpdate, detectFace, showNoFaceModal]
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
    <div className="flex items-center gap-3 bg-muted/40 rounded-xl p-3">
      {/* Photo or role emoji */}
      <div
        {...getRootProps()}
        className={cn(
          "w-12 h-12 rounded-full shrink-0 flex items-center justify-center cursor-pointer transition-all overflow-hidden",
          character.photoPreview
            ? "ring-2 ring-primary/30"
            : "bg-muted hover:bg-muted/80 border-2 border-dashed border-border hover:border-primary/40"
        )}
      >
        <input {...getInputProps()} />
        {character.photoPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={character.photoPreview} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-lg">{emoji}</span>
        )}
      </div>

      {/* Name input */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-sm font-semibold text-primary">{tRoles(character.role)}</span>
          {!character.photoPreview && (
            <span className="text-xs text-muted-foreground">{t("tapPhotoToAdd")}</span>
          )}
        </div>
        <input
          type="text"
          value={character.name}
          onChange={(e) => onUpdate(index, { ...character, name: e.target.value })}
          placeholder={t("rolePlaceholder", { role: tRoles(character.role) })}
          className="w-full bg-transparent text-sm font-medium placeholder:text-muted-foreground/50 focus:outline-none"
        />
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function StepPhotoUpload({ uploadFile }: StepPhotoUploadProps = {}) {
  const t = useTranslations("Wizard.photos");
  const tc = useTranslations("Common");
  const tRoles = useTranslations("Constants.roles");

  const [subStep, setSubStep] = useState(0);
  const [noFacePreview, setNoFacePreview] = useState<string | null>(null);
  const [showIncomplete, setShowIncomplete] = useState(false);
  const [showPhotoRequired, setShowPhotoRequired] = useState(false);
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
    photoPreview,
  } = useWizardStore();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const hasPhotos = childPhotos.length > 0 || photoPreview;

  const subStepLabels = [t("substep1Label"), t("substep2Label")];
  const subStepHints = [t("substep1Hint"), t("substep2Hint")];

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
          const putRes = await fetch(uploadUrl, {
            method: "PUT",
            body: photo.file,
            headers: { "Content-Type": photo.file.type },
          });
          if (!putRes.ok) throw new Error(`Upload to storage failed (${putRes.status})`);
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
            const putRes = await fetch(uploadUrl, {
              method: "PUT",
              body: photoFile,
              headers: { "Content-Type": photoFile.type },
            });
            if (!putRes.ok) throw new Error(`Upload to storage failed (${putRes.status})`);
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
          const putRes = await fetch(uploadUrl, {
            method: "PUT",
            body: char.photoFile,
            headers: { "Content-Type": char.photoFile.type },
          });
          if (!putRes.ok) throw new Error(`Upload to storage failed (${putRes.status})`);
          updateAdditionalCharacter(i, { ...char, photoKey: key, photoFile: null });
        }
      }

      nextStep();
    } catch (err) {
      console.error("Photo upload failed:", err);
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    }

    setUploading(false);
  }

  function handleNext() {
    if (subStep === 0 && !hasPhotos) {
      setShowPhotoRequired(true);
      return;
    }
    if (subStep < subStepLabels.length - 1) {
      setSubStep(subStep + 1);
    } else if (subStep === 1 && additionalCharacters.length > 0 && !allCharactersComplete) {
      setShowIncomplete(true);
    } else {
      handleUploadAndContinue();
    }
  }

  const allCharactersComplete = additionalCharacters.length > 0 &&
    additionalCharacters.every((c) => c.name.trim() && c.photoPreview);

  function nextButtonLabel(): string {
    if (uploading) return t("uploading");
    if (subStep === 0) return tc("continue");
    if (additionalCharacters.length === 0) return tc("skip");
    return tc("continue");
  }

  const heading = subStep === 0
    ? (childName ? t("headingWithName", { childName }) : t("headingDefault"))
    : subStepLabels[subStep];

  return (
    <NoFaceContext.Provider value={setNoFacePreview}>
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 max-w-lg mx-auto"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold">
          {heading}
        </h2>
        <p className="text-muted-foreground mt-2">{subStepHints[subStep]}</p>
      </div>

      {/* Sub-step dots */}
      <div className="flex items-center justify-center gap-2">
        {subStepLabels.map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              i === subStep
                ? "bg-primary w-6"
                : i < subStep
                ? "bg-primary"
                : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Sub-step content */}
      <AnimatePresence mode="wait">
        {subStep === 0 && (
          <motion.div
            key="photos"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <ChildPhotoDropzone />
          </motion.div>
        )}

        {subStep === 1 && (
          <motion.div
            key="characters"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            {/* Added characters */}
            {additionalCharacters.length > 0 && (
              <div className="space-y-2">
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
            )}

            {/* Role picker */}
            {additionalCharacters.length < 4 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground text-center">
                  {additionalCharacters.length === 0
                    ? t("whoElse")
                    : t("addAnother")}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {CHARACTER_ROLE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        addAdditionalCharacter({
                          name: "",
                          role: option.id,
                          photoFile: null,
                          photoPreview: null,
                          photoKey: null,
                        })
                      }
                      className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-border bg-background text-sm font-medium hover:border-primary/50 hover:bg-primary/5 transition-colors"
                    >
                      <span>{option.emoji}</span>
                      <span>{tRoles(option.id)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {additionalCharacters.length === 0 && (
              <p className="text-sm text-muted-foreground text-center">
                {t("optionalHint")}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {subStep > 0 && (
          <Button onClick={() => setSubStep(subStep - 1)} variant="outline" size="lg" className="flex-1">
            {tc("back")}
          </Button>
        )}
        <Button
          onClick={handleNext}
          loading={uploading}
          size="lg"
          className={subStep > 0 ? "flex-[2]" : "w-full"}
        >
          {nextButtonLabel()}
        </Button>
      </div>

      <NoFaceModal
        open={!!noFacePreview}
        previewSrc={noFacePreview}
        onClose={() => setNoFacePreview(null)}
      />
      <IncompleteCharacterModal
        open={showIncomplete}
        characters={additionalCharacters}
        onRemoveIncomplete={() => {
          const toRemove = additionalCharacters
            .map((c, i) => (!c.name.trim() || !c.photoPreview) ? i : -1)
            .filter((i) => i !== -1)
            .reverse();
          for (const i of toRemove) removeAdditionalCharacter(i);
          handleUploadAndContinue();
        }}
        onClose={() => setShowIncomplete(false)}
      />
      <PhotoRequiredModal
        open={showPhotoRequired}
        onClose={() => setShowPhotoRequired(false)}
      />
    </motion.div>
    </NoFaceContext.Provider>
  );
}
