import { Icon } from "@iconify/react";
import { Box, Tooltip, Typography, useTheme } from "@mui/material";
import { useState } from "react";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { nonSelectableTextStyle } from "../../../../styles";
import { tokens } from "../../../../theme";


export const MaterialOverviewPanel : React.FC = () => {
    const [groups,setGroups] = useState<any[]>(['lvl','mdf','lvlq',''])

    return (
        <>
            <div
              style={{
                top: "0%",
                left: 0,
                zIndex: 50,
                padding: "0px",
                width: "100%",
              }}
            >
              <div>
                <Box
                  component="div"
                  m="10px"
                  maxHeight="100%"
                  overflow="auto"
                  width="90%"
                >
                    {Array.from(groups).map((data, index) => (
                      <FloatingBox key={`${data}-${index}`} />
                      ))}
                </Box>
              </div>
            </div>
        </>
      );
}


const FloatingBox = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const components = useComponentsContext();
    const [isHovered, setIsHovered] = useState(false);
    const [isSelected, setIsSelected] = useState(false);
    const [isVisible, setIsVisible] = useState<boolean>(false); // check this

    const handelDoubleClick = () => {
        setSelected();
      };


      /**
       * set selected the selection group or elements asociated with this container
       * @returns 
       */
      const setSelected = () => {
        setIsSelected(true);
        //todo: impliment

      };


      const ToggleVisibility = () => {
          setIsVisible(!isVisible);
          // update visibility
      }

    return (
        <Tooltip title={"Material: LVL"}>
          <Box component="div">
            <Box
              component="div"
              onDoubleClick={() => handelDoubleClick()}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              sx={{
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                padding: isHovered ? "8px" : "10px",
                width: isHovered ? "95%" : "92%",
                height: "30px",
                margin: "8px 0",
                borderRadius: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                border: isSelected ? "1px solid #ccc" : "none",
                backgroundColor: isSelected ? colors.blueAccent[600] : colors.grey[900],
                transition: "all 0.2s ease",
                justifyContent: "space-between",
                overflow: "hidden", // Ensures no overflow issues
              }}
            >
              {/* <Icon icon="system-uicons:boxes" color={isSelected ? colors.primary[100] : colors.grey[500]} /> */}
              <Icon icon="game-icons:wood-beam" color={isSelected ? colors.primary[100] : colors.grey[500]}/>
              <Typography
                noWrap
                // maxWidth="105px"
                minWidth="20px"
                align="left"
                textAlign='left'
                alignContent= "left"
                sx={{
                  flexGrow: 1,
                  color: isSelected ? colors.primary[100] : colors.grey[600],
                  ...nonSelectableTextStyle,
                  ml: 1,
                  display: { xs: "none", sm: "block" },
                  variant: isSelected ? "body2" : "body1",
                  whiteSpace: "nowrap", // Prevents wrapping
                  overflow: "hidden", // Hides overflow content
                  textOverflow: "ellipsis", // Adds ellipsis to overflow text
                }}
              >
                Material name
                {/* {displayName} */}
              </Typography>
              <Typography
                color={isSelected ? colors.primary[100] : colors.grey[600]}
                noWrap
                variant="body2"
                sx={{
                  ...nonSelectableTextStyle,
                  marginLeft: "10px",
                  color: isSelected ? colors.primary[100] : colors.grey[600],
                  variant: "body2",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: { xs: "none", sm: "block" }, // Responsive: hides on extra small screens
                }}
              >
                Qnt : 12
              </Typography>
              {/* <IconButton
                size="small"
                // color={isSelected ? "primary" : "secondary"}
                sx={{ marginLeft: "8px", color: isSelected ? colors.primary[100] : colors.grey[500] }}
                onClick={(e: any) => {
                  e.stopPropagation();
                  ToggleVisibility();
                }}
              >
                {isVisible ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
              </IconButton> */}
            </Box>
          </Box>
        </Tooltip>
      );
}

export default MaterialOverviewPanel;