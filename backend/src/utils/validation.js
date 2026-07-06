// Shared validation rules. Mirrored on the frontend, enforced here as source of truth.

export const NAME_MIN = 20;
export const NAME_MAX = 60;
export const ADDRESS_MAX = 400;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 16;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// At least one uppercase letter and one special (non-alphanumeric) character.
const PASSWORD_UPPER_RE = /[A-Z]/;
const PASSWORD_SPECIAL_RE = /[^A-Za-z0-9]/;

export function validateName(name) {
  if (typeof name !== 'string' || name.trim().length < NAME_MIN)
    return `Name must be at least ${NAME_MIN} characters.`;
  if (name.trim().length > NAME_MAX)
    return `Name must be at most ${NAME_MAX} characters.`;
  return null;
}

export function validateEmail(email) {
  if (typeof email !== 'string' || !EMAIL_RE.test(email))
    return 'Please provide a valid email address.';
  return null;
}

export function validateAddress(address) {
  if (typeof address !== 'string' || address.trim().length === 0)
    return 'Address is required.';
  if (address.length > ADDRESS_MAX)
    return `Address must be at most ${ADDRESS_MAX} characters.`;
  return null;
}

export function validatePassword(password) {
  if (typeof password !== 'string' || password.length < PASSWORD_MIN || password.length > PASSWORD_MAX)
    return `Password must be ${PASSWORD_MIN}-${PASSWORD_MAX} characters.`;
  if (!PASSWORD_UPPER_RE.test(password))
    return 'Password must include at least one uppercase letter.';
  if (!PASSWORD_SPECIAL_RE.test(password))
    return 'Password must include at least one special character.';
  return null;
}

export function validateRating(rating) {
  const n = Number(rating);
  if (!Number.isInteger(n) || n < 1 || n > 5)
    return 'Rating must be an integer between 1 and 5.';
  return null;
}

// Runs a set of {value, validator} checks and returns the first error found, or null.
export function firstError(checks) {
  for (const err of checks) {
    if (err) return err;
  }
  return null;
}
