"use client";

import Image from "next/image";
import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { updateAvatarAction } from "@/app/actions/profile";
import {
  DangerButton,
  SecondaryButton,
  UnstyledButton,
} from "@/components/ui/action-button";
import {
  ErrorToast,
  SuccessToast,
} from "@/components/ui/feedback-toast";
import { Modal } from "@/components/ui/modal";
import type { AvatarFormState } from "@/lib/profile-form";

type ProfileAvatarProps = {
  displayName: string;
  avatarUrl: string | null;
};

const initialState: AvatarFormState = { successRevision: 0 };

export function ProfileAvatar({
  displayName,
  avatarUrl,
}: ProfileAvatarProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [displayedAvatarUrl, setDisplayedAvatarUrl] = useState(avatarUrl);
  const [toast, setToast] = useState<{
    revision: number;
    message: string;
    tone: "success" | "error";
  }>({ revision: 0, message: "", tone: "success" });
  const initial = displayName.trim().charAt(0).toUpperCase();
  const handleSuccess = useCallback(
    (message: string, updatedAvatarUrl: string | null) => {
      setModalOpen(false);
      setDisplayedAvatarUrl(updatedAvatarUrl);
      setToast((current) => ({
        revision: current.revision + 1,
        message,
        tone: "success",
      }));
    },
    [],
  );
  const handleError = useCallback((message: string) => {
    setModalOpen(false);
    setToast((current) => ({
      revision: current.revision + 1,
      message,
      tone: "error",
    }));
  }, []);

  useEffect(() => {
    setDisplayedAvatarUrl(avatarUrl);
  }, [avatarUrl]);

  return (
    <>
      <UnstyledButton
        onClick={() => setModalOpen(true)}
        aria-label="Change profile photo"
        className="group relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-4xl font-bold text-primary ring-8 ring-white focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-primary sm:h-32 sm:w-32"
      >
        {displayedAvatarUrl ? (
          <Image
            src={displayedAvatarUrl}
            alt={`${displayName}'s avatar`}
            fill
            unoptimized
            sizes="128px"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <span aria-hidden="true">{initial}</span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-slate-950/0 text-sm font-semibold text-white opacity-0 transition-[background-color,opacity] duration-200 group-hover:bg-slate-950/55 group-hover:opacity-100 group-focus-visible:bg-slate-950/55 group-focus-visible:opacity-100">
          Change photo
        </span>
      </UnstyledButton>

      {modalOpen ? (
        <AvatarActionsModal
          hasAvatar={displayedAvatarUrl !== null}
          onClose={() => setModalOpen(false)}
          onError={handleError}
          onSuccess={handleSuccess}
        />
      ) : null}

      {toast.message ? (
        toast.tone === "success" ? (
          <SuccessToast key={toast.revision} message={toast.message} />
        ) : (
          <ErrorToast key={toast.revision} message={toast.message} />
        )
      ) : null}
    </>
  );
}

function AvatarActionsModal({
  hasAvatar,
  onClose,
  onError,
  onSuccess,
}: {
  hasAvatar: boolean;
  onClose: () => void;
  onError: (message: string) => void;
  onSuccess: (
    message: string,
    avatarUrl: string | null,
  ) => void;
}) {
  const uploadFormRef = useRef<HTMLFormElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [state, formAction, pending] = useActionState(
    updateAvatarAction,
    initialState,
  );

  useEffect(() => {
    if (state.successRevision > 0 && state.successMessage) {
      onSuccess(state.successMessage, state.avatarUrl ?? null);
    }
  }, [
    onSuccess,
    state.avatarUrl,
    state.successMessage,
    state.successRevision,
  ]);

  useEffect(() => {
    if (state.formError) {
      onError(state.formError);
    }
  }, [onError, state.formError]);

  return (
    <Modal title="Change profile photo" onClose={onClose}>
      <div className="space-y-3 p-5 sm:p-6">
        <form
          ref={uploadFormRef}
          action={formAction}
          className="space-y-2"
        >
          <input
            ref={avatarInputRef}
            type="file"
            name="avatar"
            accept="image/png,image/jpeg,image/webp"
            disabled={pending}
            aria-invalid={state.fieldError ? true : undefined}
            aria-describedby={
              state.fieldError ? "avatar-action-error" : "avatar-action-help"
            }
            className="sr-only"
            onChange={(event) => {
              if (event.currentTarget.files?.length) {
                uploadFormRef.current?.requestSubmit();
              }
            }}
          />
          <SecondaryButton
            onClick={() => avatarInputRef.current?.click()}
            disabled={pending}
            aria-describedby={
              state.fieldError ? "avatar-action-error" : "avatar-action-help"
            }
            className="min-h-14 w-full disabled:cursor-wait"
          >
            {pending ? "Saving..." : "Upload photo"}
          </SecondaryButton>

          {state.fieldError ? (
            <p
              id="avatar-action-error"
              role="alert"
              className="text-center text-sm text-danger"
            >
              {state.fieldError}
            </p>
          ) : (
            <p
              id="avatar-action-help"
              className="text-center text-xs text-subtle"
            >
              PNG, JPEG, or WebP up to 256 KB.
            </p>
          )}
        </form>

        {hasAvatar ? (
          <form action={formAction}>
            <input type="hidden" name="removeAvatar" value="true" />
            <DangerButton
              type="submit"
              disabled={pending}
              className="min-h-14 w-full disabled:cursor-wait"
            >
              Remove current photo
            </DangerButton>
          </form>
        ) : null}

        <SecondaryButton
          onClick={onClose}
          disabled={pending}
          className="min-h-14 w-full disabled:cursor-wait"
        >
          Cancel
        </SecondaryButton>
      </div>
    </Modal>
  );
}
