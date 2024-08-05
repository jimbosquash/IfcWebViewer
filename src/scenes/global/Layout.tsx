import { useContext, useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { RefProvider } from "../../context/RefContext";
import { InfoPanelDataProvider } from "../../context/InfoPanelContext";
import { SideMenu } from "../sideMenu";
import { useComponentsContext } from "../../context/ComponentsContext";
import { ModelCache } from "../../bim-components/modelCache";
import { useTopBarContext } from "../../context/TopBarContext";
import { AnimatePresence, motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';


const Layout = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const components = useComponentsContext();
  const { sidePanelType, isSidePanelVisible,toggleSidePanel } = useTopBarContext();
  const [showHoverArrow, setShowHoverArrow] = useState(false);



  useEffect(() => {
    if (!components) return;

    const viewManager = components.get(ModelCache);
    viewManager.onModelAdded.add(() => toggleSidePanel(false));

    return () => {
      viewManager.onModelAdded.remove(() => toggleSidePanel(false));
    };
  }, [components]);


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientX < 20 && !isSidePanelVisible) {
        setShowHoverArrow(true);
      } else {
        setShowHoverArrow(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isSidePanelVisible]);

  
  return (
    <RefProvider containerRef={containerRef}>
      <div style={{ display: "flex", height: "100%", width: "100%", position: "relative" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: isSidePanelVisible ? 250 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f0f0f0",
            position: "relative",
            zIndex: 2,
            overflow: "hidden",
          }}
        >
          {isSidePanelVisible && <SideMenu type={sidePanelType} />}
        </motion.div>

        <AnimatePresence>
          {(isSidePanelVisible || showHoverArrow) && (
            <motion.button
              initial={{ x: isSidePanelVisible ? 250 : -40, opacity: isSidePanelVisible ? 1 : 0 }}
              animate={{ x: isSidePanelVisible ? 250 : 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => toggleSidePanel(!isSidePanelVisible)}
              style={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'white',
                padding: '8px',
                borderRadius: '0 4px 4px 0',
                boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                zIndex: 3,
              }}
            >
              {isSidePanelVisible ? <FaChevronLeft /> : <FaChevronRight />}
            </motion.button>
          )}
        </AnimatePresence>

        <div
          ref={containerRef}
          className="layoutMain"
          style={{
            flex: 1,
            padding: "0",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 1,
          }}
        >
          <InfoPanelDataProvider>
            <Outlet />
          </InfoPanelDataProvider>
        </div>
      </div>
    </RefProvider>
  );
};

export default Layout;
