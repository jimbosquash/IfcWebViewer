import * as OBC from "@thatopen/components";
import * as FRAGS from "@thatopen/fragments";
import { GetBuildingElements } from "../../utilities/IfcUtilities";
import { BuildingElement } from "../../utilities/types";
import { ModelViewManager } from "../modelViewer";

export class ModelCache extends OBC.Component {
    private _enabled = false
    private _models: Map<string, FRAGS.FragmentsGroup> = new Map<string, FRAGS.FragmentsGroup>;
    static uuid = "005d1863-99d7-453d-96ef-c07b309758ce" as const;
    readonly onModelAdded = new OBC.Event<FRAGS.FragmentsGroup>()
    readonly onModelStartRemoving = new OBC.Event<FRAGS.FragmentsGroup>()
    readonly onBuildingElementsChanged = new OBC.Event<BuildingElement[]>()
    readonly onWorldSet = new OBC.Event<OBC.World>()
    private _world: OBC.World | null = null;

    private _buildingElements: BuildingElement[] | undefined;

    getModel(modelId : string): FRAGS.FragmentsGroup | undefined {
        if(!modelId) return;

        if(this._models.has(modelId))
            return this._models.get(modelId);
    }

    constructor(components: OBC.Components) {
        super(components);
    }


    async delete(groupID: string): Promise<boolean> {
        this._models.delete(groupID)


        // Filter out elements whose ids are in the idSet
        const result = this._buildingElements?.filter(element => element.modelID !== groupID);
        // console.log(result)

        this._buildingElements = result;
        this.components.get(ModelViewManager).setUpGroups(this._buildingElements);
        console.log("building element count:", this._buildingElements?.length)
        return true;
    }

    // delete
    // remove building building elements

    async add(model: FRAGS.FragmentsGroup): Promise<boolean> {
        if (this._models.has(model.uuid))
            return false;

        this._models.set(model.uuid, model)
        console.log("model added to cache", model)
        this.onModelAdded.trigger(model)

        try {
            let newElements = await GetBuildingElements(model, this.components);
            if (!this._buildingElements) {
                this._buildingElements = newElements;
            }
            else {
                this._buildingElements = this._buildingElements.concat(newElements);
            }

            // console.log('ModelCache: building elements changed', this._buildingElements)
            this.onBuildingElementsChanged.trigger(this._buildingElements);

            this.components.get(ModelViewManager).setUpGroups(this._buildingElements);
            this.components.get(OBC.FragmentsManager).onFragmentsDisposed.add((data) => {
                this.delete(data.groupID)
                console.log("fragmentunloaded", data)
            })
            return true;
        } catch (error) {
            console.error('Error fetching building elements:', error);
            return false;
        }

    }


    exists(model: FRAGS.FragmentsGroup): boolean {
        return this._models.has(model.uuid);
    }

    dispose() {
        this._models = new Map<string, FRAGS.FragmentsGroup>();
        this._buildingElements = [];
    }

    set world(world: OBC.World | null) {
        this._world = world
        console.log("model cache, new world set", world)
        if (this._world !== null) {
            this.onWorldSet.trigger(this._world)
        }
    }

    get world() {
        return this._world
    }


    set enabled(value: boolean) {
        this._enabled = value;
    }

    get enabled() {
        return this._enabled
    }

    get BuildingElements() {
        return this._buildingElements;
    }
}