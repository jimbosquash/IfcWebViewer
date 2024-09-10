import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";
import { Mark } from "@thatopen/components-front";
import * as THREE from "three";
import { GetPropertyByName } from "../../utilities/BuildingElementUtilities";
import { GetAllVisibleExpressIDs, GetCenterPoints, getExpressIDsByModel, getFragments, GetVisibleExpressIDs, GetVisibleFragmentIdMaps as getVisibleFragmentIdMaps } from "../../utilities/IfcUtilities";
import { BuildingElement, knownProperties } from "../../utilities/types";
import { ModelCache } from "../modelCache";
import { ModelViewManager } from "../modelViewer";
import { Tag } from "./src/Tag";

export enum TagVisibilityMode {
    TagSelectionGroup = "TagSelectionGroup",
    TagVisible = "TagVisible"
}

/**
 * Responsible for generating and display marks or tags which float over a 3d element in the view port. Make
 * sure to set the world for correct use.
 */
export class ModelTagger extends OBC.Component {

    static uuid = "d2802b2c-1a26-4ec6-ba2a-79e20a6b65be" as const;
    readonly list: Tag[] = []
    readonly onTagAdded = new OBC.Event<Tag>()

    private _enabled = false
    private _world: OBC.World | null = null
    private _previewElement: OBF.Mark | null = null
    private _visible: boolean = false;
    private _materialColor: Map<string, string> = new Map<string, string>;
    private _tagVisibilityMode: TagVisibilityMode = TagVisibilityMode.TagSelectionGroup;

    /**
     * key = expressID, value = mark
     */
    private _markers: Map<number, Mark> = new Map<number, Mark>();


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


    // set visible(value: boolean) {
    //     this._visible = value;
    //     // console.log('model Tagger setting visiblity', this._markers)
    //     if (!this._markers)
    //         return;
    //     this.setVisibility();
    // }


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
        if (!value) {
            viewManager.onVisibilityUpdated.remove(() => this.setTags())
            cache.onBuildingElementsChanged.remove(() => this.setTags())
            this._markers.forEach(mark => {
                // mark.visible = false
                mark.dispose()
            })
            this._markers = new Map();
        }
        if (value) {
            viewManager.onVisibilityUpdated.add(() => this.setTags())
            cache.onBuildingElementsChanged.add(() => this.setTags())
            // set up tags 
            this.setTags()
            // this.setVisibility();
        }
    }

    get enabled() {
        return this._enabled
    }


    private setTags = () => {
        switch (this._tagVisibilityMode) {
            case TagVisibilityMode.TagVisible:
                this.createTagsFromModelVisibility();
                return;
            case TagVisibilityMode.TagSelectionGroup:
                const modelViewManager = this.components.get(ModelViewManager);
                const selectedElements = modelViewManager.SelectedGroup?.elements
                if (!selectedElements) return; // or first make every thing disabled
                console.log('setting tags', selectedElements)
                this.createTagsFromBuildingElements(selectedElements);
        }
    }




    /**
     * search three js model and find what is visible and set visibility based on that
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
            this.updateTags(allVisibleElements);
        }
    }

    /**
     * Create search three js model and find what is visible and set visibility based on that
     */
    private createTagsFromBuildingElements = (buildingElements: BuildingElement[]) => {
        const cache = this.components.get(ModelCache);
        if (cache.BuildingElements) {
            const VisibleIDsByModel = GetVisibleExpressIDs(buildingElements, this.components)
            console.log('create tags from building elements',VisibleIDsByModel)

            const visibleElements: BuildingElement[] = [];
            VisibleIDsByModel.forEach((expressIDs, modelID) => {
                visibleElements.push(...cache.getElementsByExpressId(expressIDs, modelID))
            })
            this.updateTags(visibleElements);
        }
    }

    /**
     * when model is loaded search for the center of all geometry and store it in a Map with expressIDs.
     * dispose of current tags and set tags for each buildingElement
     * @param buildingElements 
     * @returns 
     */
    private updateTags(buildingElements: BuildingElement[]) {
        if (!this._enabled) return;
        this._markers.forEach(m => m.dispose())
        const markers = this.createTags(buildingElements);
        if (markers) {
            this._markers = markers;
            console.log('new Markers set', this._markers)
        }
    }

    
    // private setVisibility = () => {
    //     switch (this._tagVisibilityMode) {
    //         case TagVisibilityMode.TagVisible:
    //             this.setVisibilityFromModel();
    //             return;
    //         case TagVisibilityMode.TagSelectionGroup:
    //             const modelViewManager = this.components.get(ModelViewManager);
    //             const selectedElements = modelViewManager.SelectedGroup?.elements
    //             if (!selectedElements) return; // or first make every thing disabled
    //             this.setVisibilityFromElements(selectedElements);
    //     }
    // }

    // /**
    //  * Update visibility based on input BuildingElements enabled visibility for only tags with an expressID of input building Elements
    //  * @param buildingElements 
    //  */
    // private updateVisible(buildingElements: BuildingElement[]) {
    //     if (!this.enabled) return;
    //     //set up markers for visible things
    //     // console.log('new visibility change', this._markers, buildingElements)

    //     this._markers.forEach((value, key) => {
    //         const visSet = buildingElements.find(element => element.expressID === key);
    //         value.visible = visSet !== undefined;
    //     })
    // }

        /**
     * search three js model and find what is visible and set visibility based on that
     */
        //  private setVisibilityFromModel = () => {
        //     const cache = this.components.get(ModelCache);
        //     if (cache.BuildingElements) {
        //         // console.log('creating new markers', cache.BuildingElements)
        //         const allVisibleIDs = GetAllVisibleExpressIDs(cache.models())
        //         const allVisibleElements: BuildingElement[] = [];
        //         allVisibleIDs.forEach((expressIDs, modelID) => {
        //             allVisibleElements.push(...cache.getElementsByExpressId(expressIDs, modelID))
        //         })
        //         this.updateVisible(allVisibleElements);
        //     }
        // }
    
    /**
     * search three js model and find what is visible and set visibility based on that
     */
    //  private setVisibilityFromElements = (selectedElements: BuildingElement[]) => {
    //     const res = getVisibleFragmentIdMaps(selectedElements, this.components)
    //     if (!res) return;

    //     let allVisibleElements: BuildingElement[] = [];

    //     res.forEach(fragMap => {
    //         const vals = Object.values(fragMap)
    //         const expressIDs = Object.values(fragMap).flatMap(fm => [...fm]);
    //         const t = selectedElements.filter(e => expressIDs.find(id => e.expressID === id))
    //         console.log('visible elements ', t, expressIDs, vals, fragMap, selectedElements)

    //         allVisibleElements = [...allVisibleElements, ...t]
    //     })

    //     console.log('visible elements to tag', allVisibleElements, res)
    //     this.updateVisible(allVisibleElements);
    // }


    addTag(text: string, position?: THREE.Vector3) {
        const comment = new Tag(text)
        comment.position = position
        this.list.push(comment)
        this.onTagAdded.trigger(comment);
        return comment;
    }


    /**
     * key = express id, value = new OBC.Mark
     * @param elements 
     * @returns 
     */
    createTags = (elements: BuildingElement[]): Map<number, Mark> => {
        const cache = this.components.get(ModelCache)
        // const marker = this.components.get(OBF.Marker)
        const allMarks = new Map<number, Mark>();
        if (this._world === null) {
            console.log("Create tag failed due to no world set")
            return new Map()
        }
        // console.log("model", cache.models())
        const centers = GetCenterPoints(cache.models(), elements, this.components);

        // Step 1: Group BuildingElements by Material
        const groupedByMaterial = new Map<string, Map<BuildingElement, Tag>>();

        centers.forEach((tag, buildingElement) => {

            const material = GetPropertyByName(buildingElement, knownProperties.Material)?.value ?? "";
            if (!groupedByMaterial.has(material)) {
                groupedByMaterial.set(material, new Map<BuildingElement, Tag>);
            }
            groupedByMaterial.get(material)?.set(buildingElement, tag);
        });

        groupedByMaterial.forEach((elements, material) => {
            if (!this._materialColor.has(material)) {
                const randomColor = this.generateRandomHexColor();
                this._materialColor.set(material, randomColor)
            }
            const color = this._materialColor.get(material)
            elements.forEach((tag) => { tag.color = color })
        });


        centers.forEach((tag, element) => {

            console.log('createmarker')
            if (this._world?.uuid && tag.position) {
                const mark = this.createNewTag(this._world, tag.text, tag.color);
                mark.three.position.copy(tag.position);
                mark.three.visible = true;
                console.log('createmarker', mark)
                allMarks.set(element.expressID, mark);
            }
        })

        return allMarks;
    }

    private createNewTag = (world: OBC.World, label: string | null, color: string | undefined) => {
        const icon = document.createElement("bim-label")
        icon.textContent = label;
        //icon.icon = "material-symbols:comment"
        // icon.style.backgroundColor = "var(--bim-ui_bg-base)"
        icon.style.backgroundColor = color ?? "var(--bim-ui_bg-base)";
        icon.style.color = "white";
        icon.style.padding = "0.5rem"
        icon.style.borderRadius = "0.5rem"
        const preview = new OBF.Mark(world, icon)
        preview.visible = false
        return preview;
    }

    // Function to generate a random hex color code
    private generateRandomHexColor = (): string => {
        return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    };
}