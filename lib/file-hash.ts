/**
 * File hashing utility that creates a unique hash for file content
 */

// Use Web Crypto API for performant hashing
export async function getFileHash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result;
          if (!content) {
            throw new Error('Failed to read file content');
          }
          
          // Use crypto.subtle for efficient hashing
          const hashBuffer = await crypto.subtle.digest(
            'SHA-256',
            content instanceof ArrayBuffer ? content : new TextEncoder().encode(content as string)
          );
          
          // Convert hash to hex string
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          
          resolve(hashHex);
        } catch (err) {
          reject(new Error(`Failed to generate file hash: ${err instanceof Error ? err.message : 'Unknown error'}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file for hashing'));
      };
      
      // Read file as array buffer for efficient processing
      reader.readAsArrayBuffer(file);
      
    } catch (err) {
      reject(new Error(`File hashing failed: ${err instanceof Error ? err.message : 'Unknown error'}`));
    }
  });
}
