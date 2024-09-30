import { PanelHeader } from "./PanelHeader";
import { Box } from "@mui/material";

interface PanelBaseProps {
  children: React.ReactNode;
  title: string;
  body: string;
  icon?: string;
}
export const PanelBase: React.FC<PanelBaseProps> = ({ children, title, body, icon }) => {
  return (
    <Box
      component="div"
      className={"PanelBase"}
      flexDirection="column"
      display="flex"
      width="100%"
      marginTop="20px"
      marginLeft="5px"
      overflow="hidden"
      gap="2"
    >
      <PanelHeader title={title} body={body} icon={icon} />
      <Box
        component="div"
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          // Ensure padding at the bottom for better UX when scrolling
          paddingBottom: "50px",
        }}
      >
        {/* // should make sure there is scrolling on this child */}
        {children}
      </Box>
    </Box>
  );
};
