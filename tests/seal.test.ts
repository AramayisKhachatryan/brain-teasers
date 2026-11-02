import webpush from 'web-push'
import { describe, expect, it } from 'vitest'
import { SEALED_PREFIX, openSubscription, sealSubscription } from '../src/core/seal'

const keys = webpush.generateVAPIDKeys()
const subscription = JSON.stringify({
  endpoint: 'https://web.push.apple.com/QGexample',
  keys: { p256dh: 'BExampleKey', auth: 'exampleAuth' },
})

describe('sealed notification codes', () => {
  it('opens what a phone sealed, with the matching private key', async () => {
    const sealed = await sealSubscription(subscription, keys.publicKey)
    expect(sealed.startsWith(SEALED_PREFIX)).toBe(true)
    expect(sealed).not.toContain('web.push.apple.com')
    expect(await openSubscription(sealed, keys.publicKey, keys.privateKey)).toBe(subscription)
  })

  it('seals differently every time', async () => {
    expect(await sealSubscription(subscription, keys.publicKey)).not.toBe(await sealSubscription(subscription, keys.publicKey))
  })

  it("can't be opened with another key", async () => {
    const other = webpush.generateVAPIDKeys()
    const sealed = await sealSubscription(subscription, keys.publicKey)
    await expect(openSubscription(sealed, other.publicKey, other.privateKey)).rejects.toThrow()
  })

  it('rejects text that is not a code', async () => {
    await expect(openSubscription('hello', keys.publicKey, keys.privateKey)).rejects.toThrow(/starts with/)
    await expect(openSubscription(`${SEALED_PREFIX}abc`, keys.publicKey, keys.privateKey)).rejects.toThrow(/too short/)
  })
})
