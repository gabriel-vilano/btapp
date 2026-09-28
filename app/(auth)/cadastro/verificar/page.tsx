"use client";

import { Suspense, useActionState, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyOtp, resendOtp } from "@/app/(auth)/actions";
import { AuthFormContainer } from "@/src/components/auth/AuthFormContainer";
import { AuthFormHeader } from "@/src/components/auth/AuthFormHeader";
import { OtpInput } from "@/src/components/auth/OtpInput";
import { ResendTimer } from "@/src/components/auth/ResendTimer";
import { Button } from "@/src/components/ui/Button";
import { Alert } from "@/src/components/ui/Alert";
import { TextLink } from "@/src/components/ui/TextLink";
import { useToast } from "@/src/components/ui/Toast";
import { OTP_LENGTH } from "@/src/lib/validations";
import authStyles from "@/app/(auth)/auth-page.module.css";
import verifyStyles from "@/app/(auth)/verify.module.css";

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const email = searchParams.get("email") ?? "";

  useEffect(() => {
    if (!email) {
      router.replace("/cadastro");
    }
  }, [email, router]);

  const [state, formAction, isPending] = useActionState(verifyOtp, null);
  const [resendLoading, setResendLoading] = useState(false);
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (state?.error) {
      setOtp("");
    }
  }, [state?.error]);

  const handleResend = useCallback(async () => {
    setResendLoading(true);
    try {
      const formData = new FormData();
      formData.set("email", email);
      const result = await resendOtp(null, formData);
      if (result?.success) {
        showToast("Código reenviado com sucesso", "success");
      } else if (result?.error) {
        showToast(result.error, "error");
      }
    } catch {
      showToast("Erro de conexão. Verifique sua internet.", "error");
    } finally {
      setResendLoading(false);
    }
  }, [email, showToast]);

  if (!email) return null;

  const showServerError = Boolean(state?.error);
  const showFieldError = Boolean(state?.fieldErrors?.otp);

  return (
    <AuthFormContainer>
      <AuthFormHeader
        title="Verifique seu e-mail"
        subtitleClassName={verifyStyles.verify__subtitle}
        subtitle={
          <>
            <span>Enviamos um código de {OTP_LENGTH} dígitos para</span>
            <span className={verifyStyles.verify__email}>{email}</span>
            <TextLink href="/cadastro">Enviar código para outro e-mail</TextLink>
          </>
        }
      />

      <form action={formAction} className={authStyles["auth-page__form"]}>
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="otp" value={otp} />

        <OtpInput
          value={otp}
          onChange={setOtp}
          error={showFieldError ? state!.fieldErrors!.otp : undefined}
          disabled={isPending}
        />

        {showServerError && (
          <Alert
            status="attention"
            title={state!.error!}
            description="Verifique o código recebido no e-mail."
          />
        )}

        <Button type="submit" fullWidth loading={isPending}>
          Verificar
        </Button>
      </form>

      <div className={verifyStyles.verify__resend}>
        <ResendTimer onResend={handleResend} loading={resendLoading} />
      </div>

      <p className={verifyStyles.verify__hint}>
        Não recebeu? Verifique sua pasta de spam.
      </p>
    </AuthFormContainer>
  );
}
