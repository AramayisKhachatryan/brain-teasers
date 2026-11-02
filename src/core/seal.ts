// Seals a phone's push subscription so it can live in the public repo: only the holder of the VAPID private key
// (the Deploy workflow) can open it. ECDH (P-256) with the app's public key, HKDF-SHA-256, then AES-256-GCM.
// Web Crypto only, so the same code runs on the phone (sealing) and in Node (opening). No imports, so Node can
// run it directly from scripts/notify.ts.

export const SEALED_PREFIX = 'teasers-push:'

const INFO = new TextEncoder().encode('brain-teasers push subscription v1')
const EC = { name: 'ECDH', namedCurve: 'P-256' } as const

export function base64urlToBytes(text: string): Uint8Array<ArrayBuffer> {
  const base64 = text.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(text.length / 4) * 4, '=')
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export function bytesToBase64url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function aesKey(shared: ArrayBuffer, usage: 'encrypt' | 'decrypt'): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', shared, 'HKDF', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: INFO },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    [usage],
  )
}

/** `teasers-push:` + base64url(ephemeral public key (65 bytes) | IV (12) | ciphertext and tag). */
export async function sealSubscription(subscriptionJson: string, vapidPublicKey: string): Promise<string> {
  const recipient = await crypto.subtle.importKey('raw', base64urlToBytes(vapidPublicKey), EC, false, [])
  const ephemeral = (await crypto.subtle.generateKey(EC, true, ['deriveBits'])) as CryptoKeyPair
  const shared = await crypto.subtle.deriveBits({ name: 'ECDH', public: recipient }, ephemeral.privateKey, 256)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    await aesKey(shared, 'encrypt'),
    new TextEncoder().encode(subscriptionJson),
  )
  const ephemeralRaw = new Uint8Array(await crypto.subtle.exportKey('raw', ephemeral.publicKey))
  const sealed = new Uint8Array(ephemeralRaw.length + iv.length + ciphertext.byteLength)
  sealed.set(ephemeralRaw, 0)
  sealed.set(iv, ephemeralRaw.length)
  sealed.set(new Uint8Array(ciphertext), ephemeralRaw.length + iv.length)
  return SEALED_PREFIX + bytesToBase64url(sealed)
}

export async function openSubscription(sealed: string, vapidPublicKey: string, vapidPrivateKey: string): Promise<string> {
  if (!sealed.startsWith(SEALED_PREFIX)) throw new Error(`a notification code starts with "${SEALED_PREFIX}"`)
  const bytes = base64urlToBytes(sealed.slice(SEALED_PREFIX.length))
  if (bytes.length < 65 + 12 + 16) throw new Error('the notification code is too short')
  const publicKey = base64urlToBytes(vapidPublicKey)
  const privateKey = await crypto.subtle.importKey(
    'jwk',
    {
      kty: 'EC',
      crv: 'P-256',
      d: vapidPrivateKey,
      x: bytesToBase64url(publicKey.slice(1, 33)),
      y: bytesToBase64url(publicKey.slice(33, 65)),
    },
    EC,
    false,
    ['deriveBits'],
  )
  const ephemeral = await crypto.subtle.importKey('raw', bytes.slice(0, 65), EC, false, [])
  const shared = await crypto.subtle.deriveBits({ name: 'ECDH', public: ephemeral }, privateKey, 256)
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: bytes.slice(65, 77) },
    await aesKey(shared, 'decrypt'),
    bytes.slice(77),
  )
  return new TextDecoder().decode(plaintext)
}
