import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';

import Routes from './Routes';
import Footer from './components/Footer';

export default function App() {
  return (
    <Router>
      <div className="App">
        <div style={{ height: 'calc(100% - 56px)' }}>
          <Routes />
        </div>
        {/* <Footer /> */}
      </div>
    </Router>
  );
}
