import { ConfigSchema } from "../../../utilities/ConfigManager";

export interface sceneConfig {
    showGrid: boolean;
    zoomToSelection: boolean;
}

export const sceneConfigSchema: ConfigSchema<sceneConfig> = {
    showGrid: { defaultValue: true },
    zoomToSelection: { defaultValue: true },
};