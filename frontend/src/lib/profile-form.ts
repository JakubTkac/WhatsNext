export type ProfileFieldErrors = {
  displayName?: string;
  email?: string;
  bio?: string;
};

export type ProfileFormState = {
  successRevision: number;
  fieldErrors?: ProfileFieldErrors;
  formError?: string;
  successMessage?: string;
};

export type AvatarFormState = {
  successRevision: number;
  fieldError?: string;
  formError?: string;
  successMessage?: string;
};

export type ChangePasswordFieldErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export type ChangePasswordFormState = {
  successRevision: number;
  fieldErrors?: ChangePasswordFieldErrors;
  formError?: string;
  successMessage?: string;
};
