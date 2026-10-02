"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { CameraIcon, PlusIcon } from "@phosphor-icons/react";
import { Icon } from "@/src/components/ui/Icon";
import { validateAvatar, validateAvatarType } from "@/src/lib/validations";
import { resizeAvatar } from "@/src/lib/resizeAvatar";
import styles from "./AvatarUpload.module.css";

type AvatarUploadProps = {
  onFileSelect: (file: File | null) => void;
  /** Foto atual do jogador, ao editar o perfil. Aparece como preview até a troca. */
  initialUrl?: string | null;
};

export function AvatarUpload({ onFileSelect, initialUrl = null }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function rejectFile(message: string) {
    setError(message);
    onFileSelect(null);
  }

  // A foto é reduzida antes de validar o tamanho: uma foto de celular de 3–10MB vira
  // um JPEG de ~100KB, abaixo do limite do bucket e do body da server action.
  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const typeValidation = validateAvatarType(file);
    if (!typeValidation.valid) return rejectFile(typeValidation.error ?? "");

    const resized = await resizeAvatar(file).catch(() => null);
    if (!resized) return rejectFile("Não foi possível ler a foto. Tente outra imagem.");

    const validation = validateAvatar(resized);
    if (!validation.valid) return rejectFile(validation.error ?? "");

    setError(null);
    setPreview(URL.createObjectURL(resized));
    onFileSelect(resized);
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
                <Icon icon={CameraIcon} size="sm" />
              </span>
            </>
          ) : (
            <>
              <span className={styles.avatar__placeholder} aria-hidden="true">
                <Icon icon={PlusIcon} size="lg" />
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
