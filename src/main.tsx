import '@fontsource-variable/literata/opsz.css'
import '@fontsource-variable/literata/opsz-italic.css'
import 'katex/dist/katex.min.css'
import './styles.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { setupUpdates } from './updates'

// Scroll positions are restored by the app itself (see App.tsx).
window.history.scrollRestoration = 'manual'
// iOS only shows :active styles when a touch listener exists.
document.addEventListener('touchstart', () => {}, { passive: true })

setupUpdates()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
