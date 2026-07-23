export type ReviewFieldErrors = {
  movieSlug?: string;
  rating?: string;
  body?: string;
};

export type ReviewFormState = {
  successRevision: number;
  successMessage?: string;
  formError?: string;
  fieldErrors?: ReviewFieldErrors;
};
