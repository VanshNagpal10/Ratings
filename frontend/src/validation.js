// Client-side mirror of the backend validation rules for instant feedback.

export const NAME_MIN = 20;
export const NAME_MAX = 60;
export const ADDRESS_MAX = 400;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 16;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function nameError(name) {
  const v = (name || '').trim();
  if (v.length < NAME_MIN) return `Name must be at least ${NAME_MIN} characters.`;
  if (v.length > NAME_MAX) return `Name must be at most ${NAME_MAX} characters.`;
  return '';
}

export function emailError(email) {
  if (!EMAIL_RE.test(email || '')) return 'Please enter a valid email address.';
  return '';
}

export function addressError(address) {
  const v = address || '';
  if (v.trim().length === 0) return 'Address is required.';
  if (v.length > ADDRESS_MAX) return `Address must be at most ${ADDRESS_MAX} characters.`;
  return '';
}

export function passwordError(password) {
  const v = password || '';
  if (v.length < PASSWORD_MIN || v.length > PASSWORD_MAX)
    return `Password must be ${PASSWORD_MIN}-${PASSWORD_MAX} characters.`;
  if (!/[A-Z]/.test(v)) return 'Password must include at least one uppercase letter.';
  if (!/[^A-Za-z0-9]/.test(v)) return 'Password must include at least one special character.';
  return '';
}
