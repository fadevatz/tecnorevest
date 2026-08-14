import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { observability } from './services/observability.js'

// Inicializar stack de Observabilidade (Sentry, Datadog RUM, New Relic, OpenTelemetry)
observability.init();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
