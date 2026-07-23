export type AuthFieldErrors = {
  displayName?: string;
  email?: string;
  password?: string;
};

export type AuthFormState = {
  fieldErrors?: AuthFieldErrors;
  formError?: string;
};
