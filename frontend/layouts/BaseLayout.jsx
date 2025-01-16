// layouts/BaseLayout.jsx
import React from 'react';

const BaseLayout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      {children}
    </div>
  );
};
