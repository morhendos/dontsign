/**
 * MurmurHash3 implementation - simple and fast hashing for non-cryptographic use
 */
function murmur3_32(key: string, seed = 0): number {
  let h1 = seed;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;

  // Process key in chunks of 4 bytes
  for (let i = 0; i < key.length - 3; i += 4) {
    let k1 = ((key.charCodeAt(i) & 0xff)) |
      ((key.charCodeAt(i + 1) & 0xff) << 8) |
      ((key.charCodeAt(i + 2) & 0xff) << 16) |
      ((key.charCodeAt(i + 3) & 0xff) << 24);

    k1 = Math.imul(k1, c1);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, c2);

    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1 = Math.imul(h1, 5) + 0xe6546b64;
  }

  // Handle remaining bytes
  let k1 = 0;
  const rem = key.length & 3;
  if (rem >= 3) k1 ^= (key.charCodeAt(key.length - 3) & 0xff) << 16;
  if (rem >= 2) k1 ^= (key.charCodeAt(key.length - 2) & 0xff) << 8;
  if (rem >= 1) {
    k1 ^= (key.charCodeAt(key.length - 1) & 0xff);
    k1 = Math.imul(k1, c1);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, c2);
    h1 ^= k1;
  }

  // Finalization
  h1 ^= key.length;
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x85ebca6b);
  h1 ^= h1 >>> 13;
  h1 = Math.imul(h1, 0xc2b2ae35);
  h1 ^= h1 >>> 16;

  return h1 >>> 0;
}

/**
 * Generates a hash from file content
 * @param file File to hash
 * @returns Promise resolving to hash string
 */
export async function generateFileHash(file: File): Promise<string> {
  // Read first 1MB of file for quick comparison
  const CHUNK_SIZE = 1024 * 1024; // 1MB
  const chunk = file.slice(0, CHUNK_SIZE);
  const text = await chunk.text();
  
  // Generate hash and convert to hex string
  const hash = murmur3_32(text);
  return hash.toString(16);
}

/**
 * Checks if a file matches an existing hash
 * @param file File to check
 * @param existingHash Hash to compare against
 * @returns Promise resolving to boolean indicating match
 */
export async function isFileMatchingHash(file: File, existingHash: string): Promise<boolean> {
  const newHash = await generateFileHash(file);
  return newHash === existingHash;
}