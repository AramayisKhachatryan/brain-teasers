// The app's public key for push notifications (VAPID). Its private half is the GitHub secret VAPID_PRIVATE_KEY,
// which only the Deploy workflow uses (scripts/notify.ts). Changing this key means every phone must turn
// notifications on again.
export const VAPID_PUBLIC_KEY = 'BGWjlrY8y8UPmresAVPpBwRbZWtBm1Mg4ujpoDpPXIhxyPVWMokgmWeP4LM62h6pMh5BSCAvj4BnjXDEATo3v0E'

/**
 * Whether phones are offered notifications (the card on Home). Off until setup: a new key pair, with this public key
 * replaced and the private key in the VAPID_PRIVATE_KEY secret (see CLAUDE.md). Codes made before that would be useless.
 */
export const NOTIFICATIONS_READY = false
