import * as OBC from "@thatopen/components";
import { GetPropertyByName } from "../../utilities/BuildingElementUtilities";
import { BuildingElement, knownProperties, SelectionGroup } from "../../utilities/types";
import { markProperties } from "../modelTagger/src/Tag";
import { ModelViewManager } from "../modelViewer";

//the hvacviewer will support users in displaying Hvac elements in meaningful ways
// - listen to the active group and check if HVAC exists there
// - trigger if HVAC is present in the active group
// - handel any fancy tag display of HVAC as needed
export const IFCFLOW: string = "IFCFLOW";

export class HVACViewer extends OBC.Component {
  static uuid = "5683eb94-fafe-4752-9dfe-6fb293ef76f6" as const;
  private _enabled: boolean = false;
  private _managedTypes: string[] = [IFCFLOW]; // type is a string from the ifcEntitytypes. and can contyain a partial name such as IFCFLOW to caputre all similar names
  private _foundElements: BuildingElement[] = [];
  private _tags: Map<string, markProperties> = new Map();
  readonly onFoundElementsChanged = new OBC.Event<BuildingElement[]>(); // trigger when the selection group cointas elements of type in this._managedTypes collection.
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
      ...buildingElements.filter((el) => GetPropertyByName(el, knownProperties.ProductCode)?.value.includes("TE")),
    ];

    if (!managedTypeElements) {
      if (this._foundElements.length !== 0) this.onFoundElementsChanged.trigger([]); // this means that the group had hvac elements
      return; // no managed hvac elements found
    }
    this._foundElements = managedTypeElements;
    this.onFoundElementsChanged.trigger(this._foundElements);
  }


  showTags(showNames: boolean = false) {
    if(!this._foundElements) return;
  }

  setupTags(buildingElements: BuildingElement[]) {
    if (this._tags) {
        this._tags.forEach(t => t.dispose())
        this._tags = new Map();
    }
    this._tags = markProperties.create(this.components,buildingElements);
}
}
