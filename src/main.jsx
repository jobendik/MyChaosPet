import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Note: StrictMode is intentionally omitted. The game relies on imperative,
// stateful subsystems (Web Audio scheduler, requestAnimationFrame particle
// loop) that would be double-invoked under StrictMode's dev remount.
createRoot(document.getElementById('root')).render(<App />);
