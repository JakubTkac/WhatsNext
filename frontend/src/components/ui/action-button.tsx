import Link from "next/link";
import type {
  ComponentProps,
  ComponentPropsWithoutRef,
} from "react";

const baseClassName =
  "inline-flex min-h-8 items-center justify-center rounded-lg px-2.5 py-1 text-xs font-semibold transition-[background-color,border-color,color,transform] duration-150 enabled:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary sm:min-h-9 sm:px-3";

const primaryClassName =
  "bg-primary text-white shadow-sm hover:-translate-y-px hover:bg-primary-hover disabled:translate-y-0 disabled:opacity-65";

const secondaryClassName =
  "border border-border bg-white text-foreground hover:-translate-y-px hover:border-blue-200 hover:bg-blue-50 hover:text-primary disabled:translate-y-0 disabled:opacity-65";

const ghostClassName =
  "text-foreground hover:bg-blue-50 hover:text-primary disabled:opacity-65";

const dangerClassName =
  "border border-red-200 bg-white text-danger hover:-translate-y-px hover:bg-red-50 disabled:translate-y-0 disabled:opacity-65";

const iconClassName =
  "inline-flex shrink-0 items-center justify-center rounded-full text-muted transition-[background-color,color] duration-150 enabled:cursor-pointer hover:bg-blue-50 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60";

const unstyledClassName = "enabled:cursor-pointer";
const linkCursorClassName = "cursor-pointer";

type ButtonProps = ComponentPropsWithoutRef<"button">;
type LinkProps = ComponentProps<typeof Link>;
type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "icon"
  | "unstyled";
type ActionButtonProps = ButtonProps & {
  variant?: ButtonVariant;
};

export function ActionButton({
  className,
  type = "button",
  variant = "primary",
  ...props
}: ActionButtonProps) {
  return (
    <button
      type={type}
      className={joinClassNames(getButtonClassName(variant), className)}
      {...props}
    />
  );
}

export function PrimaryButton(props: ButtonProps) {
  return <ActionButton variant="primary" {...props} />;
}

export function SecondaryButton(props: ButtonProps) {
  return <ActionButton variant="secondary" {...props} />;
}

export function GhostButton(props: ButtonProps) {
  return <ActionButton variant="ghost" {...props} />;
}

export function DangerButton(props: ButtonProps) {
  return <ActionButton variant="danger" {...props} />;
}

export function IconButton(props: ButtonProps) {
  return <ActionButton variant="icon" {...props} />;
}

export function UnstyledButton(props: ButtonProps) {
  return <ActionButton variant="unstyled" {...props} />;
}

export function PrimaryButtonLink({ className, ...props }: LinkProps) {
  return (
    <Link
      className={joinClassNames(
        baseClassName,
        primaryClassName,
        linkCursorClassName,
        className,
      )}
      {...props}
    />
  );
}

export function GhostButtonLink({ className, ...props }: LinkProps) {
  return (
    <Link
      className={joinClassNames(
        baseClassName,
        ghostClassName,
        linkCursorClassName,
        className,
      )}
      {...props}
    />
  );
}

export function SecondaryButtonLink({ className, ...props }: LinkProps) {
  return (
    <Link
      className={joinClassNames(
        baseClassName,
        secondaryClassName,
        linkCursorClassName,
        className,
      )}
      {...props}
    />
  );
}

function joinClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

function getButtonClassName(variant: ButtonVariant): string | undefined {
  switch (variant) {
    case "primary":
      return joinClassNames(baseClassName, primaryClassName);
    case "secondary":
      return joinClassNames(baseClassName, secondaryClassName);
    case "ghost":
      return joinClassNames(baseClassName, ghostClassName);
    case "danger":
      return joinClassNames(baseClassName, dangerClassName);
    case "icon":
      return iconClassName;
    case "unstyled":
      return unstyledClassName;
  }
}
