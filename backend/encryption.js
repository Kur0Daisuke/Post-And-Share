const crypto = require('crypto').webcrypto;

function bufToHex(buffer) {
  // 1. Convert the buffer into a standard Array
  return Array.from(new Uint8Array(buffer))
    // 2. Turn every number into a base-16 (hex) string
    .map(byte => byte.toString(16).padStart(2, '0'))
    // 3. Join them into one long string
    .join('');
}

async function deriveKeyFromPassword(password, salt) {
    const encoder = new TextEncoder();
    
    // 1. Import the raw password as a "base key"
    const baseKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
    );

    // 2. Derive the actual AES key from the base key
    let hashbuffer = await crypto.subtle.deriveBits(
        {
        name: "PBKDF2",
        salt: salt,
        iterations: 600000,
        hash: "SHA-256"
        },
        baseKey, // The imported password
        256
    );
    return bufToHex(new Uint8Array(hashbuffer))
}

// --- Practical Usage ---
async function setup(password) {
    // Generate a random 16-byte salt (Store this alongside your encrypted data!)
    const salt = crypto.getRandomValues(new Uint8Array(16));

    const mySecureKey = await deriveKeyFromPassword(password, salt);
    return {
        salt: bufToHex(salt),
        hash: mySecureKey
    }
}

module.exports = {
    bufToHex,
    deriveKeyFromPassword,
    setup
}