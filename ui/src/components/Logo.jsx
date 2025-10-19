import React from 'react';
import '../styles/Logo.css'; // create this file

export default function Logo() {
  return (
    <div className="logo-container">
      <a
        href="https://www.jimsindia.org/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="/logo.png"
          alt="College Logo"
          className="college-logo"
        />
      </a>
    </div>
  );
}
