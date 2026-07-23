import type { ChangeEventHandler, ReactNode } from "react";
import { PrimaryButton } from "@/components/ui/action-button";
import { ErrorToast } from "@/components/ui/feedback-toast";

type AuthFieldProps = {
  name: "displayName" | "email" | "password";
  label: string;
  type: "email" | "password" | "text";
  autoComplete: string;
  error?: string;
  minLength?: number;
  maxLength?: number;
  placeholder: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

export function AuthField({
  name,
  label,
  type,
  autoComplete,
  error,
  minLength,
  maxLength,
  placeholder,
  value,
  onChange,
}: AuthFieldProps) {
  const errorId = `${name}-error`;

  return (
    <div>
      <label htmlFor={name} className="dense-label mb-0">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        minLength={minLength}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="dense-field mt-1"
      />
      {error ? (
        <p id={errorId} role="alert" className="mt-1 text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function AuthFormError({
  message,
  pending,
}: {
  message?: string;
  pending: boolean;
}) {
  return message && !pending ? <ErrorToast message={message} /> : null;
}

export function AuthSubmitButton({
  pending,
  pendingLabel,
  children,
}: {
  pending: boolean;
  pendingLabel: string;
  children: ReactNode;
}) {
  return (
    <PrimaryButton
      type="submit"
      disabled={pending}
      className="w-full disabled:cursor-wait"
    >
      {pending ? pendingLabel : children}
    </PrimaryButton>
  );
}
