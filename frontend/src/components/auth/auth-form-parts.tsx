import type { ChangeEventHandler, ReactNode } from "react";
import { ErrorToast } from "@/components/ui/toast";

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
      <label htmlFor={name} className="text-sm font-semibold text-foreground">
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
        className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-subtle focus:border-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] aria-invalid:border-danger aria-invalid:focus:border-danger aria-invalid:focus:shadow-[0_0_0_3px_rgba(220,38,38,0.12)]"
      />
      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function AuthFormError({ message }: { message?: string }) {
  return message ? <ErrorToast title={message} /> : null;
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
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-[background-color,transform] duration-150 hover:-translate-y-px hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:translate-y-0 disabled:opacity-65"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
