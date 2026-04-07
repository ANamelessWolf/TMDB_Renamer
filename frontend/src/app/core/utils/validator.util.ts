const WINDOWS_INVALID_CHARS_RE = /[\\/:*?"<>|]/;
const TRAILING_DOT_OR_SPACE = /[. ]$/;
const RESERVED_NAMES = new Set([
  'CON', 'PRN', 'AUX', 'NUL',
  'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9',
]);

/**
 * Validates a string as a safe Windows filename component (title portion only).
 * Returns null if valid, or an error message string.
 */
export function validateWindowsTitle(value: string): string | null {
  if (!value || !value.trim()) {
    return 'Title cannot be empty';
  }

  if (WINDOWS_INVALID_CHARS_RE.test(value)) {
    return 'Title contains invalid characters: \\ / : * ? " < > |';
  }

  if (TRAILING_DOT_OR_SPACE.test(value)) {
    return 'Title cannot end with a period or space';
  }

  const upper = value.trim().toUpperCase();
  if (RESERVED_NAMES.has(upper)) {
    return `"${value}" is a reserved Windows filename`;
  }

  if (value.length > 200) {
    return 'Title is too long (max 200 characters)';
  }

  return null;
}
