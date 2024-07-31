import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";
import * as THREE from 'three'
import { FragmentsGroup } from "@thatopen/fragments";
import { buildingElement, SelectionGroup, setUpGroup } from "../../utilities/BuildingElementUtilities";
import { GetFragmentsFromExpressIds } from "../../utilities/IfcUtilities";
import { VisibilityMode, VisibilityState } from "../../utilities/types";



export class ModelViewManager extends OBC.Component {
    private _enabled = false;
    static uuid = "0f5e514e-5c1c-4097-a9cc-6620c2e28378" as const;
    private _groups?: Map<string, Map<string, buildingElement[]>>;
    readonly onGroupsChanged = new OBC.Event<Map<string, Map<string, buildingElement[]>> | undefined>();
    readonly onBuildingElementsChanged = new OBC.Event<buildingElement[]>();
    readonly onGroupVisibilitySet = new OBC.Event<Map<string, VisibilityState>>();
    readonly onSelectedGroupChanged = new OBC.Event<SelectionGroup>();
    readonly onVisibilityModeChanged = new OBC.Event<VisibilityMode>();
    private _groupVisibility?: Map<string, VisibilityState>;
    private _selectedGroup?: SelectionGroup;

    get SelectedGroup(): SelectionGroup | undefined {
        return this._selectedGroup;
    }
    set SelectedGroup(selectionGroup: SelectionGroup | undefined) {
        if (!selectionGroup) return;
        this._selectedGroup = selectionGroup;
        console.log("ModelViewManager: selected group changed:", selectionGroup)
        this.onSelectedGroupChanged.trigger(this._selectedGroup)

        // Add any additional logic needed when setting the selection group
    }

    constructor(components: OBC.Components) {
        super(components);

        const frag = components.get(OBC.FragmentsManager)
        frag.onFragmentsDisposed.add((data) => this.cleanUp(data.groupID, data.fragmentIDs))
    }

    cleanUp = (groupID: string, fragmentIDs: string[]) => {



    }

    setUpGroups = (buildingElements: buildingElement[] | undefined, groupVisibility?: Map<string, VisibilityState>): void => {
        if (!buildingElements) {
            this._groups = undefined;
            this.onGroupsChanged.trigger(undefined);
            return;
        }

        this._groups = setUpGroup(buildingElements);
        console.log("modelViewManager: groups set:", this._groups);
        this.onGroupsChanged.trigger(this._groups);

        this._groupVisibility = groupVisibility ?? this.createDefaultGroupVisibility();
        this._selectedGroup = undefined;
        this._enabled = true;
        this.onGroupVisibilitySet.trigger(this._groupVisibility);
        this.updateVisibility();
    }

    private createDefaultGroupVisibility(): Map<string, VisibilityState> {
        if (!this._groups) throw new Error("Groups not initialized");
        const keys = Array.from(this._groups.values()).flatMap(a => Array.from(a.keys()));
        return new Map(keys.map(name => [name, "Visible"]));
    }

    get Groups(): Map<string, Map<string, buildingElement[]>> | undefined {
        return this._groups;
    }

    set enabled(value: boolean) {
        this._enabled = value;
    }

    get enabled(): boolean {
        return this._enabled;
    }

    private _visibilityMode: VisibilityMode = "Isolate";

    get VisibilityMode(): VisibilityMode {
        return this._visibilityMode;
    }

    set VisibilityMode(value: VisibilityMode) {
        console.log("Visibility mode set:", value)
        this._visibilityMode = value;
        this.onVisibilityModeChanged.trigger(this._visibilityMode);
    }

    set GroupVisibility(value: Map<string, VisibilityState> | undefined) {
        console.log("ModelViewManager: group vis being set", value);
        this._groupVisibility = value;
        this.onGroupVisibilitySet.trigger(this._groupVisibility);
        this.updateVisibility();
    }

    get GroupVisibility(): Map<string, VisibilityState> | undefined {
        return this._groupVisibility;
    }

    private SetVisibility(fragments: OBC.FragmentsManager, elements: buildingElement[], setVisibility: boolean): void {
        const elementsByModelId = this.groupElementsByModelId(elements);

        fragments.groups.forEach(model => {
            const elementsForModel = elementsByModelId.get(model.uuid);
            if (elementsForModel) {
                const allFragments = GetFragmentsFromExpressIds(elementsForModel.map(element => element.expressID), fragments, model);
                console.log("Setting visibility", setVisibility)
                allFragments.forEach((ids, frag) => frag.setVisibility(setVisibility, ids));
            }
        });
    }

    // if color = true color will be reset to original
    private SetColor(fragments: OBC.FragmentsManager, elements: buildingElement[], color: boolean | THREE.Color = false): void {
        const elementsByModelId = this.groupElementsByModelId(elements);

        fragments.groups.forEach(model => {
            const elementsForModel = elementsByModelId.get(model.uuid);
            if (elementsForModel) {
                const allFragments = GetFragmentsFromExpressIds(elementsForModel.map(element => element.expressID), fragments, model);
                if (color === true)
                    allFragments.forEach((ids, frag) => frag.resetColor(ids));
                else if (color instanceof THREE.Color)
                    allFragments.forEach((ids, frag) => frag.setColor(color, ids));
            }
        });
    }

    private groupElementsByModelId(elements: buildingElement[]): Map<string, buildingElement[]> {
        return elements.reduce((acc, element) => {
            if (!acc.has(element.modelID)) {
                acc.set(element.modelID, []);
            }
            acc.get(element.modelID)!.push(element);
            return acc;
        }, new Map<string, buildingElement[]>());
    }

    private updateVisibility = async (): Promise<void> => {
        if (!this._enabled || !this.components || !this._groups) return;

        const fragments = this.components.get(OBC.FragmentsManager);
        if (!this._groupVisibility) {
            const allElements = this.getAllElements();
            this.SetVisibility(fragments, allElements, true);
            console.log("hide elements fails")

            return;
        }

        const { visibleElements, hiddenElements } = this.categorizeElements();
        const cleanVisibleElements = this.filterVisibleElements(visibleElements, hiddenElements);

        this.SetVisibility(fragments, cleanVisibleElements, true);
        this.SetVisibility(fragments, hiddenElements, false);
        console.log("hide elements", hiddenElements)
        // if (this._visibilityMode === "Isolate") {
        //     const allElements = this.getAllElements();
        //     this.SetColor(fragments, allElements, true)
        // }
        // else if (this._visibilityMode === "Passive") {
        //     // selection group rest
        //     // all other visible group to be transparent
        //     this.SetColor(fragments,cleanVisibleElements,true)


        // }
    };

    private getAllElements(): buildingElement[] {
        return Array.from(this._groups!.values())
            .flatMap(innerMap => Array.from(innerMap.values()))
            .flat();
    }

    private categorizeElements(): { visibleElements: buildingElement[], hiddenElements: buildingElement[] } {
        let visibleElements: buildingElement[] = [];
        let hiddenElements: buildingElement[] = [];

        const stations = this._groups!.get('Station');
        if (stations) {
            for (let [key, value] of stations.entries()) {
                if (this._groupVisibility!.get(key)) {
                    visibleElements = visibleElements.concat(value);
                } else {
                    hiddenElements = hiddenElements.concat(value);
                }
            }
        }

        const otherGroups = new Map(this._groups);
        otherGroups.delete('Station');
        for (let [, group] of otherGroups) {
            for (let [groupName, elements] of group) {
                if (this._groupVisibility!.get(groupName)) {
                    visibleElements = visibleElements.concat(elements);
                } else {
                    hiddenElements = hiddenElements.concat(elements);
                }
            }
        }

        return { visibleElements, hiddenElements };
    }

    private filterVisibleElements(visibleElements: buildingElement[], hiddenElements: buildingElement[]): buildingElement[] {
        const hiddenElementIds = new Set(hiddenElements.map(element => element.expressID));
        return visibleElements.filter(element => !hiddenElementIds.has(element.expressID));
    }
}