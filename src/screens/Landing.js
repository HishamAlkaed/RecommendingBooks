import React from 'react';
import Header from '../components/Header';

export default function Landing() {
  return (
    <React.Fragment>
      <Header title="Welcome!" />
      <div style={{ height: 'calc(100% - 56px)' }}>
        <img
          alt="welcome to landing"
          src={process.env.PUBLIC_URL + 'SOME_IMAGE'}
          width="100%"
          height="100%"
        />
      </div>
    </React.Fragment>
  );
}
