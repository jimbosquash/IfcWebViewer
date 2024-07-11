import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";

// settings holds the current user settings
// saves setting to cookie or provides serialization for saving
// takes input state of settings
// returns table of settings for display in web-component format
// responsible for sending events out when a setting changes for things to listen too

// either settings has each setting as a property or it has a settings element which contains all settings and is the iterable

// Q - how should i listen to a vlue change in a collection?
// Q - how to generate a table at start state. and how does the components ifc do this for propeerties?

export class settings extends OBC.Component {
    
    static uuid = "8df84b02-cdc9-4af7-854e-304a90998771" as const; // change generate new
    private _enabled = false;
    readonly onSettingChanged = new OBC.Event<{name: string, value: any}>()
    private _settings: settingsState | null = null;



    get enabled() {
        return this._enabled;
    }

    set enabled(value: boolean) {
        if(this._enabled !== this.enabled)
            this._enabled = value
    }

    constructor(components : OBC.Components, startState: settingsState) {
        super(components)
        components.add(settings.uuid,this)
        if(startState)
        {
            this._settings = startState;
        }
    }

    private setStartState(startState: settingsState) {
        if(!startState)
            return;
        
            Object.values(startState).forEach(setting => {
                
            });
    }
}

interface settingsState{
    displayMode: 'dark' | 'light'
}