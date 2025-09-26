import { VibeKanbanWebCompanion } from 'vibe-kanban-web-companion'
import type { AppProps } from 'next/app'

import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <VibeKanbanWebCompanion />
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
