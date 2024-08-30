

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
    Station = "Station",
    BuildingStep = "BuildingStep",
    Assembly = "Assembly",
    BuildingElement = "BuildingElement",
    Unknown = "Unknown"
}

export type GroupingType = KnowGroupType | string;

export interface SelectionGroup {
    id: string; // used for tree nodeMap searching
    groupType: GroupingType;
    groupName: string;
    elements: BuildingElement[];
  }

  /**
   * A container for handeling Sustainer elements and properties 
   */
  export interface BuildingElement {
    /**
     * the number of the line in the .ifc file
     */
    expressID: number; 
    GlobalID: string;
    /**
     * The Id of the fragment which holds the reference to the InstanceMesh of this object
     */
    FragmentID: string;
    /**
     * The type enumerated of all IFC types. use the @thatOpen ... to get text version
     */
    type: number;
    name: string;
    /**
     * The Id of the FragmentGroup which represents the ifc model file
     */
    modelID: string; // the fraggroup id
    properties: { name: string, value: string, pSet: string}[]
  }

  // names of properties that we commonly use for ifc export
  // export type knownProperties = "Aantal" |"Bouwnummer"| "Productcode" | "Materiaal"

  export enum knownProperties {
    Count = "Aantal",
    BuildingNumber = "Bouwnummer",
    ProductCode = "Productcode",
    Material = 'Materiaal'
  }
  
  
// can I stash visibility state on elements directly and still cleaning support groups temp trans state?
// copy logic of resetcolor on frag group
