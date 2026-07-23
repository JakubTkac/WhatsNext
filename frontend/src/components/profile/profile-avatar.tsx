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
  const [toast, setToast] = useState<{
    revision: number;
    message: string;
    tone: "success" | "error";
  }>({ revision: 0, message: "", tone: "success" });
  const initial = displayName.trim().charAt(0).toUpperCase();
  const handleSuccess = useCallback((message: string) => {
    setModalOpen(false);
    setToast((current) => ({
      revision: current.revision + 1,
      message,
      tone: "success",
    }));
  }, []);
  const handleError = useCallback((message: string) => {
    setModalOpen(false);
    setToast((current) => ({
      revision: current.revision + 1,
      message,
      tone: "error",
    }));
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        aria-label="Change profile photo"
        className="group relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-4xl font-bold text-primary ring-8 ring-white focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-primary sm:h-32 sm:w-32"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
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
      </button>

      {modalOpen ? (
        <AvatarActionsModal
          hasAvatar={avatarUrl !== null}
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
  onSuccess: (message: string) => void;
}) {
  const uploadFormRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    updateAvatarAction,
    initialState,
  );

  useEffect(() => {
    if (state.successRevision > 0 && state.successMessage) {
      onSuccess(state.successMessage);
    }
  }, [onSuccess, state.successMessage, state.successRevision]);

  useEffect(() => {
    if (state.formError) {
      onError(state.formError);
    }
  }, [onError, state.formError]);

  return (
    <Modal title="Change profile photo" onClose={onClose}>
      <div className="p-3">
        <form ref={uploadFormRef} action={formAction}>
          <label
            className={`flex min-h-14 cursor-pointer items-center justify-center rounded-2xl px-4 text-sm font-semibold text-primary transition-colors hover:bg-blue-50 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary ${
              pending ? "pointer-events-none opacity-60" : ""
            }`}
          >
            <input
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
            {pending ? "Saving..." : "Upload photo"}
          </label>
        </form>

        {state.fieldError ? (
          <p
            id="avatar-action-error"
            role="alert"
            className="px-4 pb-3 text-center text-sm text-danger"
          >
            {state.fieldError}
          </p>
        ) : (
          <p
            id="avatar-action-help"
            className="px-4 pb-3 text-center text-xs text-subtle"
          >
            PNG, JPEG, or WebP up to 256 KB.
          </p>
        )}

        {hasAvatar ? (
          <form action={formAction} className="border-t border-border">
            <input type="hidden" name="removeAvatar" value="true" />
            <button
              type="submit"
              disabled={pending}
              className="flex min-h-14 w-full items-center justify-center rounded-2xl px-4 text-sm font-semibold text-danger transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger disabled:cursor-wait disabled:opacity-60"
            >
              Remove current photo
            </button>
          </form>
        ) : null}

        <div className="border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="flex min-h-14 w-full items-center justify-center rounded-2xl px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
