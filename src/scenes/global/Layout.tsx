import { useRef } from "react";
import { Outlet } from "react-router-dom";
import { RefProvider } from "../../context/RefContext";
import { InfoPanelDataProvider } from "../../context/InfoPanelContext";

const Layout = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <RefProvider containerRef={containerRef}>
      <div style={{ display: "flex", height: "100%", width: "100%", position: "relative" }}>
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
