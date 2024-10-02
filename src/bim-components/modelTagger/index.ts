import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import { Mark } from "@thatopen/components-front";
import { GetPropertyByName } from "../../utilities/BuildingElementUtilities";
import { GetAllVisibleExpressIDs, GetVisibleExpressIDs } from "../../utilities/IfcUtilities";
import { BuildingElement, knownProperties } from "../../utilities/types";
import { ModelCache } from "../modelCache";
import { ModelViewManager } from "../modelViewer";
import { markProperties } from "./src/Tag";
import { getAveragePoint } from "../../utilities/threeUtils";
import { Line, Vector3 } from "three";
import * as THREE from "three";
import { IFCFLOW } from "../hvacViewer";
import { ConfigManager, ConfigSchema } from "../../utilities/ConfigManager";

// key = name of element. first array = an array of matching names with arrays of tags grouped by distance
interface GroupedElements {
    [key: string]: markProperties[][];
}


export enum TagVisibilityMode {
    TagSelectionGroup = "TagSelectionGroup",
    TagVisible = "TagVisible"
}

export interface MarkerConfiguration {
    showFasteners: boolean,
    showInstallations: boolean,
    mergeFasteners: boolean,
    labelStyle: "Code" | "Name";
}

const markerConfigSchema: ConfigSchema<MarkerConfiguration> = {
    showFasteners: { defaultValue: true },
    showInstallations: { defaultValue: true },
    mergeFasteners: { defaultValue: false },
    labelStyle: { defaultValue: "Code" },

    // zoomLevel: { 
    //     defaultValue: 1, 
    //     validate: (value) => value >= 0.1 && value <= 10 
    // }
};


const IFCMECHANICALFASTENER: string = "IFCMECHANICALFASTENER";

/**
 * Responsible for generating and display marks or tags which float over a 3d element in the view port. Make
 * sure to set the world for correct use.
 */
export class ModelTagger extends OBC.Component {

    static uuid = "d2802b2c-1a26-4ec6-ba2a-79e20a6b65be" as const;
    readonly onTagAdded = new OBC.Event<markProperties>()

    private _enabled = false

    private _world: OBC.World | null = null
    private _previewElement: OBF.Mark | null = null
    private _visible: boolean = false;
    private _colorMap: Map<string, string> = new Map(); // key = name or any string, value = color as hex
    private _tagVisibilityMode: TagVisibilityMode = TagVisibilityMode.TagSelectionGroup;

    private _configManager = new ConfigManager<MarkerConfiguration>(markerConfigSchema, 'markerConfig');


    readonly onConfigurationSet = new OBC.Event<MarkerConfiguration>()

    get Configuration() {
        return this._configManager;
    }

    /**
     * key = buildingElement.GlobalID, value = mark
     */
    private _markers: Mark[] = [];

    /**
     * key = buildingElement.GlobalID, value = tag
     */
    private _markerProps: Map<string, markProperties> = new Map();

    private _lines: Line[] = [];


    constructor(components: OBC.Components) {
        super(components)
        components.add(ModelTagger.uuid, this)
        this._configManager.addEventListener('configChanged', (event: Event) => {
            console.log('configChanged', event)
            if (this.enabled)
                this.setMarkerProps()

        })

        // markerConfigManager.addEventListener('configChanged', (event: Event) => {
        //         const { key, value, configName } = (event as CustomEvent).detail;
        //         console.log(`Config ${configName} changed: ${String(key)} = ${value}`);
        //     });
    }


    set world(world: OBC.World | null) {
        this._world = world
    }


    get world() {
        return this._world
    }


    get visible() { return this._visible }


    get colorMap() { return this._colorMap }


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
            viewManager.onVisibilityUpdated.add(() => this.setMarkerProps())
            cache.onBuildingElementsChanged.add(() => this.setMarkerProps())
            cache.onBuildingElementsChanged.add(() => this.setup())
            // set up tags 
            if (this._colorMap.size === 0 || this._markerProps.size === 0) {
                this.setup()
            }
            this.setMarkerProps()
        }
        if (!value) {
            viewManager.onVisibilityUpdated.remove(() => this.setMarkerProps())
            cache.onBuildingElementsChanged.remove(() => this.setMarkerProps())
            cache.onBuildingElementsChanged.remove(() => this.setup())

            this._markers.forEach(mark => {
                mark.dispose()
            })

            this.removeLines()

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
    setMarkerProps = () => {
        switch (this._tagVisibilityMode) {
            case TagVisibilityMode.TagVisible:
                this.createMarkerPropsFromModelVisibility();
                return;
            case TagVisibilityMode.TagSelectionGroup:
                const modelViewManager = this.components.get(ModelViewManager);
                const selectedElements = modelViewManager.SelectedGroup?.elements
                if (!selectedElements) return; // or first make every thing disabled
                //console.log('setting tags', selectedElements)
                this.createMarkerPropsFromBuildingElements(selectedElements);
        }
    }


    /**
     * Tag only Visible building elements by searching the model visibility state.
     */
    private createMarkerPropsFromModelVisibility = () => {
        const cache = this.components.get(ModelCache);
        if (cache.buildingElements) {
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
    private createMarkerPropsFromBuildingElements = (buildingElements: BuildingElement[]) => {
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

        //if (!this._configuration?.showFasteners) hiddenTypes.push(IFCMECHANICALFASTENER)
        hiddenTypes.push(IFCMECHANICALFASTENER)
        if (!this._configManager.get("showInstallations")) hiddenTypes.push(IFCFLOW)

        let filteredElements = buildingElements.filter(el => !hiddenTypes.find(partialType => el.type.includes(partialType)))
        let filteredOutElements = buildingElements.filter(el => hiddenTypes.find(partialType => el.type.includes(partialType)))


        // also remove by product code in case of installations
        if (!this._configManager.get("showInstallations")) {
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
        this.removeLines();

        //filterout tag types
        const filteredElements = this.filterElements(buildingElements);
        const markers = this.createMarkers(filteredElements.filteredElements);


        if (this._configManager.get("showFasteners") && !this._configManager.get('mergeFasteners')) {
            //set them up for just icon
            let fasteners = buildingElements.filter(el => el.type.includes(IFCMECHANICALFASTENER))
            const iconMarkers = this.createIconMarkers(fasteners, "material-symbols:tools-power-drill-outline");
            iconMarkers.forEach(mark => markers.push(mark))
        }


        if (this._configManager.get('showFasteners') && this._configManager.get('mergeFasteners')) {
            console.log('merging markers: start')
            const mergedTags = this.getMergedMarkerPropsByModel(buildingElements)
            console.log('merging tags', mergedTags)

            if (mergedTags) {
                // make them into a markers and add to _markers
                const mergedMarkers = this.getNewMarkerPropsForClusters(mergedTags);

                mergedMarkers.forEach(mark => markers.push(mark)
                )
            }
            console.log('merging markers: end')


        }

        this._markers = markers;
    }

    getLines(mergeTagPosition: Vector3, tagPositions: Vector3[]) {
        const material = new THREE.LineBasicMaterial({ color: "white" });

        tagPositions.forEach(pos => {
            const geometry = new THREE.BufferGeometry().setFromPoints([
                mergeTagPosition,
                pos,
            ]);
            const line = new THREE.Line(geometry, material);
            this._lines.push(line);
            this._world?.scene.three.add(line);
        })
    }

    getMarkerLines(mergeTag: markProperties, children: markProperties[]) {
        if (mergeTag.position === undefined || !children) return;

        const material = new THREE.LineBasicMaterial({ color: mergeTag.color });

        const cPos = children.map(element => element.position).filter((pos): pos is Vector3 => pos !== undefined)

        cPos.forEach(pos => {
            if (mergeTag.position === undefined)
                return;
            const geometry = new THREE.BufferGeometry().setFromPoints([
                mergeTag.position,
                pos,
            ]);
            const line = new THREE.Line(geometry, material);
            this._lines.push(line);
            this._world?.scene.three.add(line);
        })
    }

    removeLines() {
        const scene = this._world?.scene.three;
        if (!scene) return;

        this._lines.forEach(line => {
            scene.remove(line)
            if (line.geometry) line.geometry.dispose();
            // if (line.material) line.material.dispose();
        })

        this._lines.length = 0; // Clear the array
    }

    createFastenerMarks() {

    }

    getNewMarkerPropsForClusters(tagClustersByName: Map<string, markProperties[][]>) {
        const markers: Mark[] = [];
        // make them into a markert
        tagClustersByName.forEach((tagClusters) => {

            //generate new Tag 

            //for each group make a new merged tag with new center
            tagClusters.forEach((tagCluster, index) => {
                const pt = getAveragePoint(tagCluster.map(element => element.position))
                if (!pt) {
                    tagCluster.forEach(e => {
                        const m = this.createMarkFromProps(e.text, e.color, e.position);
                        if (m) markers.push(m)
                    })
                } else {
                    const text = `${tagCluster.length} x ${tagCluster[0].text}`;
                    const newCenter = new Vector3(pt.x, pt.y + 0.5, pt.z);
                    const mergeTag = new markProperties(
                        `MergeTag-${index}`,
                        text,
                        newCenter,
                        tagCluster[0].color,
                        tagCluster[0].type)
                    const mark = this.createMarkFromProps(mergeTag.text, mergeTag.color, mergeTag.position, "material-symbols:tools-power-drill-outline")
                    if (mark) {
                        markers.push(mark)
                        //this.getMarkerLines(mergeTag, tagCluster)
                    }

                    tagCluster.forEach(t => {
                        const m = this.createMarkFromProps('', t.color, t.position);
                        if (m)
                            markers.push(m);

                    })

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
    getMergedMarkerPropsByModel(buildingElements: BuildingElement[]) {
        if (!buildingElements) return;
        let allGroupedTags: Map<string, markProperties[][]> = new Map();

        // Step 0: Group elements by Model
        this.components.get(ModelCache).GroupByModel(buildingElements).forEach((elements) => {

            const tags = elements.map(e => this._markerProps.get(e.GlobalID)).filter((tag): tag is markProperties => tag !== undefined);
            const mergedTags = this.mergeMarkerPropsByText(tags)
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


    mergeMarkerPropsByText(tags: markProperties[]) {

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

            let nameColor = this._colorMap.get(name)
            // create color
            if (!nameColor) {
                this._colorMap.set(name, this.generateRandomHexColor())
                nameColor = this._colorMap.get(name);
            }

            for (const tag of elementTags) {
                if (nameColor) {
                    tag.color = nameColor;
                }
                let added = false;
                // find if this tag exists in any group and if so then continue
                for (const group of groupedElements[name]) {
                    if (group.find(gTag => gTag.globalID === tag.globalID)) {
                        added = true;
                        console.log('found tag already in cluster', tag, group)
                        continue;
                    }
                }
                if (added) {
                    continue;
                }
                // now add it if not
                for (const group of groupedElements[name]) {

                    for (const clusteredTag of group) {
                        if (!clusteredTag.position) continue;
                        const dist = tag.position?.distanceTo(clusteredTag?.position)
                        // console.log('distance',dist)
                        if (dist && dist <= this._mergeDistance) {
                            group.push(tag);
                            added = true;
                            break;
                        }
                    }
                    if (added)
                        break;
                }
                if (!added) {
                    groupedElements[name].push([tag]);
                }
                //console.log("group search", groupedElements[name])
            }
        })
        return groupedElements;
    }


    mapByName(markProps: markProperties[]) {
        return markProps.reduce((acc, element) => {
            if (!acc.has(element.text)) {
                acc.set(element.text, [])
            }
            acc.get(element.text)?.push(element)
            return acc;
        }, new Map<string, markProperties[]>);
    }

    private _mergeDistance = 0.450; // 1 = 1 meter


    /**
     * generate cache of material and colors as well as grouping by type for quick look up
     * @returns 
     */
    setup() {
        const cache = this.components.get(ModelCache).buildingElements
        if (!cache) return;
        this.setupColors(true);
        this.setupMarkerProps(cache)
    }

    /**
     * Create all tags with positions to be able to quickly get and create markers on update
     */
    setupMarkerProps(buildingElements: BuildingElement[]) {
        if (this._markerProps) {
            this._markerProps.forEach(t => t.dispose())
            this._markerProps = new Map();
        }

        const tags = markProperties.create(this.components, buildingElements);
        this._markerProps = tags;
    }

    setupColors(useExisting: boolean) {
        const cache = this.components.get(ModelCache).buildingElements
        if (!cache) return;
        if (!useExisting) {
            this._colorMap = new Map();
        }



        cache.forEach((buildingElement) => {
            const material = GetPropertyByName(buildingElement, knownProperties.Material)?.value ?? "";
            // console.log("_material", material)
            if (!this._colorMap.has(material)) {
                this._colorMap.set(material, this.generateRandomHexColor())
            }
        });
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
        // change label to style of users choice code or name (maybe theres a much more efficient way to do this)
        const labelStyle = this._configManager.get('labelStyle');

        this.getMarkProps(elements).forEach((element, tag) => {
            let label = tag.text;
            if (labelStyle === "Code") {
                let code = GetPropertyByName(element, knownProperties.ProductCode)?.value;
                const mat = GetPropertyByName(element, knownProperties.Material)?.value ?? "";
                if(mat && code) code = `${mat}_${code}`

                if (code) label = code;
            }
            const mark = this.createMarkFromProps(label, tag.color, tag.position)
            if (mark) {
                markers.push(mark)
            }

        })

        return markers;
    }


    /**
     * 
     * @param elements 
     * @returns key = buildingElement.GlobalID, value = new OBC.Mark
     */
    createIconMarkers = (elements: BuildingElement[], icon: string): Mark[] => {
        const markers: Mark[] = [];
        if (this._world === null || !elements) {
            console.log("Create tag failed due to no world set")
            return []
        }

        this.getMarkProps(elements).forEach((element, tag) => {
            const mark = this.createMarkFromProps('', tag.color, tag.position, icon)
            if (mark) {
                markers.push(mark)
            }

        })

        return markers;
    }



    createMarkFromProps(text: string, color?: string, position?: Vector3, icon?: string) {
        if (this._world && position) {
            const mark = this.createMark(this._world, text, color, icon);
            mark.three.position.copy(new Vector3(position.x, position.y, position.z))
            mark.three.visible = true;
            return mark;
        }
    }

    /**
     * 
     * @param elements 
     * @returns key = buildingElement.GlobalID, Value = Tag
     */
    getMarkProps(elements: BuildingElement[]) {
        const tags: Map<markProperties, BuildingElement> = new Map();

        const tagsToCreate: BuildingElement[] = [];
        elements.forEach(element => {
            const tag = this._markerProps.get(element.GlobalID)
            if (!tag) {
                // building it
                tagsToCreate.push(element)
            } else {
                tags.set(tag, element)
            }
        })
        if (tagsToCreate.length > 0) {
            const newTags = markProperties.create(this.components, tagsToCreate);
            newTags.forEach((tag, id) => {
                const e = elements.find(e => e.GlobalID === id);
                if (e)
                    tags.set(tag, e)
            })
        }

        return tags;
    }

    private createMark = (world: OBC.World, text: string | null, color: string | undefined, icon: string | undefined) => {
        const label = document.createElement("bim-label")
        label.textContent = text;
        if (icon)
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

    private dispose = () => {

    }
}
