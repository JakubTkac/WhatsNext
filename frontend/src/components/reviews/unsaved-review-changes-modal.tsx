import {
  DangerButton,
  SecondaryButton,
} from "@/components/ui/action-button";
import { Modal } from "@/components/ui/modal";

export function UnsavedReviewChangesModal({
  currentMovieTitle,
  nextMovieTitle,
  onCancel,
  onDiscard,
}: {
  currentMovieTitle: string;
  nextMovieTitle?: string;
  onCancel: () => void;
  onDiscard: () => void;
}) {
  return (
    <Modal title="Discard unsaved changes?" onClose={onCancel}>
      <div className="p-5 sm:p-6">
        <p className="text-base leading-7 text-muted">
          Your review of{" "}
          <span className="font-semibold text-foreground">
            &ldquo;{currentMovieTitle}&rdquo;
          </span>{" "}
          has unsaved changes.
        </p>
        <p className="mt-2 text-sm leading-6 text-subtle">
          {nextMovieTitle ? (
            <>
              Discard them and start editing &ldquo;{nextMovieTitle}
              &rdquo;?
            </>
          ) : (
            "Discard them and close the editor?"
          )}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <SecondaryButton
            onClick={onCancel}
            autoFocus
            className="min-h-12 w-full"
          >
            Keep editing
          </SecondaryButton>
          <DangerButton
            onClick={onDiscard}
            className="min-h-12 w-full"
          >
            Discard changes
          </DangerButton>
        </div>
      </div>
    </Modal>
  );
}
