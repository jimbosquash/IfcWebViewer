import React, { createContext, MutableRefObject, useContext, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { RefProvider,RefContext } from '../../context/RefContext';
import Topbar from './topBar';

interface LayoutProps {
  onIfcFileLoad: (file: File) => void;
}

const Layout = ({ onIfcFileLoad } : LayoutProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  // const containerRef = useContext(RefContext);

  const RefContext = createContext<MutableRefObject<HTMLDivElement | null> | null>(null)

  useEffect(() => {
    // console.log("ref provider", containerRef)

  },[containerRef])

  return (
    <RefProvider containerRef={containerRef}>
      <div style={{ display: 'flex', height: '100%' }}>
        <main ref={containerRef} className='layoutMain'  style={{ flex: 1, padding: "0" }}>
          <Topbar onIfcFileLoad={onIfcFileLoad} />
          <Outlet />
        </main>
      </div>
    </RefProvider>
  );
};

export default Layout;
