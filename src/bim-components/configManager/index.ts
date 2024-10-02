import * as OBC from "@thatopen/components";
import { ConfigManager } from "../../utilities/ConfigManager";
import { camConfig, camConfigSchema } from "./src/camConfig";
import { sceneConfig, sceneConfigSchema } from "./src/sceneConfig";

export class ConfigurationManager extends OBC.Component {

    static uuid = "ede9c05c-b144-4623-b22f-09a743340d4c" as const;
    private _enabled = false;
    private _sceneConfig = new ConfigManager<sceneConfig>(sceneConfigSchema, 'sceneConfig');
    private _camConfig = new ConfigManager<camConfig>(camConfigSchema, 'camConfig');


    constructor(components: OBC.Components) {
        super(components)
        components.add(ConfigurationManager.uuid, this)
    }

    set enabled(value: boolean) {
        this._enabled = value
    }

    get enabled() {
        return this._enabled
    }

    get sceneConfig() { return this._sceneConfig};
    get camConfig() { return this._camConfig};
}