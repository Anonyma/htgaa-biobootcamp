import { webcrypto } from 'node:crypto';

console.log('🔒 Checking Crypto Environment...');

try {
    if (typeof globalThis.crypto === 'undefined') {
        Object.defineProperty(globalThis, 'crypto', {
            value: webcrypto,
            configurable: true,
            enumerable: true,
            writable: true
        });
        console.log('✅ Crypto Defined.');
    } else if (!globalThis.crypto.getRandomValues) {
        // If it exists but is incomplete, we have to be careful since it might be read-only
        console.log('⚠️ Crypto exists but lacks getRandomValues. Attempting to patch...');
        try {
            globalThis.crypto.getRandomValues = webcrypto.getRandomValues.bind(webcrypto);
        } catch (e) {
            console.log('❌ Could not patch read-only crypto. Trying internal override...');
            // Last resort: override the whole object if possible, or ignore and hope Vite picks it up from modules
        }
    } else {
        console.log('✅ Crypto and getRandomValues already present.');
    }
} catch (err) {
    console.log('⚠️ Crypto setup warning:', err.message);
}

console.log('🚀 Starting Vite...');
import('./node_modules/vite/bin/vite.js');