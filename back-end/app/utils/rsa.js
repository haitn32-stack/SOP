import {constants, generateKeyPairSync, privateDecrypt} from 'crypto';

// Generate an in-memory RSA keypair on server start
const {publicKey, privateKey} = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {type: 'spki', format: 'pem'},
    privateKeyEncoding: {type: 'pkcs8', format: 'pem'}
});

function getPublicKeyPem() {
    return publicKey;
}

function decryptBase64ToUtf8(base64Ciphertext) {
    const buffer = Buffer.from(base64Ciphertext, 'base64');
    const decryptedBuffer = privateDecrypt({
        key: privateKey,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
    }, buffer);
    return decryptedBuffer.toString('utf8');
}

export {
    getPublicKeyPem,
    decryptBase64ToUtf8
};
