import { Box } from "@mui/material";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }
  
  export const CustomTabPanel: React.FC<TabPanelProps> = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        style={{ height: "92%", width: "100%" }}
        {...other}
      >
        {value === index && (
          <Box component={"div"} sx={{ p: 0, height: "100%", width:'100%', overflow: "clip", flexGrow: 1 }}>
            {children}
          </Box>
        )}
      </div>
    );
  }

  export default CustomTabPanel;