import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";
import { FragmentsGroup } from "@thatopen/fragments";
import { buildingElement, SelectionGroup, setUpGroup } from "../../utilities/BuildingElementUtilities";
import { GetFragmentsFromExpressIds } from "../../utilities/IfcUtilities";

export class ModelViewManager extends OBC.Component {
    private _enabled = false;
    static uuid = "0f5e514e-5c1c-4097-a9cc-6620c2e28378" as const;
    private _groups?: Map<string, Map<string, buildingElement[]>>;
    readonly onGroupsChanged = new OBC.Event<Map<string, Map<string, buildingElement[]>> | undefined>();
    readonly onBuildingElementsChanged = new OBC.Event<buildingElement[]>();
    readonly onGroupVisibilitySet = new OBC.Event<Map<string, boolean>>();
    readonly onSelectedGroupChanged = new OBC.Event<SelectionGroup>();
    private _groupVisibility?: Map<string, boolean>;
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
    }

    setUpGroups = (buildingElements: buildingElement[] | undefined, groupVisibility?: Map<string, boolean>): void => {
        if (!buildingElements) {
            this._groups = undefined;
            this.onGroupsChanged.trigger(undefined);
            return;
        }

        this._groups = setUpGroup(buildingElements);
        console.log("modelViewManager: groups set:", this._groups);
        this.onGroupsChanged.trigger(this._groups);

        this._groupVisibility = groupVisibility ?? this.createDefaultGroupVisibility();
        this._enabled = true;
        this.onGroupVisibilitySet.trigger(this._groupVisibility);
        this.updateVisibility();
    }

    private createDefaultGroupVisibility(): Map<string, boolean> {
        if (!this._groups) throw new Error("Groups not initialized");
        const keys = Array.from(this._groups.values()).flatMap(a => Array.from(a.keys()));
        return new Map(keys.map(name => [name, true]));
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

    set GroupVisibility(value: Map<string, boolean> | undefined) {
        console.log("ModelViewManager: group vis being set", value);
        this._groupVisibility = value;
        this.onGroupVisibilitySet.trigger(this._groupVisibility);
        this.updateVisibility();
    }

    get GroupVisibility(): Map<string, boolean> | undefined {
        return this._groupVisibility;
    }

    private groupAndSetVisibility(fragments: OBC.FragmentsManager, elements: buildingElement[], setVisibility: boolean): void {
        const elementsByModelId = this.groupElementsByModelId(elements);

        fragments.groups.forEach(model => {
            const elementsForModel = elementsByModelId.get(model.uuid);
            if (elementsForModel) {
                const allFragments = GetFragmentsFromExpressIds(elementsForModel.map(element => element.expressID), fragments, model);
                allFragments.forEach((ids, frag) => frag.setVisibility(setVisibility, ids));
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
            this.groupAndSetVisibility(fragments, allElements, true);
            return;
        }

        const { visibleElements, hiddenElements } = this.categorizeElements();
        const cleanVisibleElements = this.filterVisibleElements(visibleElements, hiddenElements);

        this.groupAndSetVisibility(fragments, cleanVisibleElements, true);
        this.groupAndSetVisibility(fragments, hiddenElements, false);
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