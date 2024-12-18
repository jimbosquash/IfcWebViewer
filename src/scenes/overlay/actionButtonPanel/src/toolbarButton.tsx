import { Button, Tooltip, useTheme } from "@mui/material";
import { tokens } from "../../../../theme";


interface ToolBarButtonProps {
    onClick: () => void;
    content: React.ReactNode | string; // Changed from ReactJSXElement to React.ReactNode for compatibility.
    toolTip?: string;
}

export const ToolBarButton: React.FC<ToolBarButtonProps> = ({ onClick, content: icon, toolTip }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
        <Tooltip title={toolTip || ''}>
            <Button
                sx={{
                    color: 'primary',
                    border: 0
                }}
                onClick={onClick}
            >
                {icon}
            </Button>
        </Tooltip>
    );
};
// backgroundColor: colors.primary[100],
