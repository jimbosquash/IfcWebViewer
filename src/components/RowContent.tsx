import { Box, Typography } from "@mui/material";
import { TreeNode } from "../utilities/Tree";
import { IfcElement } from "../utilities/types";
import { Icon } from "@iconify/react";
import { nonSelectableTextStyle } from "../styles";

export interface RowContentProps {
    name: string;
    icon: string;
    node: TreeNode<IfcElement> | undefined;
    chips?: React.ReactNode[]; // An array of chips (optional), passed as React elements
}


// RowContent component to display name, icon, and any chips passed
export const RowContent: React.FC<RowContentProps> = ({ name, icon, chips }) => {

    return (
        <Box
            component="div"
            display="flex"
            width="70%" // Full width of the container
            justifyContent="flex-start" // Align content to the start
            alignItems="center" // Center vertically
            sx={{ flexGrow: 1 }}
        >
            {/* Icon */}
            {icon && (
                <Icon
                    icon={icon}
                    style={{
                        marginLeft: "3px",
                        marginRight: "3px",
                        fontSize: "14px",
                        flexShrink: 0, // Prevent shrinking
                    }}
                />
            )}

            {/* Truncated Text */}
            <Typography
                noWrap
                color="inherit"
                sx={{
                    flexShrink: 3,
                    // flexGrow: 0, // Allow the text to take available space
                    minWidth: 0, // Prevent text from forcing a minimum width
                    ...nonSelectableTextStyle,
                    // maxWidth: "5 0%",
                    // marginLeft: 1, // Space between icon and text
                    whiteSpace: "nowrap", // Ensure no wrapping
                    overflow: "hidden", // Hide overflowing text
                    textOverflow: "ellipsis", // Add ellipsis for overflow
                    backgroundColor: "transparent", // Transparent background for clean look
                }}
            >
                {name}
            </Typography>

            {/* Chips */}
            <Box
                component="div"
                display="flex"
                alignItems="center"
                justifyContent="flex-end"
                sx={{
                    ...nonSelectableTextStyle,
                    flexShrink: 0, // Prevent chips from shrinking
                    marginLeft: "auto", // Push chips to the right
                    marginRight: "4px", // Push chips to the right
                }}
            >
                {chips?.map((chip, index) => (
                    <Box component="div" key={index} sx={{ ml: 1, mt: 1, mb: 1 }}>
                        {chip}
                    </Box>
                ))}
            </Box>
        </Box>
    );

};

export default RowContent;
