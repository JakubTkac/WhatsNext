export const MAX_AVATAR_BYTES = 256 * 1024;
export const MAX_AVATAR_DATA_URL_LENGTH = 350_000;

export const AVATAR_DATA_URL_PATTERN =
  /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/;

export type AvatarImage = {
  contentType: 'image/png' | 'image/jpeg' | 'image/webp';
  bytes: Buffer;
};

export function decodeAvatarDataUrl(value: string): AvatarImage | null {
  const match = AVATAR_DATA_URL_PATTERN.exec(value);

  if (!match) {
    return null;
  }

  const [, mimeSubtype, encodedData] = match;
  const bytes = Buffer.from(encodedData, 'base64');

  if (
    bytes.length === 0 ||
    bytes.length > MAX_AVATAR_BYTES ||
    bytes.toString('base64') !== encodedData
  ) {
    return null;
  }

  if (mimeSubtype === 'png') {
    const isPng =
      bytes.length >= 8 &&
      bytes.subarray(0, 8).equals(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      );

    return isPng ? { contentType: 'image/png', bytes } : null;
  }

  if (mimeSubtype === 'jpeg') {
    const isJpeg =
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff;

    return isJpeg ? { contentType: 'image/jpeg', bytes } : null;
  }

  const isWebp =
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
    bytes.subarray(8, 12).toString('ascii') === 'WEBP';

  return isWebp ? { contentType: 'image/webp', bytes } : null;
}

export function isValidAvatarDataUrl(value: string): boolean {
  return decodeAvatarDataUrl(value) !== null;
}

export function getPublicAvatarUrl(
  userId: string,
  hasAvatar: boolean,
): string | null {
  return hasAvatar ? `/api/users/${userId}/avatar` : null;
}
