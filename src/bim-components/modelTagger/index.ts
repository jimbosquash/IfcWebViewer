import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import { Mark } from "@thatopen/components-front";
import { GetPropertyByName } from "../../utilities/BuildingElementUtilities";
import { GetAllVisibleExpressIDs, GetCenterPoint, GetVisibleExpressIDs } from "../../utilities/IfcUtilities";
import { BuildingElement, knownProperties } from "../../utilities/types";
import { ModelCache } from "../modelCache";
import { ModelViewManager } from "../modelViewer";
import { Tag } from "./src/Tag";
import { getAveragePoint } from "../../utilities/threeUtils";

// key = name of element. first array = an array of matching names with arrays of tags grouped by distance
interface GroupedElements {
    [key: string]: Tag[][];
}


export enum TagVisibilityMode {
    TagSelectionGroup = "TagSelectionGroup",
    TagVisible = "TagVisible"
}

interface TaggerConfiguration {
    showFasteners: boolean,
    showInstallations: boolean,
    mergeFasteners: boolean,
}

const IFCMECHANICALFASTENER: string = "IFCMECHANICALFASTENER";
// const IFCFLOWCONTROLLER: string = "IFCFLOWCONTROLLER";
const IFCFLOW: string = "IFCFLOW";

/**
 * Responsible for generating and display marks or tags which float over a 3d element in the view port. Make
 * sure to set the world for correct use.
 */
export class ModelTagger extends OBC.Component {

    static uuid = "d2802b2c-1a26-4ec6-ba2a-79e20a6b65be" as const;
    readonly onTagAdded = new OBC.Event<Tag>()

    private _enabled = false

    private _world: OBC.World | null = null
    private _previewElement: OBF.Mark | null = null
    private _visible: boolean = false;
    private _materialColor: Map<string, string> = new Map();
    private _tagVisibilityMode: TagVisibilityMode = TagVisibilityMode.TagSelectionGroup;
    private _configuration?: TaggerConfiguration = {
        showFasteners: false,
        showInstallations: false,
        mergeFasteners: true
    }

    readonly onConfigurationSet = new OBC.Event<TaggerConfiguration>()

    get Configuration() {
        return this._configuration;
    }

    set Configuration(value: TaggerConfiguration | undefined) {
        if (!value) return;
        this._configuration = value;

        console.log('tagger configurations set', this._configuration)

        if (this.enabled) {
            this.setTags()
        }

        this.onConfigurationSet.trigger(value);
    }

    /**
     * key = buildingElement.GlobalID, value = mark
     */
    private _markers: Mark[] = [];

    /**
     * key = buildingElement.GlobalID, value = tag
     */
    private _tags: Map<string, Tag> = new Map();


    constructor(components: OBC.Components) {
        super(components)
        components.add(ModelTagger.uuid, this)
    }


    set world(world: OBC.World | null) {
        this._world = world
    }


    get world() {
        return this._world
    }


    get visible() { return this._visible }


    /**
     * start listening to model visibility changed and set up markers.
     * dispose of markers when disabled created newly when enabled
     */
    set enabled(value: boolean) {
        this._enabled = value
        console.log('tagger setting', this._enabled)
        const viewManager = this.components.get(ModelViewManager);
        const cache = this.components.get(ModelCache);

        // todo: remove to other area
        if (!value && this._previewElement) {
            this._previewElement.visible = false
        }

        // add or remove listeners to change visibility and marker set
        if (value) {
            viewManager.onVisibilityUpdated.add(() => this.setTags())
            cache.onBuildingElementsChanged.add(() => this.setTags())
            cache.onBuildingElementsChanged.add(() => this.setup())
            // set up tags 
            if (this._materialColor.size === 0 || this._tags.size === 0) {
                this.setup()
            }
            this.setTags()
        }
        if (!value) {
            viewManager.onVisibilityUpdated.remove(() => this.setTags())
            cache.onBuildingElementsChanged.remove(() => this.setTags())
            cache.onBuildingElementsChanged.remove(() => this.setup())

            this._markers.forEach(mark => {
                mark.dispose()
            })

            this._markers = [];
        }

    }

    get enabled() {
        return this._enabled
    }


    /**
     * tag building elements based on the tag Visibility Mode.
     * @returns 
     */
    setTags = () => {
        switch (this._tagVisibilityMode) {
            case TagVisibilityMode.TagVisible:
                this.createTagsFromModelVisibility();
                return;
            case TagVisibilityMode.TagSelectionGroup:
                const modelViewManager = this.components.get(ModelViewManager);
                const selectedElements = modelViewManager.SelectedGroup?.elements
                if (!selectedElements) return; // or first make every thing disabled
                //console.log('setting tags', selectedElements)
                this.createTagsFromBuildingElements(selectedElements);
        }
    }


    /**
     * Tag only Visible building elements by searching the model visibility state.
     */
    private createTagsFromModelVisibility = () => {
        const cache = this.components.get(ModelCache);
        if (cache.BuildingElements) {
            // console.log('creating new markers', cache.BuildingElements)
            const allVisibleIDs = GetAllVisibleExpressIDs(cache.models())
            const allVisibleElements: BuildingElement[] = [];
            allVisibleIDs.forEach((expressIDs, modelID) => {
                allVisibleElements.push(...cache.getElementsByExpressId(expressIDs, modelID))
            })
            this.updateMarkers(allVisibleElements);
        }
    }

    /**
     * Tag only Visible building elements from args by searching the model visibility state.
     */
    private createTagsFromBuildingElements = (buildingElements: BuildingElement[]) => {
        if (buildingElements) {
            const VisibleIDsByModel = GetVisibleExpressIDs(buildingElements, this.components)
            console.log('create tags from building elements', VisibleIDsByModel)

            const cache = this.components.get(ModelCache);
            const visibleElements: BuildingElement[] = [];
            VisibleIDsByModel.forEach((expressIDs, modelID) => {
                visibleElements.push(...cache.getElementsByExpressId(expressIDs, modelID))
            })
            this.updateMarkers(visibleElements);
        }
    }

    /**
     * Filter out building elements based on the hiddenTypes collection. if hvac elements hidden then in addition search fro 
     * product codes with 'TE' and filter
     * @param buildingElements 
     * @returns 
     */
    private filterElements(buildingElements: BuildingElement[]): { filteredElements: BuildingElement[], filteredOutElements: BuildingElement[] } {

        const hiddenTypes: string[] = [];

        if (!this._configuration?.showFasteners) hiddenTypes.push(IFCMECHANICALFASTENER)
        if (!this._configuration?.showInstallations) hiddenTypes.push(IFCFLOW)

        let filteredElements = buildingElements.filter(el => !hiddenTypes.find(partialType => el.type.includes(partialType)))
        let filteredOutElements = buildingElements.filter(el => hiddenTypes.find(partialType => el.type.includes(partialType)))


        // also remove by product code in case of installations
        if (!this._configuration?.showInstallations) {
            // console.log("filtering TE elements")
            filteredElements = filteredElements.filter(el => !GetPropertyByName(el, knownProperties.ProductCode)?.value.includes("TE"))
            filteredOutElements = filteredElements.filter(el => GetPropertyByName(el, knownProperties.ProductCode)?.value.includes("TE"))
        }
        return { filteredElements, filteredOutElements };
    }


    /**
     * dispose of current markers and create new markers for each buildingElement.
     * Also handle filtering and merging if settings enabled.
     * @param buildingElements 
     */
    private updateMarkers(buildingElements: BuildingElement[]) {
        if (!this._enabled) return;
        this._markers.forEach(m => m.dispose())
        this._markers = [];

        //filterout tag types
        const filteredElements = this.filterElements(buildingElements);
        const markers = this.createMarkers(filteredElements.filteredElements);

        if (this.Configuration?.mergeFasteners) {
            console.log('merging markers: start')
            const mergedTags = this.getMergedTagsByModel(buildingElements)
            console.log('merging tags', mergedTags)

            if (mergedTags) {
                // make them into a markers and add to _markers
                const mergedMarkers = this.getNewTagForClusters(mergedTags);
                mergedMarkers.forEach(mark => markers.push(mark)
                )
            }
            console.log('merging markers: end')


        }

        this._markers = markers;
    }

    getNewTagForClusters(tagClusters: Map<string, Tag[][]>) {
        const markers: Mark[] = [];
        // make them into a markert
        tagClusters.forEach((groupedElements) => {
            //get a color by the name
            //for each group make a center and a tag
            groupedElements.forEach(group => {
                const pt = getAveragePoint(group.map(element => element.position))

                const text = `${group.length} x ${group[0].text}`;
                if (this._world?.uuid && pt) {
                    const mark = this.createMark(this._world, text, group[0].color, "material-symbols:tools-power-drill-outline");
                    mark.three.position.copy(pt);
                    mark.three.visible = true;
                    markers.push(mark);
                }
            })
        })
        return markers;
    }


    /**
     * Assuming that 
     * @param buildingElements 
     * @returns 
     */
    getMergedTagsByModel(buildingElements: BuildingElement[]) {
        if (!buildingElements) return;
        let allGroupedTags: Map<string, Tag[][]> = new Map();

        // Step 0: Group elements by Model
        this.components.get(ModelCache).GroupByModel(buildingElements).forEach((elements) => {

            const tags = elements.map(e => this._tags.get(e.GlobalID)).filter((tag): tag is Tag => tag !== undefined);
            const mergedTags = this.mergeTagsByText(tags)
            if (mergedTags) {
                Object.entries(mergedTags).forEach(([matchingName, groupOfTagClusters]) => {
                    // console.log('merge group name', value, groupOfGroups)
                    if (!allGroupedTags.has(matchingName))
                        allGroupedTags.set(matchingName, []);

                    // now create the new tag representing the merge
                    // now add to group of all tag clusters incase there were multiple models
                    groupOfTagClusters.forEach(group => allGroupedTags.get(matchingName)?.push(group))
                })
            }
        })

        console.log('tags merged by name complete', allGroupedTags)

        return allGroupedTags;

    }


    mergeTagsByText(tags: Tag[]) {

        const tagsByName = this.mapByName(tags.filter(tag => tag.type === IFCMECHANICALFASTENER));
        if (!tagsByName) {
            console.log('fasteners not found by name')
            return;
        }

        // Step 2: Group elements by distance within each name group
        const groupedElements: GroupedElements = {};

        // Step 3: search the existing groups elements distance to each new element in the same name and add to the group and break
        tagsByName.forEach((elementTags, name) => {
            groupedElements[name] = [];

            for (const tag of elementTags) {
                let added = false;
                for (const group of groupedElements[name]) {
                    for (const groupedTag of group) {

                        if (!groupedTag.position) continue;

                        const dist = tag.position?.distanceTo(groupedTag?.position)

                        // console.log('distance',dist)
                        if (dist && dist <= this._mergeDistance) {
                            group.push(tag);
                            added = true;
                            break;
                        }
                    }
                }
                if (!added) {
                    groupedElements[name].push([tag]);
                }
                //console.log("group search", groupedElements[name])
            }
        })
        return groupedElements;
    }


    mapByName(tags: Tag[]) {
        return tags.reduce((acc, element) => {
            if (!acc.has(element.text)) {
                acc.set(element.text, [])
            }
            acc.get(element.text)?.push(element)
            return acc;
        }, new Map<string, Tag[]>);
    }

    private _mergeDistance = 0.300; // 1 = 1 meter


    /**
     * generate cache of material and colors as well as grouping by type for quick look up
     * @returns 
     */
    setup() {
        const cache = this.components.get(ModelCache).BuildingElements
        if (!cache) return;
        this.setupColors(true);
        this.setupTags(cache)
    }

    /**
     * Create all tags with positions to be able to quickly get and create markers on update
     */
    setupTags(buildingElements: BuildingElement[]) {
        if (this._tags) {
            this._tags.forEach(t => t.dispose())
            this._tags = new Map();
        }

        const tags = this.createTags(buildingElements);
        this._tags = tags;
    }

    setupColors(useExisting: boolean) {
        const cache = this.components.get(ModelCache).BuildingElements
        if (!cache) return;
        if (!useExisting) {
            this._materialColor = new Map();
        }



        cache.forEach((buildingElement) => {
            const material = GetPropertyByName(buildingElement, knownProperties.Material)?.value ?? "";
            // console.log("_material", material)
            if (!this._materialColor.has(material)) {
                this._materialColor.set(material, this.generateRandomHexColor())
            }
        });
    }



    /**
     * Get a tag using the building elements, name, and center point based on its bounding box. Color based on its material.
     * @param buildingElements 
     * @returns key = buildingElement.GlobalID , value = Tag
     */
    createTags = (buildingElements: BuildingElement[]): Map<string, Tag> => {
        const models = this.components.get(ModelCache).models();
        if (this._world === null || !models) {
            console.log("Create tag failed due to no world set")
            return new Map()
        }

        const tags = new Map<string, Tag>();


        const elementsByModel = buildingElements.reduce((acc, element) => {
            if (!acc.has(element.modelID)) {
                acc.set(element.modelID, [])
            }
            acc.get(element.modelID)?.push(element)
            return acc;
        }, new Map<string, BuildingElement[]>)

        elementsByModel.forEach((elements, modelID) => {
            const model = models.find(m => m.uuid === modelID);
            if (!model) {
                console.log("failed to creat tags as no model found for", modelID, elements)
                return;
            }

            elements.forEach(element => {
                const pt = GetCenterPoint(element, model, this.components)
                if (!pt) {
                    console.log('Get Center failed: no center point found', element)
                    return;
                }

                const material = GetPropertyByName(element, knownProperties.Material)?.value ?? "";
                tags.set(element.GlobalID, new Tag(element.GlobalID, element.name, pt, this._materialColor.get(material), element.type));
            })
        })
        return tags;
    }

    /**
     * 
     * @param elements 
     * @returns key = buildingElement.GlobalID, value = new OBC.Mark
     */
    createMarkers = (elements: BuildingElement[]): Mark[] => {
        const markers: Mark[] = [];
        if (this._world === null || !elements) {
            console.log("Create tag failed due to no world set")
            return []
        }

        this.getTags(elements).forEach((tag) => {
            if (this._world && tag.position) {
                const mark = this.createMark(this._world, tag.text, tag.color, undefined);
                mark.three.position.copy(tag.position);
                mark.three.visible = true;
                markers.push(mark);
            }
        })

        return markers;
    }

    /**
     * 
     * @param elements 
     * @returns key = buildingElement.GlobalID, Value = Tag
     */
    getTags(elements: BuildingElement[]) {
        const tags: Map<string, Tag> = new Map();

        const tagsToCreate: BuildingElement[] = [];
        elements.forEach(element => {
            const tag = this._tags.get(element.GlobalID)
            if (!tag) {
                // building it
                tagsToCreate.push(element)
            } else {
                tags.set(element.GlobalID, tag)
            }
        })
        if (tagsToCreate.length > 0) {
            const newTags = this.createTags(tagsToCreate);
            newTags.forEach((tag, id) => tags.set(id, tag))
        }

        return tags;
    }

    private createMark = (world: OBC.World, text: string | null, color: string | undefined, icon: string | undefined) => {
        const label = document.createElement("bim-label")
        label.textContent = text;
        if(icon)
            label.icon = icon;
        // if (!icon) {
        //     // label.icon = "material-symbols:comment"
        //     label.icon = "ph:warning-bold"
        // }
        label.style.backgroundColor = color ?? "var(--bim-ui_bg-base)";
        label.style.color = "white";
        label.style.padding = "0.5rem"
        label.style.borderRadius = "0.5rem"
        const preview = new OBF.Mark(world, label)
        preview.visible = false
        // console.log('marker', label)

        return preview;
    }

    // Function to generate a random hex color code
    private generateRandomHexColor = (): string => {
        return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    };
}
