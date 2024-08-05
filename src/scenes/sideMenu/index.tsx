import { Typography } from "@mui/material";
import { SidePanelType } from "../../context/TopBarContext";
import { BimSettings } from "./src/BimSettings";
interface sideBarProps {
  type: SidePanelType;
}

export const SideMenu: React.FC<sideBarProps> = ({type}) => {
  const renderContent = () => {
    switch (type) {
      case SidePanelType.SETTINGS:
        return <BimSettings />;
      case SidePanelType.PROFILE:
        return <Typography>Profile Panel</Typography>;
      case SidePanelType.NOTIFICATIONS:
        return <Typography>Notifications Panel</Typography>;
      default:
        return null;
    }
  };

  return (
        <div
          className="sideMenu"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "100vh",
            margin: "0 auto",
            width: "100%",
          }}
        >
          {renderContent()}
        </div>
    );
};
