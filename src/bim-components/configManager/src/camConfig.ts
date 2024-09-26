import * as OBC from '@thatopen/components';
import { ConfigSchema } from "../../../utilities/ConfigManager";

export interface camConfig {
    projection: OBC.CameraProjection,
    navMode: OBC.NavModeID,

}

export const camConfigSchema: ConfigSchema<camConfig> = {
    projection: {defaultValue: "Orthographic"},
    navMode: {defaultValue: "Orbit"},
};