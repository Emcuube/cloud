import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// chart.js auto-registration so react-chartjs-2 components render correctly
// without manually registering controllers/scales in each chart file.
import 'chart.js/auto';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)