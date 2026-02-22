export async function compressString(
  value: string
): Promise<Uint8Array | null> {
  if (
    typeof window === 'undefined' ||
    !('CompressionStream' in window)
  )
    return null;
  const encoder = new TextEncoder();
  const encoded = encoder.encode(value);
  const stream = new Blob([encoded.buffer as ArrayBuffer])
    .stream()
    .pipeThrough(new CompressionStream('gzip'));
  const buffer = await new Response(stream).arrayBuffer();
  return new Uint8Array(buffer);
}

export async function decompressToString(
  bytes: Uint8Array
): Promise<string | null> {
  if (
    typeof window === 'undefined' ||
    !('DecompressionStream' in window)
  )
    return null;
  const stream = new Blob([bytes.buffer as ArrayBuffer])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'));
  const buffer = await new Response(stream).arrayBuffer();
  return new TextDecoder().decode(buffer);
}
