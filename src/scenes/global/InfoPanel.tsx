import { Box, Typography, useTheme } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import {
  InfoPanelContext,
  InfoPanelProps,
} from "../../context/InfoPanelContext";
import { useModelContext } from "../../context/ModelStateContext";
import { tokens } from "../../theme";

export const InfoPanel = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const modelContext = useModelContext();
  const infoPanelContext = useContext(InfoPanelContext);
  const [infoPanelData, setPanelData] = useState<InfoPanelProps>();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showToolTip, setShowToolTip] = useState<boolean>(false);

  useEffect(() => {
    if (infoPanelContext) setPanelData(infoPanelContext.data);
  }, [infoPanelContext]);

  const infoBoxStyle: React.CSSProperties = {
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    backgroundColor: "{colors.grey[200]}",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "10px",
    padding: "10px",
    zIndex: 1000,
  };

  const subBoxStyle: React.CSSProperties = {
    flex: 1,
    padding: "6px",
    textAlign: "center",
  };

  const subBoxHoveredStyle: React.CSSProperties = {
    backgroundColor: "#f0f0f0", // {colors.grey[200]}
  };

  const subBoxNotLastChildStyle: React.CSSProperties = {
    borderRight: "1px solid #ddd",
  };

  const tooltipStyle: React.CSSProperties = {
    position: "absolute",
    top: "50px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "white",
    border: "1px solid #ddd",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "5px",
    padding: "5px",
    zIndex: 1001,
  };

  return (
    <Box component={"div"} style={infoBoxStyle} width="700px">
      {/* file name */}
      {infoPanelData &&
        Object.entries(infoPanelData).map(([key, value], index) => (
          <div
            key={index}
            style={{
              ...subBoxStyle,
              ...(index !== Object.entries(infoPanelData).length - 1
                ? subBoxNotLastChildStyle
                : {}),
              ...(hoveredIndex === index ? subBoxHoveredStyle : {}),
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={
              index === Object.entries(infoPanelData).length - 1
                ? () => setShowToolTip(!showToolTip)
                : undefined
            }
          >
            {value}
            {index === Object.entries(infoPanelData).length - 1 &&
              showToolTip && (
                <div style={tooltipStyle}>
                  <p>Tooltip Item 1</p>
                  <p>Tooltip Item 2</p>
                  <p>Tooltip Item 3</p>
                </div>
              )}
          </div>
        ))}
      {/* <div style={{ ...subBoxStyle, ...subBoxNotLastChildStyle }}>File name</div> */}
    </Box>
  );
};
