import * as OBC from "@thatopen/components";
import * as FRAGS from "@thatopen/fragments";
import { Fragment, FragmentIdMap, FragmentsGroup } from "@thatopen/fragments";
import { GetPropertyByName, groupByModelID } from "../../utilities/BuildingElementUtilities";
import { GetBuildingElements } from "../../utilities/IfcUtilities";
import { addOrUpdateEntries, clearDB, getAllKeys, getValuesByKeys } from "../../utilities/indexedDBUtils";
import { BuildingElement, knownProperties } from "../../utilities/types";
import { generateRandomHexColor } from "../../utilities/utilities";
import { ModelViewManager } from "../modelViewer";

export class ModelCache extends OBC.Component {
    private _enabled = false
    /**
     * used in the case of multiple models open.
     * key = modelID or fragmentGroup.uuid, value is ifc model
     */
    private _models: Map<string, FRAGS.FragmentsGroup> = new Map<string, FRAGS.FragmentsGroup>;
    /**
     * key = module uuid, value = *Uint8Array used for saving adjusted files
     */
    private _modelData: Map<string, Uint8Array> = new Map<string, Uint8Array>;
    static uuid = "005d1863-99d7-453d-96ef-c07b309758ce" as const;
    readonly onModelAdded = new OBC.Event<FRAGS.FragmentsGroup>()
    readonly onModelStartRemoving = new OBC.Event<FRAGS.FragmentsGroup>()
    readonly onBuildingElementsChanged = new OBC.Event<BuildingElement[]>()
    readonly onWorldSet = new OBC.Event<OBC.World>()
    private _world: OBC.World | null = null;

    /**
     * 
     * @param modelID the uuid of the fragment representing the model
     */
    getModelData = (modelID: string) => {
        return this._modelData.get(modelID);
    }

    // todo: should this be Map<modelID: string, expressIDs :Set<number>>?
    private _buildingElements: BuildingElement[] | undefined;

    /**
     * Key = BuildingElement GlobalID, value = Fragment.
     * this is helpful to get to the geometry quickly for things like visibilty checking
     */
    private _fragmentsBybuildingElementIDs: Map<string, FRAGS.Fragment> = new Map();

    models = (): FRAGS.FragmentsGroup[] => {
        return Array.from(this._models.values())
    }

    getModel(modelId: string): FRAGS.FragmentsGroup | undefined {
        if (!modelId) return;

        if (this._models.has(modelId))
            return this._models.get(modelId);
    }

    private setBuildingElementsAddedListener: () => void;

    constructor(components: OBC.Components) {
        super(components);
        this.setBuildingElementsAddedListener = this.updateIndexedDB.bind(this);
        this.onBuildingElementsChanged.add(this.setBuildingElementsAddedListener)

    }
    /**
     * 
     * @param expressID ifcLine number or expressID
     * @param modelID The uuid of the ifc model also known as the fragmentGroup
     * @returns 
     */
    getElementByExpressId(expressID: number, modelID: string): BuildingElement | undefined {

        if (!expressID || !this._buildingElements) return;

        const buildingElement = this._buildingElements.find(e => e.expressID === expressID && e.modelID === modelID)
        return buildingElement;
    }


    getFragmentByElement(element: BuildingElement): Fragment | undefined {
        if (!element) return;

        const fragment = this._fragmentsBybuildingElementIDs.get(element.GlobalID)
        if (!fragment) {
            console.log('model cache: faile dto get fragment from building elements globalID', element.GlobalID)
        }
        return fragment;
    }

    /**
 * Group by Model ID for easy handeling
 * @returns key = ModuleID, value = Building Elements 
 */
    GroupByModel(buildingElements: BuildingElement[]): Map<FragmentsGroup, BuildingElement[]> {
        const modelMap: Map<FragmentsGroup, BuildingElement[]> = new Map();
        groupByModelID(buildingElements).forEach((elements, modelID) => {
            const model = this.models().find(m => m.uuid === modelID);
            if (!model) {
                console.log('Failed to find model', modelID)
                return;
            }
            modelMap.set(model, elements)
        })
        return modelMap;
    }


    /**
     * 
     * @param expressID ifcLine numbers or expressIDs
     * @param modelID The uuid of the ifc model also known as the fragmentGroup
     * @returns 
     */
    getElementsByExpressId(expressIDs: Set<number>, modelID: string): BuildingElement[] {
        if (!expressIDs || !this._buildingElements) return [];

        const elements: BuildingElement[] = [];

        expressIDs.forEach(id => {
            const element = this.getElementByExpressId(id, modelID)
            if (element) elements.push(element)

        })
        return elements;
    }

    /**
     * get elements by assuming idMap numbers are express ids. Using them by searching our building 
     * elements collection for element with matching expressID
     * @param fragmentIdMap 
     * @returns 
     */
    getElementByFragmentIdMap(fragmentIdMap: FragmentIdMap): Set<BuildingElement> | undefined {
        //console.log('get elements by Id Map', fragmentIdMap, this._models)

        if (!fragmentIdMap || !this._buildingElements) return;

        const elements = new Set<BuildingElement>();
        //get all the ids and get all 
        Object.entries(fragmentIdMap).forEach((entry) => {
            const fragID = entry[0];
            const expressIDs = entry[1];
            expressIDs.forEach(id => {
                const foundElement = this._buildingElements?.find(e => e.expressID === id && e.FragmentID === fragID);
                if (foundElement)
                    elements.add(foundElement)
            });
        })

        return elements;
    }

    async delete(groupID: string): Promise<boolean> {
        this._models.delete(groupID)

        // Filter out elements whose ids are in the idSet
        const result = this._buildingElements?.filter(element => element.modelID !== groupID);
        // console.log(result)

        this._buildingElements = result;
        this.components.get(ModelViewManager).setUpDefaultTrees(this._buildingElements);
        console.log("building element count:", this._buildingElements?.length)
        return true;
    }

    private model: FRAGS.FragmentsGroup | undefined = undefined;
    // delete
    // remove building building elements

    async add(model: FRAGS.FragmentsGroup, data: Uint8Array): Promise<boolean> {
        if (this._models.has(model.uuid))
            return false;

        this._models.set(model.uuid, model)
        //this._modelData.set(model.uuid,data)
        console.log("model added to cache", model)
        this.onModelAdded.trigger(model)
        this.model = model;
        console.log('model cache model set', this.model, model)

        try {
            let newElements = await GetBuildingElements(model, this.components);
            if (!this._buildingElements) {
                this._buildingElements = newElements;
            }
            else {
                this._buildingElements = this._buildingElements.concat(newElements);
            }

            newElements.forEach(e => {
                // add the fragment by elements id
                const frag = model.items.find(f => f.id === e.FragmentID)
                if (!frag) return;

                this._fragmentsBybuildingElementIDs.set(e.GlobalID, frag);
            })

            // add or get the alias from the indexedDB
            //  await clearDB();
            // await this.updateIndexedDB(newElements)
            // const test = await getAllKeys();

            // console.log('aliasDB', test)
            // now add the alias to each element


            // console.log('ModelCache: building elements changed', this._buildingElements)
            this.onBuildingElementsChanged.trigger(this._buildingElements);

            this.components.get(ModelViewManager).setUpDefaultTrees(this._buildingElements);
            this.components.get(OBC.FragmentsManager).onFragmentsDisposed.add((data) => {
                this.delete(data.groupID)
                console.log("fragment unloaded", data)
            })
            return true;
        } catch (error) {
            console.error('Error fetching building elements:', error);
            return false;
        }
    }

    private async updateIndexedDB() {
        const elements = this._buildingElements;
        if (!elements) return;
        await this.addNewEntries(elements.map(element => GetPropertyByName(element, knownProperties.ProductCode)?.value ?? ''))
        //  await clearDB();
        // now add the alias to each element
        await this.assignCacheValues(elements)
    }


    // Add multiple entries in one transaction (only if they don't exist)
    async addNewEntries(elementCodes: string[]) {
        const existingKeys = await getAllKeys(); // Get all existing keys

        // Step 1: Remove duplicates from input, keeping the first occurrence only
        const uniqueElements = Array.from(new Set(elementCodes.filter((e) => e.trim() !== '')));

        // Step 2: Filter out elements that already exist in the database
        const newElements = uniqueElements.filter((element) => !existingKeys.includes(element));

        // with these new elements we need to generate new colors and number
        let startingValue: number = existingKeys.length;

        const newEntries = newElements.map(element => ({
            key: element,
            value: {
                alias: (++startingValue).toString(),
                color: generateRandomHexColor()
            }
        }))

        console.log('adding new entries', newEntries);

        await addOrUpdateEntries(newEntries);
    }

    /**
     * adds the alias from index db to the building element. assuming it already exists in IndexedDB
     */
    private async assignCacheValues(
        inputElements: BuildingElement[]
    ): Promise<BuildingElement[]> {
        // Step 1: Group elements by their code
        const groupedByCode = inputElements.reduce<Map<string, BuildingElement[]>>((acc, element) => {
            const code = GetPropertyByName(element, knownProperties.ProductCode)?.value ?? ''
            const elementsWithSameCode = acc.get(code) || [];
            elementsWithSameCode.push(element);
            acc.set(code, elementsWithSameCode);
            return acc;
        }, new Map());

        // Step 2: Get all unique codes
        const uniqueCodes = Array.from(groupedByCode.keys());

        // Step 3: Fetch values from IndexedDB in one batch
        const cachedValues = await getValuesByKeys(uniqueCodes);

        // Step 4: Assign the cached value to all matching elements
        for (const [code, elements] of groupedByCode.entries()) {
            const value = cachedValues.get(code);
            elements.forEach((element) => (element.alias = value?.alias)); // Assign value to all matching elements
        }

        return inputElements; // Return the updated input elements
    }



    exists(model: FRAGS.FragmentsGroup): boolean {
        return this._models.has(model.uuid);
    }

    dispose() {
        this._models = new Map<string, FRAGS.FragmentsGroup>();
        this._buildingElements = [];
        this.onBuildingElementsChanged.remove(this.setBuildingElementsAddedListener)

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

    get buildingElements() {
        return this._buildingElements;
    }
}