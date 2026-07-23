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
      <div className="p-3 sm:p-4">
        <p className="text-sm leading-5 text-muted">
          Your review of{" "}
          <span className="font-semibold text-foreground">
            &ldquo;{currentMovieTitle}&rdquo;
          </span>{" "}
          has unsaved changes.
        </p>
        <p className="mt-1 text-xs leading-5 text-subtle">
          {nextMovieTitle ? (
            <>
              Discard them and start editing &ldquo;{nextMovieTitle}
              &rdquo;?
            </>
          ) : (
            "Discard them and close the editor?"
          )}
        </p>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <SecondaryButton
            onClick={onCancel}
            autoFocus
            className="min-h-8 w-full"
          >
            Keep editing
          </SecondaryButton>
          <DangerButton
            onClick={onDiscard}
            className="min-h-8 w-full"
          >
            Discard changes
          </DangerButton>
        </div>
      </div>
    </Modal>
  );
}
