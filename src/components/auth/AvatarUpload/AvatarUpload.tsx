"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Plus } from "@phosphor-icons/react";
import { Icon } from "@/src/components/ui/Icon";
import { validateAvatar } from "@/src/lib/validations";
import styles from "./AvatarUpload.module.css";

type AvatarUploadProps = {
  onFileSelect: (file: File | null) => void;
};

export function AvatarUpload({ onFileSelect }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateAvatar(file);
    if (!validation.valid) {
      setError(validation.error ?? null);
      onFileSelect(null);
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file));
    onFileSelect(file);
  }

  function openPicker() {
    inputRef.current?.click();
  }

  return (
    <>
      <div
        className={styles.avatar}
        onClick={openPicker}
        role="button"
        tabIndex={0}
        aria-label={
          preview ? "Trocar foto de perfil" : "Adicionar foto de perfil"
        }
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
      >
        <div className={styles.avatar__area}>
          {preview ? (
            <>
              <Image
                src={preview}
                alt="Preview da foto de perfil"
                width={96}
                height={96}
                unoptimized
                className={styles.avatar__preview}
              />
              <span className={styles.avatar__badge} aria-hidden="true">
                <Icon icon={Camera} size="sm" />
              </span>
            </>
          ) : (
            <>
              <span className={styles.avatar__placeholder} aria-hidden="true">
                <Icon icon={Plus} size="lg" />
              </span>
            </>
          )}
        </div>

        {error ? (
          <span className={styles.avatar__error}>{error}</span>
        ) : (
          <span className={styles.avatar__label}>
            {preview ? "Trocar foto" : "Adicionar foto"}
          </span>
        )}
      </div>
      {/* Fora do role="button": controle interativo aninhado em outro é
        inválido (axe nested-interactive). O input só é acionado pelo
        openPicker, então sai da árvore de acessibilidade e do Tab. */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className={styles.avatar__input}
        tabIndex={-1}
        aria-hidden="true"
      />
    </>
  );
}
