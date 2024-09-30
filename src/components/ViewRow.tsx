import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";

import { Icon } from "@iconify/react";
import { tokens } from "../theme";



export interface customRowProps {
    name: string;
    icon?: string;
    children?: React.ReactNode;
    rowContent: React.ReactNode;
    variant: "Floating" | "Flat";
    handleDoubleClick: () => void;
    handleClick: () => void;
  }

  
// should represent a floating box ui
export const ViewRow: React.FC<customRowProps> = ({ variant, handleDoubleClick, handleClick, children,rowContent }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [isHovered, setIsHovered] = useState(false);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
  
  
    const handleToggleExpand = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setIsExpanded((prev) => !prev);
    }, []);
  
    const boxTheme = useMemo(
      () => ({
        ...(variant === "Floating"
          ? {
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
              padding: "2px 8px",
              width: "95%",
            //   width: isHovered ? "95%" : "92%",
              borderRadius: "12px",
              margin: "4px 0",
              marginLeft: "2px",
              border: "0.8px solid #ccc",
            }
          : {
              padding: "0px",
              width: "100%",
              margin: "0px 0",
              borderBottom: "0.8px solid #ccc",
              borderTop: "0.8px solid #ccc",
            }),
        height: "20px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        borderColor: colors.grey[1000],
        //   backgroundColor: getColor("background"),
        transition: "all 0.1s ease",
        justifyContent: "space-between",
        overflow: "hidden",
      }),
      [variant, isHovered, colors]
    );
  
    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  
    return (
      <Box
        component="div"
        sx={{
          width: "100%",
          height: "100%",
        //   minHeight: "30px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        <Box
          component="div"
          onDoubleClick={handleDoubleClick}
          onClick={(e) => {
            handleClick;
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          sx={{
            ...boxTheme,
            width: "98%",
            height: "100%",
            minHeight: "10px",
            display: "flex",
            flexDirection: "row",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          {rowContent}
  {/*         
          <VisibilityToggle
            visibilityState={visibilityState}
            onClick={(e) => {
              handleToggleVisibility(e);
              modelViewManager.updateVisibility(treeID);
            }}
            color={getColor("text")}
          />
          <RowContent name={name} icon={icon} getColor={getColor} node={node} childrenCount={node?.children?.size ?? 0} /> */}
  
          {children && (
            <IconButton
              size="small"
              sx={{ flexShrink: 0, marginLeft: "6px", color: 'primary' }}
              onClick={(e) => {
                e.stopPropagation(); // Stop the click from reaching the row
                handleToggleExpand(e);
              }}
            >
              <Icon icon={isExpanded ? "system-uicons:minus" : "system-uicons:plus"} />
            </IconButton>
          )}
        </Box>
        {isExpanded && children && (
          <Box
            component="div"
            sx={{
              mt: 2,
              width: "100%",
              flexGrow: 1,
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            {children}
          </Box>
        )}
      </Box>
    );
  };