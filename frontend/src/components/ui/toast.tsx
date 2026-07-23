type ToastProps = {
  title: string;
  children?: React.ReactNode;
};

export function SuccessToast({ title, children }: ToastProps) {
  return (
    <ToastFrame title={title} borderClassName="border-l-success" role="status">
      {children}
    </ToastFrame>
  );
}

export function ErrorToast({ title, children }: ToastProps) {
  return (
    <ToastFrame title={title} borderClassName="border-l-danger" role="alert">
      {children}
    </ToastFrame>
  );
}

export function InfoToast({ title, children }: ToastProps) {
  return (
    <ToastFrame title={title} borderClassName="border-l-primary" role="status">
      {children}
    </ToastFrame>
  );
}

function ToastFrame({
  title,
  children,
  borderClassName,
  role,
}: ToastProps & {
  borderClassName: string;
  role: "alert" | "status";
}) {
  return (
    <div
      role={role}
      className={`w-full max-w-sm border border-l-4 border-border bg-white p-4 shadow-md ${borderClassName}`}
    >
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {children ? (
        <div className="mt-1 text-sm leading-6 text-muted">{children}</div>
      ) : null}
    </div>
  );
}
