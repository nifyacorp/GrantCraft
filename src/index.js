import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, HashRouter } from 'react-router-dom';
import App from './App';

// Use HashRouter for better compatibility with static site hosts like Netlify
// HashRouter uses URL hashes which don't require server configuration
const AppRouter = process.env.NODE_ENV === 'production' ? HashRouter : Router;

ReactDOM.render(
  <AppRouter>
    <App />
  </AppRouter>,
  document.getElementById('root')
);