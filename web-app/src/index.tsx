import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import { StrictMode } from 'react'

import App from './app'

document.body.innerHTML = `<div id='react-app'></div>`
const root = createRoot(document.getElementById('react-app')!)
root.render(<StrictMode><App /></StrictMode>)
