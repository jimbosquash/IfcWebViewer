import { PanelHeader } from "./PanelHeader";
import { Box } from "@mui/material";
import Divider from "@mui/material/Divider";

interface PanelBaseProps {
  children: React.ReactNode;
  buttonBar?: React.ReactNode; // this is for action buttons that sit at top and not scroll
  title: string;
  body: string;
  icon?: string;
}
export const PanelBase: React.FC<PanelBaseProps> = ({ children, title, body, buttonBar, icon }) => {
  return (
    <Box
      component="div"
      className={"PanelBase"}
      flexDirection="column"
      display="flex"
      width="100%"
      height='100%'
      marginTop="20px"
      marginLeft="0px"
      overflow="auto"
      gap="2"
    >
      <PanelHeader title={title} body={body} icon={icon} />
      <Divider />

      {buttonBar && buttonBar}
      {buttonBar && <Divider />}
      {/* <Divider textAlign="left">LEFT</Divider> */}


      <Box
        component="div"
        sx={{
          flexGrow: 1,
          flexShrink: 1,
          overflowY: "auto",
          overflowX: "hidden",
          display: "flex",
          flex: "flex-start",
          flexDirection: "column",
          // height: '100%',
          maxHeight: "calc(100vh - 230px)", // Adjust based on layout

          gap: 0,
          // Ensure padding at the bottom for better UX when scrolling
          paddingBottom: "20px",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
