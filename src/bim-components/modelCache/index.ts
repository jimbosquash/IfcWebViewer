import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";
import { FragmentsGroup } from "@thatopen/fragments";
import * as THREE from "three";

export class ModelCache extends OBC.Component {

    private _enabled = false
    private _models: Map<string, FRAGS.FragmentsGroup> = new Map<string, FRAGS.FragmentsGroup>;
    static uuid = "005d1863-99d7-453d-96ef-c07b309758ce" as const;



    constructor(components: OBC.Components) {
        super(components);
    }


    delete(model: string) {
        this._models.delete(model)
    }

    add(model: FRAGS.FragmentsGroup): boolean {
        if (this._models.has(model.uuid))
            return false;

        this._models.set(model.uuid, model)
        return true;
    }

    exists(model: FRAGS.FragmentsGroup) : boolean {
        return this._models.has(model.uuid);
    }

    dispose() {
        this._models = new Map<string, FRAGS.FragmentsGroup>();
    }


    set enabled(value: boolean) {
        this._enabled = value;
    }

    get enabled() {
        return this._enabled
    }
}