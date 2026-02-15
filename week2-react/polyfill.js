import { webcrypto } from 'node:crypto';

// Polyfill global crypto if it's missing or incomplete
if (!globalThis.crypto) {
    // @ts-ignore
    globalThis.crypto = webcrypto;
} else if (!globalThis.crypto.getRandomValues) {
    // @ts-ignore
    globalThis.crypto.getRandomValues = webcrypto.getRandomValues.bind(webcrypto);
}
