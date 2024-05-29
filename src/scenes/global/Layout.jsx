import React from 'react';
import Topbar from "./topBar"
import { Outlet } from 'react-router-dom';

const Layout = ({ onIfcFileLoad }) => {
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <main style={{ flex: 1, padding: "0" }}>
        <Topbar onIfcFileLoad={onIfcFileLoad} />
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;