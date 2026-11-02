# Notifications

Every phone that turns on notifications in the app (Home → "Turn on notifications") gets a code starting with
`teasers-push:`. The code is the phone's push subscription, sealed with the app's public key
(`src/core/pushKey.ts`): only the `VAPID_PRIVATE_KEY` GitHub secret can open it, so it is safe in this public repo.

`subscriptions.json` lists the codes:

```json
[{ "person": "aramayis", "added": "2026-11-02", "sealed": "teasers-push:…" }]
```

After each deploy, `.github/workflows/deploy.yml` compares the live `teasers.json` with the new one and, if open
teasers were added, runs `scripts/notify.ts` to send "New teaser" to every phone here. A phone that turned
notifications off, or removed the app, shows up as a warning in that run: it needs a new code.
