"use server";

import { revalidatePath } from "next/cache";
import { getAccessToken } from "@/lib/auth";
import type {
  AvatarFormState,
  ChangePasswordFieldErrors,
  ChangePasswordFormState,
  ProfileFieldErrors,
  ProfileFormState,
} from "@/lib/profile-form";

const apiUrl = process.env.API_URL ?? "http://127.0.0.1:8080/api";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedAvatarTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const maxAvatarBytes = 256 * 1024;

export async function updateProfileAction(
  previousState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const displayName = readString(formData, "displayName").trim();
  const email = readString(formData, "email").trim().toLowerCase();
  const bio = readString(formData, "bio").trim();
  const fieldErrors = validateProfile(displayName, email, bio);

  if (Object.keys(fieldErrors).length > 0) {
    return { successRevision: previousState.successRevision, fieldErrors };
  }

  const accessToken = await getAccessToken();

  if (!accessToken) {
    return {
      successRevision: previousState.successRevision,
      formError: "Your session has expired. Please log in again.",
    };
  }

  try {
    const response = await fetch(`${apiUrl}/users/me`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        displayName,
        email,
        bio: bio || null,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });

    const payload: unknown = await response.json();

    if (response.status === 401 || response.status === 403) {
      return {
        successRevision: previousState.successRevision,
        formError: "Your session has expired. Please log in again.",
      };
    }

    if (!response.ok) {
      return {
        successRevision: previousState.successRevision,
        formError: readApiError(payload, "We could not update your profile."),
      };
    }

    revalidatePath("/");
    revalidatePath("/profile");
    return {
      successRevision: previousState.successRevision + 1,
      successMessage: "Profile updated.",
    };
  } catch {
    return {
      successRevision: previousState.successRevision,
      formError: "The profile service is unavailable. Please try again.",
    };
  }
}

export async function updateAvatarAction(
  previousState: AvatarFormState,
  formData: FormData,
): Promise<AvatarFormState> {
  const avatar = formData.get("avatar");
  const removeAvatar = formData.get("removeAvatar") === "true";
  const fieldError = validateAvatar(avatar, removeAvatar);

  if (fieldError) {
    return {
      successRevision: previousState.successRevision,
      fieldError,
    };
  }

  const accessToken = await getAccessToken();

  if (!accessToken) {
    return {
      successRevision: previousState.successRevision,
      formError: "Your session has expired. Please log in again.",
    };
  }

  try {
    const avatarDataUrl = await resolveAvatarDataUrl(avatar, removeAvatar);
    const response = await fetch(`${apiUrl}/users/me`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ avatarDataUrl }),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });

    if (response.status === 401 || response.status === 403) {
      return {
        successRevision: previousState.successRevision,
        formError: "Your session has expired. Please log in again.",
      };
    }

    if (!response.ok) {
      const payload: unknown = await response.json().catch(() => null);
      return {
        successRevision: previousState.successRevision,
        formError: readApiError(payload, "We could not update your avatar."),
      };
    }

    revalidatePath("/");
    revalidatePath("/profile");
    return {
      successRevision: previousState.successRevision + 1,
      successMessage: removeAvatar ? "Avatar removed." : "Avatar updated.",
    };
  } catch {
    return {
      successRevision: previousState.successRevision,
      formError: "The profile service is unavailable. Please try again.",
    };
  }
}

export async function changePasswordAction(
  previousState: ChangePasswordFormState,
  formData: FormData,
): Promise<ChangePasswordFormState> {
  const currentPassword = readString(formData, "currentPassword");
  const newPassword = readString(formData, "newPassword");
  const confirmPassword = readString(formData, "confirmPassword");
  const fieldErrors = validatePasswordChange(
    currentPassword,
    newPassword,
    confirmPassword,
  );

  if (Object.keys(fieldErrors).length > 0) {
    return { successRevision: previousState.successRevision, fieldErrors };
  }

  const accessToken = await getAccessToken();

  if (!accessToken) {
    return {
      successRevision: previousState.successRevision,
      formError: "Your session has expired. Please log in again.",
    };
  }

  try {
    const response = await fetch(`${apiUrl}/auth/password`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ currentPassword, newPassword }),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });

    if (response.status === 401 || response.status === 403) {
      return {
        successRevision: previousState.successRevision,
        formError: "Your session has expired. Please log in again.",
      };
    }

    if (!response.ok) {
      const payload: unknown = await response.json().catch(() => null);
      const message = readApiError(
        payload,
        "We could not change your password.",
      );
      const apiFieldErrors = mapPasswordApiFieldErrors(
        response.status,
        message,
      );

      if (apiFieldErrors) {
        return {
          successRevision: previousState.successRevision,
          fieldErrors: apiFieldErrors,
        };
      }

      return {
        successRevision: previousState.successRevision,
        formError: message,
      };
    }

    return {
      successRevision: previousState.successRevision + 1,
      successMessage: "Password changed.",
    };
  } catch {
    return {
      successRevision: previousState.successRevision,
      formError: "The authentication service is unavailable. Please try again.",
    };
  }
}

function validateProfile(
  displayName: string,
  email: string,
  bio: string,
): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {};

  if (displayName.length < 2 || displayName.length > 100) {
    errors.displayName = "Display name must contain 2 to 100 characters.";
  }

  if (email.length > 254 || !emailPattern.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (bio.length > 500) {
    errors.bio = "Bio cannot exceed 500 characters.";
  }

  return errors;
}

function validateAvatar(
  avatar: FormDataEntryValue | null,
  removeAvatar: boolean,
): string | undefined {
  if (removeAvatar) {
    return undefined;
  }

  if (!(avatar instanceof File) || avatar.size === 0) {
    return "Choose an image to upload.";
  }

  if (!allowedAvatarTypes.has(avatar.type)) {
    return "Choose a PNG, JPEG, or WebP image.";
  }

  if (avatar.size > maxAvatarBytes) {
    return "Avatar must be 256 KB or smaller.";
  }

  return undefined;
}

function validatePasswordChange(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): ChangePasswordFieldErrors {
  const errors: ChangePasswordFieldErrors = {};
  const currentPasswordLength = byteLength(currentPassword);
  const newPasswordLength = byteLength(newPassword);

  if (currentPasswordLength < 1 || currentPasswordLength > 72) {
    errors.currentPassword = "Enter your current password.";
  }

  if (
    newPasswordLength < 8 ||
    newPasswordLength > 72 ||
    !/[A-Za-z]/.test(newPassword) ||
    !/\d/.test(newPassword)
  ) {
    errors.newPassword =
      "Password must be 8 to 72 bytes and contain a letter and a number.";
  } else if (newPassword === currentPassword) {
    errors.newPassword = "Choose a password different from your current one.";
  }

  if (confirmPassword !== newPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

function mapPasswordApiFieldErrors(
  status: number,
  message: string,
): ChangePasswordFieldErrors | undefined {
  if (status !== 400) {
    return undefined;
  }

  if (message === "Current password is incorrect.") {
    return { currentPassword: message };
  }

  if (message === "New password must be different from the current password.") {
    return { newPassword: message };
  }

  return undefined;
}

async function resolveAvatarDataUrl(
  avatar: FormDataEntryValue | null,
  removeAvatar: boolean,
): Promise<string | null> {
  if (removeAvatar) {
    return null;
  }

  if (!(avatar instanceof File) || avatar.size === 0) {
    throw new Error("Avatar file is missing.");
  }

  const encoded = Buffer.from(await avatar.arrayBuffer()).toString("base64");
  return `data:${avatar.type};base64,${encoded}`;
}

function readString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

function readApiError(value: unknown, fallback: string): string {
  if (!isRecord(value)) {
    return fallback;
  }

  if (typeof value.message === "string") {
    return value.message.slice(0, 240);
  }

  if (Array.isArray(value.message)) {
    return value.message
      .filter((message): message is string => typeof message === "string")
      .join(" ")
      .slice(0, 240);
  }

  return fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
