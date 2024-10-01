import { ConfigSchema } from "../../../utilities/ConfigManager";
import * as OBC from '@thatopen/components';
import * as THREE from 'three'
import { viewPoint } from "..";




export interface viewPresenterConfig {
    viewPoints: viewPoint[],
}

export const viewPresenterConfigSchema: ConfigSchema<viewPresenterConfig> = {
    viewPoints: {defaultValue: []}
};