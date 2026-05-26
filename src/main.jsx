import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import MyChaosPetPrototype from './MyChaosPetPrototype.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MyChaosPetPrototype />
  </React.StrictMode>,
);
