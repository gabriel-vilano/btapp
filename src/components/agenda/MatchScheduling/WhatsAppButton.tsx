"use client";

import { useState, type MouseEvent } from "react";
import { WhatsappLogoIcon } from "@phosphor-icons/react";
import { ButtonLink } from "@/src/components/ui/Button";
import { Dialog } from "@/src/components/ui/Dialog";
import { Icon } from "@/src/components/ui/Icon";
import { scheduleWhatsAppHref, type WhatsAppSubject } from "./whatsAppText";

// "use client": o ícone do WhatsApp vem do Phosphor, e o pedido do telefone guarda estado.

type WhatsAppButtonProps = {
  subject: WhatsAppSubject;
  /**
   * Tela do próprio telefone, quando quem vê ainda não informou o dele. No primeiro
   * toque, o botão pergunta se ele quer informar antes de abrir o WhatsApp (M20).
   */
  phoneSettingsHref?: string;
};

// O pedido aparece uma vez por aparelho: depois dele, o botão só abre o WhatsApp.
// O telefone é opcional (M20), e perguntar a cada toque viraria obstáculo
export const PHONE_ASKED_KEY = "bt:whatsapp-phone-asked";

/**
 * "Abrir no WhatsApp" da marcação (docs/SCHEDULING.md §6, M24): abre o WhatsApp com a
 * mensagem pronta e sem destinatário, para o jogador escolher a conversa ou o grupo.
 * @example <WhatsAppButton subject={{ kind: "agreed", option }} phoneSettingsHref="/perfil/configuracoes/telefone" />
 */
export function WhatsAppButton({ subject, phoneSettingsHref }: WhatsAppButtonProps) {
  const [asking, setAsking] = useState(false);
  const href = scheduleWhatsAppHref(subject);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (phoneSettingsHref === undefined || wasAsked()) return;
    event.preventDefault();
    markAsked();
    setAsking(true);
  }

  return (
    <>
      <WhatsAppLink href={href} variant="ghost" onClick={handleClick}>
        Abrir no WhatsApp
      </WhatsAppLink>
      {phoneSettingsHref !== undefined && (
        <PhonePrompt
          open={asking}
          onClose={() => setAsking(false)}
          whatsAppHref={href}
          phoneSettingsHref={phoneSettingsHref}
        />
      )}
    </>
  );
}

type PhonePromptProps = {
  open: boolean;
  onClose: () => void;
  whatsAppHref: string;
  phoneSettingsHref: string;
};

// Só pergunta: informar o telefone é uma tela própria, com o consentimento (M21)
function PhonePrompt({ open, onClose, whatsAppHref, phoneSettingsHref }: PhonePromptProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Informar seu telefone?"
      description="Com o telefone, seus adversários e seu parceiro podem abrir a conversa com você direto pelo app. É opcional, e você apaga quando quiser."
      footer={
        <>
          <WhatsAppLink href={whatsAppHref} variant="secondary" onClick={onClose}>
            Agora não, abrir o WhatsApp
          </WhatsAppLink>
          <ButtonLink href={phoneSettingsHref} fullWidth>
            Informar telefone
          </ButtonLink>
        </>
      }
    />
  );
}

type WhatsAppLinkProps = {
  href: string;
  variant: "secondary" | "ghost";
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  children: string;
};

// O WhatsApp abre fora do app: nova aba, sem passar o `opener` para a página dele
function WhatsAppLink({ href, variant, onClick, children }: WhatsAppLinkProps) {
  return (
    <ButtonLink href={href} variant={variant} fullWidth target="_blank" rel="noopener noreferrer" onClick={onClick}>
      <Icon icon={WhatsappLogoIcon} size="sm" />
      <span>{children}</span>
    </ButtonLink>
  );
}

// Sem armazenamento (aba anônima, dados bloqueados), o pedido aparece de novo: é o
// lado seguro, porque ele nunca impede de abrir o WhatsApp
function wasAsked(): boolean {
  try {
    return window.localStorage.getItem(PHONE_ASKED_KEY) !== null;
  } catch {
    return false;
  }
}

function markAsked(): void {
  try {
    window.localStorage.setItem(PHONE_ASKED_KEY, new Date().toISOString());
  } catch {
    // Sem armazenamento, nada a guardar
  }
}
