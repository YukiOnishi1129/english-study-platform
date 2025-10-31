export const CONTENT_TYPE_CODES = [
  "vocabulary",
  "phrase",
  "conversation",
  "listening",
  "writing",
] as const;

export type ContentTypeCode = (typeof CONTENT_TYPE_CODES)[number];

export function isContentTypeCode(value: string): value is ContentTypeCode {
  return (CONTENT_TYPE_CODES as readonly string[]).includes(value);
}

