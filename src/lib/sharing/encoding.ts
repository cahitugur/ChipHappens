export function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function fromBase64Url(str: string): Uint8Array {
  const normalized = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(
    Math.ceil(normalized.length / 4) * 4,
    '='
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
