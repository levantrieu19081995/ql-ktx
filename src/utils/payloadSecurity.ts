export type UnsafePayloadResult = {
  path: string;
  value: string;
};

const UNSAFE_INPUT_PATTERNS = [
  /<\s*\/?\s*[a-z][^>]*>/i,
  /<\s*!\s*(?:doctype|--)/i,
  /\bon[a-z]+\s*=/i,
  /\b(?:javascript|vbscript)\s*:/i,
  /\bdata\s*:\s*text\/html/i,
];

const decodeNumericHtmlEntities = (value: string) => {
  return value
    .replace(/&#x([0-9a-f]+);?/gi, (match, code: string) => {
      const codePoint = Number.parseInt(code, 16);
      return Number.isFinite(codePoint) && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : match;
    })
    .replace(/&#([0-9]+);?/g, (match, code: string) => {
      const codePoint = Number.parseInt(code, 10);
      return Number.isFinite(codePoint) && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : match;
    });
};

const normalizeInput = (value: string) => {
  let normalized = decodeNumericHtmlEntities(value)
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;|&apos;/gi, "'")
    .replace(/&amp;/gi, "&")
    .normalize("NFKC")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");

  if (/%[0-9a-f]{2}/i.test(normalized)) {
    try {
      normalized = decodeURIComponent(normalized);
    } catch {
      // Chuỗi percent-encoding không hợp lệ sẽ được kiểm tra ở dạng ban đầu.
    }
  }

  return normalized;
};

export const isUnsafeInput = (value: string) => {
  const normalized = normalizeInput(value);
  return UNSAFE_INPUT_PATTERNS.some((pattern) => pattern.test(normalized));
};

export const findUnsafePayload = (
  value: unknown,
  path = "data",
  visited = new WeakSet<object>(),
): UnsafePayloadResult | null => {
  if (typeof value === "string") {
    return isUnsafeInput(value) ? { path, value } : null;
  }

  if (value === null || value === undefined || typeof value !== "object") {
    return null;
  }

  if (value instanceof Date) {
    return null;
  }

  if (typeof Blob !== "undefined" && value instanceof Blob) {
    return null;
  }

  if (visited.has(value)) {
    return null;
  }
  visited.add(value);

  if (typeof FormData !== "undefined" && value instanceof FormData) {
    for (const [key, item] of value.entries()) {
      if (typeof item !== "string") continue;

      const result = findUnsafePayload(item, `${path}.${key}`, visited);
      if (result) return result;
    }

    return null;
  }

  if (
    typeof URLSearchParams !== "undefined" &&
    value instanceof URLSearchParams
  ) {
    for (const [key, item] of value.entries()) {
      const result = findUnsafePayload(item, `${path}.${key}`, visited);
      if (result) return result;
    }

    return null;
  }

  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const result = findUnsafePayload(value[index], `${path}[${index}]`, visited);
      if (result) return result;
    }

    return null;
  }

  for (const [key, item] of Object.entries(value)) {
    const result = findUnsafePayload(item, `${path}.${key}`, visited);
    if (result) return result;
  }

  return null;
};

export class UnsafePayloadError extends Error {
  readonly code = "UNSAFE_PAYLOAD";

  constructor(readonly fieldPath: string) {
    super(`Dữ liệu không hợp lệ tại ${fieldPath}`);
    this.name = "UnsafePayloadError";
  }
}

export const isUnsafePayloadError = (
  error: unknown,
): error is UnsafePayloadError => {
  return (
    error instanceof UnsafePayloadError ||
    (typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "UNSAFE_PAYLOAD")
  );
};
