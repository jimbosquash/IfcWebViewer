import { useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { RefProvider } from '../../context/RefContext';
import Topbar from './topBar';
import * as FRAGS from "@thatopen/fragments";
import { InfoPanelDataProvider } from '../../context/InfoPanelContext';


interface LayoutProps {
  onIfcFileLoad: (fragGroup: FRAGS.FragmentsGroup | undefined) => void;
}

const Layout = ({ onIfcFileLoad } : LayoutProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <RefProvider containerRef={containerRef}>
      <div style={{ display: 'flex', height: '100%' }}>
        <main ref={containerRef} className='layoutMain'  style={{ flex: 1, padding: "0" }}>
        <InfoPanelDataProvider>
          <Topbar onIfcFileLoad={onIfcFileLoad} />
        </InfoPanelDataProvider>
          <Outlet />
        </main>
      </div>
    </RefProvider>
  );
};

export default Layout;
