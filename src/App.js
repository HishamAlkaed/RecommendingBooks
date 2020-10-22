import React from 'react';
import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';

import Routes from './Routes';
// import Footer from './components/Footer';

export default function App() {
  return (
    <Router>
      <div className="App" style={{
        minHeight: '100vh',
        height: '100%',
        // background: '#aba0a0',
    // background: '#90acecd1',
    background: '#e4e4e4d6',
      }}>
        <div style={{ height: 'calc(100% - 56px)' }}>
          <Routes />
        </div>
        {/* <Footer /> */}
      </div>
    </Router>
  );
}
