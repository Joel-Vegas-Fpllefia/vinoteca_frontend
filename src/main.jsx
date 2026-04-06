import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'  
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'

// Seleccionamos el elemento 'root' de tu index.html
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

// Renderizamos la aplicación
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
)