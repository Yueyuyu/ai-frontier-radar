import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Landing page section (Tailwind v4 + Motion). Loaded only on the /?landing
// route so the Frontier Intel workspace stays the default view.
function isLandingRoute() {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).has('landing')
}

async function bootstrap() {
  const root = document.getElementById('root')!

  if (isLandingRoute()) {
    const { FoundationHero } = await import('./components/FoundationHero')
    await import('./landing.css')
    createRoot(root).render(
      <StrictMode>
        <FoundationHero />
      </StrictMode>,
    )
    return
  }

  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

bootstrap()
