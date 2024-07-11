import { useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { RefProvider } from '../../context/RefContext';
import Topbar from './topBar';
import * as FRAGS from "@thatopen/fragments";
import { InfoPanelDataProvider } from '../../context/InfoPanelContext';
import { SideMenu } from '../sideMenu';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { IconButton } from '@mui/material';


interface LayoutProps {
  onIfcFileLoad: (fragGroup: FRAGS.FragmentsGroup | undefined) => void;
}

const Layout = ({ onIfcFileLoad } : LayoutProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <RefProvider containerRef={containerRef}>
      <div style={{ display: 'flex', height: '100%', width: "100%" }}>
      <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: isSidebarExpanded ? '250px' : '00px', // Adjust these values as needed
            transition: 'width 0.3s',
            backgroundColor: '#f0f0f0', // Example color, adjust as needed
            position: 'relative', // Make the sidebar the containing block for the button
          }}
        >
          <SideMenu isVisible={isSidebarExpanded} />
          <IconButton 
            onClick={toggleSidebar} 
            style={{ 
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              right: isSidebarExpanded ? '-40px' : '-40px', // Adjust the button's position
              transition: 'right 0.3s',
              width: '40px', 
              height: '40px',
              // backgroundColor: '#ccc', // Example color, adjust as needed
              border: 'none',
              cursor: 'pointer',
            }}
          >
            
            {isSidebarExpanded ? <NavigateBeforeIcon/> : <NavigateNextIcon/>}
          </IconButton>
        </div>
        <div ref={containerRef} className='layoutMain' style={{ flex: 1, padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <InfoPanelDataProvider>
          <Topbar onIfcFileLoad={onIfcFileLoad} />
          <Outlet />
          </InfoPanelDataProvider>
        </div>
      </div>
    </RefProvider>
  );
};

export default Layout;
