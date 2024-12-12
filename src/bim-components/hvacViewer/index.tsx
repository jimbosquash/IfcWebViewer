import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front"
import { convertToBuildingElement, GetPropertyByName, select, setUpTreeFromProperties } from "../../utilities/BuildingElementUtilities";
import { BuildingElement, IfcElement, sustainerProperties, SelectionGroup } from "../../utilities/types";
import { ModelTagger } from "../modelTagger";
import { markProperties } from "../modelTagger/src/Tag";
import { ModelViewManager } from "../modelViewer";
import { Mark } from "@thatopen/components-front";
import { ModelCache } from "../modelCache";
import { Tree, TreeNode } from "../../utilities/Tree";
import { TreeUtils } from "../../utilities/treeUtils";
import { GetFragmentIdMaps } from "../../utilities/IfcUtilities";

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

  private _prefabGroups: Tree<IfcElement> | undefined; // defined by the installation company through the 'Prefab preoperty'


  constructor(components: OBC.Components) {
    super(components);
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
    return this._prefabGroups;
  }

  get foundElements() {
    return this._foundElements;
  }

  get enabled() {
    return this._enabled;
  }

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

    if (!managedTypeElements) {
      if (this._foundElements.length !== 0) this.onFoundElementsChanged.trigger([]); // this means that the group had hvac elements
      return; // no managed hvac elements found
    }
    this._foundElements = managedTypeElements;
    this.setupTags(this._foundElements)

    const tree = setUpTreeFromProperties(treeID, this._foundElements, [sustainerProperties.PrefabNumber], { allowUnspecifedasNodeName: true });
    this._prefabGroups = tree;
    this.onFoundElementsChanged.trigger(this._foundElements);
  }


  handleNewElements(elements: BuildingElement[]): void {
    if (!elements) return;
    const tree = setUpTreeFromProperties(treeID, elements, [sustainerProperties.PrefabNumber], { allowUnspecifedasNodeName: true });
    console.log('installation tree', tree)
  }

  highlightGroup(nodeId: string) {
    // console.log('hvac handler highlighting')
    if (!this._prefabGroups) return;
    this.showTags(false)


    const node = this._prefabGroups.getFirstOrUndefinedNode(((n) => n.id === nodeId))
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
          const mark = ModelTagger.createMarkFromProps(viewManager.world ?? undefined, tag.text, tag.color, tag.position)
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
    this._tags = ModelTagger.createMarkProperties(this.components, buildingElements);
  }
}
