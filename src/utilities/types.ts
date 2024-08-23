

export enum VisibilityMode {
    Isolate, // hide all others 
    Passive, // do nothing
    showGroup, // show group and hide all others
    Translucent // transculcent all others
}
export enum VisibilityState {
    Visible,
    Hidden,
    Ghost
}

export enum KnowGroupType {
    Station,
    BuildingStep,
    Assembly,
    BuildingElement,
    Unknown
}

export type GroupingType = KnowGroupType | string;

export interface SelectionGroup {
    id: string; // used for tree nodeMap searching
    groupType: GroupingType;
    groupName: string;
    elements: BuildingElement[];
  }

  export interface BuildingElement {
    expressID: number;
    GlobalID: string;
    type: number;
    name: string;
    modelID: string; // the fraggroup id
    properties: { name: string, value: string, pSet: string}[]
  }

  // names of properties that we commonly use for ifc export
  export type knownProperties = "Aantal" |"Bouwnummer"| "Productcode" | "Materiaal"
  
  
// can I stash visibility state on elements directly and still cleaning support groups temp trans state?
// copy logic of resetcolor on frag group
