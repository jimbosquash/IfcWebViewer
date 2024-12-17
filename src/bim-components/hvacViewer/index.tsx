import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front"
import { convertToBuildingElement, GetPropertyByName, select, setUpTreeFromProperties } from "../../utilities/BuildingElementUtilities";
import { BuildingElement, IfcElement, sustainerProperties, SelectionGroup, Unspecified } from "../../utilities/types";
import { ModelTagger } from "../modelTagger";
import { markProperties } from "../modelTagger/src/MarkProperties";
import { ModelViewManager } from "../modelViewer";
import { Mark } from "@thatopen/components-front";
import { ModelCache } from "../modelCache";
import { Tree, TreeNode } from "../../utilities/Tree";
import { TreeUtils } from "../../utilities/treeUtils";
import { GetCenterPoint, GetFragmentIdMaps } from "../../utilities/IfcUtilities";

//the hvacviewer will support users in displaying Hvac elements in meaningful ways
// - listen to the active group and check if HVAC exists there
// - trigger if HVAC is present in the active group
// - handel any fancy tag display of HVAC as needed
export const IFCFLOW: string = "IFCFLOW";
const treeID = 'installationTree'

export class HVACViewer extends OBC.Component {
  static uuid = "5683eb94-fafe-4752-9dfe-6fb293ef76f6" as const;
  private _enabled: boolean = false;
  private _managedTypes: string[] = [IFCFLOW]; // type is a string from the ifcEntitytypes. and can contyain a partial name such as IFCFLOW to caputre all similar names
  private _foundElements: BuildingElement[] = [];
  private _tags: Map<string, markProperties> = new Map();
  private _markers: Mark[] = []; //Marks currently being used
  readonly onFoundElementsChanged = new OBC.Event<BuildingElement[]>(); // trigger when the selection group cointas elements of type in this._managedTypes collection.
  readonly onGroupTreeChanged = new OBC.Event<sustainerProperties>(); // trigger when the selection group cointas elements of type in this._managedTypes collection.
  private _groupingType: sustainerProperties = sustainerProperties.PrefabNumber;
  private installationGroups: Tree<IfcElement> | undefined; // defined by the installation company through the 'Prefab preoperty'
  private _tagConfig: "name" | "prefab" = "prefab";

  public groupingOptions: sustainerProperties[] = [sustainerProperties.PrefabNumber,
  sustainerProperties.BuildingStep,
  sustainerProperties.ProductCode,
  sustainerProperties.Family
  ]

  constructor(components: OBC.Components) {
    super(components);
  }

  get groupingType() {
    return this._groupingType;
  }

  set groupingType(groupType: sustainerProperties) {
    if (groupType === this._groupingType) return;
    this._groupingType = groupType


    const tree = setUpTreeFromProperties(treeID, this._foundElements, [this._groupingType], { allowUnspecifedasNodeName: true });
    this.installationGroups = tree;
    this.onGroupTreeChanged.trigger(this._groupingType);

    // set up new tree
  }

  set enabled(value: boolean) {
    this._enabled = value;
    const viewManager = this.components.get(ModelViewManager);
    if (this.enabled) {
      viewManager.onSelectedGroupChanged.add((data) => this.handelSelectedGroupChanged(data));
      this.handelSelectedGroupChanged;
    } else {
      viewManager.onSelectedGroupChanged.remove((data) => this.handelSelectedGroupChanged(data));
      this._foundElements = [];
    }
  }

  /**
   * The tree representing installatino elements grouped by their Prefab property set by external company
   */
  get prefabGroups() {
    return this.installationGroups;
  }

  get foundElements() {
    return this._foundElements;
  }

  get enabled() {
    return this._enabled;
  }

  /**
   * 
   * @param data 
   * @returns 
   */
  handelSelectedGroupChanged(data: SelectionGroup) {
    if (!data || !data.elements) return;

    const buildingElements = data.elements;
    console.log("managedTypes", this._managedTypes);
    let managedTypeElements = buildingElements.filter((el) =>
      this._managedTypes.find((partialType) => el.type.includes(partialType))
    );
    managedTypeElements = [
      ...managedTypeElements,
      ...buildingElements.filter((el) => GetPropertyByName(el, sustainerProperties.ProductCode)?.value.includes("TE")),
    ];
    const uniqueElements = Array.from(new Set(managedTypeElements.map(el => JSON.stringify(el)))).map(el => JSON.parse(el) as BuildingElement);


    if (!uniqueElements) {
      if (this._foundElements.length !== 0) this.onFoundElementsChanged.trigger([]); // this means that the group had hvac elements
      return; // no managed hvac elements found
    }
    this._foundElements = uniqueElements;
    this.setupTags(this._foundElements)

    const tree = setUpTreeFromProperties(treeID, this._foundElements, [this._groupingType], { allowUnspecifedasNodeName: true });
    this.installationGroups = tree;
    this.onFoundElementsChanged.trigger(this._foundElements);
  }



  /**
   * color elements and set up tag for elements depending on Tag settings
   * @param nodeId 
   * @returns 
   */
  highlightGroup(nodeId: string) {
    // console.log('hvac handler highlighting')
    if (!this.installationGroups) return;
    this.showTags(false)


    const node = this.installationGroups.getFirstOrUndefinedNode(((n) => n.id === nodeId))
    if (!node) return;

    console.log('hvac handler highlighting', node)

    let elements = convertToBuildingElement(TreeUtils.getChildrenNonNullData(node));
    // select(elements, this.components, true)

    const frags = GetFragmentIdMaps(elements, this.components);
    if (frags) {
      const highlighter = this.components.get(OBF.Highlighter);
      console.log('highlighter', highlighter)
      highlighter.clear('select')
      frags.forEach(frag => {
        highlighter.highlightByID('select', frag, false, true)

      })
    }

    //set up tags

    this.setupTags(elements);
    this.showTags(true);


  }


  showTags(show: boolean) {
    if (!this._foundElements) return;
    console.log('hvac tags', this._tags)
    const viewManager = this.components.get(ModelCache);

    if (show) {
      if (this._tags) {
        this._tags.forEach(tag => {
          //create marker
          const mark = ModelTagger.createMarkFromProps(viewManager.world ?? undefined, tag.text, tag.color, tag.position, tag.icon ?? undefined)
          if (mark)
            this._markers.push(mark)

        })
      }
    }
    else if (this._markers) {
      this._markers?.forEach(mark => {
        mark.dispose();
      });
      this._markers = [];

    }

  }

  setupTags(buildingElements: BuildingElement[]) {
    if (this._tags) {
      this._tags.forEach(t => t.dispose())
      this._tags = new Map();
      this._markers?.forEach(mark => {
        mark.dispose();
      });
      this._markers = [];
    }

    if (this._tagConfig === "name") {
      this._tags = ModelTagger.createMarkProperties(this.components, buildingElements);
    } else {
      this._tags = this.createMarkPropertiesForInstallation(this.components, this.groupingType, buildingElements);

      // assume this is a group of items. 
      // group them by grouping type 'prefab'
      // then add their name based on prefab - male / female / cable
      // color them based on their grouping
    }
  }

  conduitWords = ['conduit'];
  connectionWords = ['steker', 'stekker']
  femaleconnectionWords = ['female']
  maleconnectionWords = ['male']



  createMarkPropertiesForInstallation(components: OBC.Components, propertyGroup: string, buildingElements: BuildingElement[]): Map<string, markProperties> {

    const tags = new Map<string, markProperties>();

    // group by model
    const elementsByModel = buildingElements.reduce((acc, element) => {
      if (!acc.has(element.modelID)) {
        acc.set(element.modelID, [])
      }
      acc.get(element.modelID)?.push(element)
      return acc;
    }, new Map<string, BuildingElement[]>)

    // create new mark properties by model group
    const fragments = components.get(OBC.FragmentsManager);
    elementsByModel.forEach((elements, modelID) => {
      const model = fragments.groups.get(modelID);

      if (!model) {
        console.log("failed to creat tags as no model found for", modelID, elements)
        return;
      }

      // I need my elements grouped by prefab

      const elementsByGroup = elements.reduce((acc, element) => {

        const prop = ModelTagger.isSustainerProperty(propertyGroup)
          ? GetPropertyByName(element, propertyGroup)?.value
          : Unspecified;

        if (!acc.has(prop ?? Unspecified)) {
          acc.set(prop ?? Unspecified, [])
        }

        acc.get(prop ?? Unspecified)?.push(element)
        return acc;
      }, new Map<string, BuildingElement[]>)

      elementsByGroup.forEach((elements, name) => {
        elements.forEach(element => {
          const pt = GetCenterPoint(element, model, components)
          if (!pt) {
            console.log('Get Center failed: no center point found', element)
            return;
          }

          // get name test

          const type = this.parseString(element.name)

          const icon = this._icons.get(type)
          console.log('type', type, 'icon', icon)

          tags.set(element.GlobalID, new markProperties(element.GlobalID, name === Unspecified ? element.name : name, pt, ModelTagger.getColorByProperty(name, components), element.type, icon ?? undefined));
        })
      })

    })
    return tags;
  }

  private _icons = new Map<string, string>([
    ['conduit', 'material-symbols:cable'],
    ['female conection', 'icon-park-outline:round-socket'],
    ['male connection', 'ic:baseline-power'],
    ['connection', 'mdi:plug'],
    ['Unspecified', 'material-symbols:electric-bolt']
  ])


  private parseString(input: string): "conduit" | "female conection" | "male connection" | "connection" | "Unspecifed" {


    // Normalize the input string to lowercase for case-insensitive matching
    const normalizedInput = input.toLowerCase();
    console.log('string parse', normalizedInput)

    // Check against each category's word list
    switch (true) {
      case this.conduitWords.some(word => normalizedInput.includes(word)):
        return "conduit";
      case this.femaleconnectionWords.some(word => normalizedInput.includes(word)):
        return "female conection"
      case this.maleconnectionWords.some(word => normalizedInput.includes(word)):
        return "male connection"
      case this.connectionWords.some(word => normalizedInput.includes(word)):
        return "connection"
      default:
        return Unspecified;
    }
  }
}
