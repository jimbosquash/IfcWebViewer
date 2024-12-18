// theme.d.ts
import { PaletteColor } from "@mui/material/styles";

declare module "@mui/material/styles" {
    interface PaletteColor {
        hover?: string;
        selected?: string;
        doubleClicked?: string;
    }

    interface Palette {
        neutral?: PaletteColor; // Extend with custom palettes if needed
    }

    interface PaletteOptions {
        neutral?: PaletteColor; // Extend with custom palettes if needed
    }
}
