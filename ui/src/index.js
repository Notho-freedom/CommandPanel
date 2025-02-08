// src/index.js
import React from 'react';
import './index.css';  // inclut le CSS global si nécessaire
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container); 
root.render(<App />);