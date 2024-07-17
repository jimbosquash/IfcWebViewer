import { useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { RefProvider } from "../../context/RefContext";
import Topbar from "./topBar";
import * as FRAGS from "@thatopen/fragments";
import { InfoPanelDataProvider } from "../../context/InfoPanelContext";
import { SideMenu } from "../sideMenu";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { IconButton } from "@mui/material";

const Layout = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const toggleSidebar = () => {
    console.log('side bar button clicked')
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <RefProvider containerRef={containerRef}>
      <div style={{ display: "flex", height: "100%", width: "100%", position: "relative" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: isSidebarExpanded ? "250px" : "0px",
            transition: "width 0.3s",
            backgroundColor: "#f0f0f0",
            position: "relative",
            zIndex: 2, // Give sidebar a z-index
            overflow: "hidden",
          }}
        >
          <SideMenu isVisible={isSidebarExpanded} />
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: isSidebarExpanded ? "250px" : "0px",
            width: "40px",
            transition: "left 0.3s",
            zIndex: 3, // Higher than sidebar but lower than possible modals
            pointerEvents: "none", // Allow clicks to pass through
          }}
        >
          <IconButton
            onClick={toggleSidebar}
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              transform: "translateY(-50%)",
              width: "40px",
              height: "40px",
              cursor: "pointer",
              pointerEvents: "auto", // Make sure the button itself is clickable
            }}
          >
            {isSidebarExpanded ? <NavigateBeforeIcon /> : <NavigateNextIcon />}
          </IconButton>
        </div>
        <div
          ref={containerRef}
          className="layoutMain"
          style={{
            flex: 1,
            padding: "0",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 1, // Lower than sidebar and button
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
