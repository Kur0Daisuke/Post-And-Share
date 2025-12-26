const { decrypt } = require('dotenv');

const crypto = require('crypto').webcrypto;

function textToBinary(text) {
    return Array.from(new TextEncoder().encode(text))
        .map(byte => byte.toString(2).padStart(8, '0'))
        .join(''); // No spaces for easier math
}

function encryptDecryptAlgorithm(binaryData, binaryKey) {
    let result = "";
    // We only loop up to the length of the data
    for (let i = 0; i < binaryData.length; i++) {
        // XOR logic: if bits are same -> 0, if bits are different -> 1
        result += (binaryData[i] === binaryKey[i]) ? "0" : "1";
    }
    return result;
}

// Ensure key is long enough (1 byte per character)
function GenerateKey(input) {
    let rawKey = new Uint8Array(input.length);
    crypto.getRandomValues(rawKey);
    return Array.from(rawKey).map(b => b.toString(2).padStart(8, '0')).join('');
}


function Encrypt(data, binaryKey) {
    const input = data;
    const binaryInput = textToBinary(input);

    // ENCRYPT
    const cipherBinary = encryptDecryptAlgorithm(binaryInput, binaryKey);
    const hexOutput = cipherBinary.match(/.{1,8}/g)
        .map(bin => parseInt(bin, 2).toString(16).padStart(2, '0'))
        .join('');

    return hexOutput;
}


// DECRYPT
// 1. Hex back to binary
function Decrypt(hexOutput, binaryKey) {
    const recoveredBinary = hexOutput.match(/.{1,2}/g)
    .map(hex => parseInt(hex, 16).toString(2).padStart(8, '0'))
    .join('');

    // 2. Run through same XOR function
    const decryptedBinary = encryptDecryptAlgorithm(recoveredBinary, binaryKey);

    // 3. Binary back to text
    const bytes = new Uint8Array(decryptedBinary.match(/.{1,8}/g).map(bin => parseInt(bin, 2)));
    return new TextDecoder().decode(bytes)
}


module.exports = {
    Encrypt,
    Decrypt,
    GenerateKey
};