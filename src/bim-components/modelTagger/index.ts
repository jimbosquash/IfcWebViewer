import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";
import { Mark } from "@thatopen/components-front";
import * as THREE from "three";
import { GetPropertyByName } from "../../utilities/BuildingElementUtilities";
import { GetAllVisibleExpressIDs, GetCenterPoint, getExpressIDsByModel, getFragments, GetVisibleExpressIDs, GetVisibleFragmentIdMaps as getVisibleFragmentIdMaps } from "../../utilities/IfcUtilities";
import { BuildingElement, knownProperties } from "../../utilities/types";
import { ModelCache } from "../modelCache";
import { ModelViewManager } from "../modelViewer";
import { Tag } from "./src/Tag";
import { IfcCategories, IfcElements } from "@thatopen/components";

export enum TagVisibilityMode {
    TagSelectionGroup = "TagSelectionGroup",
    TagVisible = "TagVisible"
}

interface TaggerConfiguration {
    showFasteners: boolean,
    showInstallations: boolean,
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
    readonly list: Tag[] = []
    readonly onTagAdded = new OBC.Event<Tag>()

    private _enabled = false
    private _world: OBC.World | null = null
    private _previewElement: OBF.Mark | null = null
    private _visible: boolean = false;
    private _materialColor: Map<string, string> = new Map();
    private _groupByType: Map<string, Number[]> = new Map();
    private _typesNotVisible: string[] = [IFCMECHANICALFASTENER]
    private _tagVisibilityMode: TagVisibilityMode = TagVisibilityMode.TagSelectionGroup;
    private _configuration?: TaggerConfiguration = {
        showFasteners: false,
        showInstallations: false,
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
        const tagger = this.components.get(OBF.Marker)
        tagger.threshold = 10;

        // todo: remove to other area
        if (!value && this._previewElement) {
            this._previewElement.visible = false
        }

        // add or remove listeners to change visibility and marker set
        if (!value) {
            viewManager.onVisibilityUpdated.remove(() => this.setTags())
            cache.onBuildingElementsChanged.remove(() => this.setTags())
            this._markers.forEach(mark => {
                mark.dispose()
            })
            tagger.dispose();


            this._markers = new Map();
        }
        if (value) {
            viewManager.onVisibilityUpdated.add(() => this.setTags())
            cache.onBuildingElementsChanged.add(() => this.setTags())
            // set up tags 
            this.setup()
            this.setTags()

            // this.setVisibility();
        }
    }

    get enabled() {
        return this._enabled
    }


    setTags = () => {
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
            console.log('create tags from building elements', VisibleIDsByModel)

            const visibleElements: BuildingElement[] = [];
            VisibleIDsByModel.forEach((expressIDs, modelID) => {
                visibleElements.push(...cache.getElementsByExpressId(expressIDs, modelID))
            })
            this.updateTags(visibleElements);
        }
    }

    private filterElements(buildingElements: BuildingElement[]) {

        const hiddenTypes: string[] = [];

        if (!this._configuration?.showFasteners) hiddenTypes.push(IFCMECHANICALFASTENER)
        if (!this._configuration?.showInstallations) hiddenTypes.push(IFCFLOW)

        let filteredElements = buildingElements.filter(el => !hiddenTypes.find(partialType => el.type.includes(partialType)))

        // also remove by product code in case of installations
        if (!this._configuration?.showInstallations) {
            console.log("filtering TE elements")
            filteredElements = filteredElements.filter(el => !GetPropertyByName(el, knownProperties.ProductCode)?.value.includes("TE"))
        }
        return filteredElements;
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

        //filterout tag types
        const filteredElements = this.filterElements(buildingElements);

        const markers = this.createMarkers(filteredElements);
        const tags = this.createTags(filteredElements);

        const tagger = this.components.get(OBF.Marker)
        const world = this.components.get(ModelCache).world;
        const cache = this.components.get(ModelCache);
        const classifier = this.components.get(OBC.Classifier);
        classifier.byEntity(cache.models()[0])
        console.log("classifed types", classifier.list.entities)

        // getElementByFragmentIdMap
        // get all building elements based on this list by either making idmap or expressIDS
        tagger.dispose();

        if (!world) return;
        tags.forEach((tag, element) => {
            const key = tagger.create(world, tag.text, tag.position ?? new THREE.Vector3, false)
            if (key) {
                // get marker from id
                const mark = markers.get(element.expressID)
                if (mark) {
                    const markerByWorld = tagger.list.get(world.uuid)
                    if (!markerByWorld || !markerByWorld.has(key)) return;

                    const existingMarker = markerByWorld.get(key)
                    const oldMarker = existingMarker?.label;
                    if (!existingMarker) return;
                    markerByWorld.set(key, {
                        merged: existingMarker.merged,
                        label: mark,
                        key: key,
                        static: existingMarker.static,
                        type: existingMarker.type
                    })

                    oldMarker?.dispose();
                }

            }

        })
    }


    addTag(text: string, position?: THREE.Vector3) {
        const comment = new Tag(text)
        comment.position = position
        this.list.push(comment)
        this.onTagAdded.trigger(comment);
        return comment;
    }

    /**
     * generate cache of material and colors as well as grouping by type for quick look up
     * @returns 
     */
    setup() {
        const cache = this.components.get(ModelCache).BuildingElements
        if (!cache) return;

        const groupedByType = new Map<string, Number[]>();


        this.setupColors(true);
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
     * key = express id, value = new OBC.Mark
     * @param elements 
     * @returns 
     */
    createTags = (elements: BuildingElement[]): Map<BuildingElement, Tag> => {
        const cache = this.components.get(ModelCache)
        if (this._world === null) {
            console.log("Create tag failed due to no world set")
            return new Map()
        }
        const centers = this.GetCenterPoints(cache.models(), elements, this.components);

        return centers;
    }

    GetCenterPoints(models: FRAGS.FragmentsGroup[], buildingElements: BuildingElement[], components: OBC.Components): Map<BuildingElement, Tag> {

        const tags = new Map<BuildingElement, Tag>();

        buildingElements.forEach((buildingElement) => {
            const model = models.find(m => m.uuid === buildingElement.modelID);
            if (!model) {
                console.log('Get Center failed: no model found', buildingElement.modelID)
                return;
            }
            const center = GetCenterPoint(buildingElement, model, components);
            if (!center) {
                console.log('Get Center failed: no center point found', buildingElement)
                return;
            }
            const material = GetPropertyByName(buildingElement, knownProperties.Material)?.value ?? "";
            tags.set(buildingElement, new Tag(buildingElement.name, center, this._materialColor.get(material)));
        })
        return tags;
    }

    /**
     * key = express id, value = new OBC.Mark
     * @param elements 
     * @returns 
     */
    createMarkers = (elements: BuildingElement[]): Map<number, Mark> => {
        const cache = this.components.get(ModelCache)
        // const marker = this.components.get(OBF.Marker)
        const allMarks = new Map<number, Mark>();
        if (this._world === null) {
            console.log("Create tag failed due to no world set")
            return new Map()
        }
        const centers = this.createTags(elements)

        centers.forEach((tag, element) => {

            // console.log('createmarker')
            if (this._world?.uuid && tag.position) {
                const mark = this.createNewMark(this._world, tag.text, tag.color);
                mark.three.position.copy(tag.position);
                mark.three.visible = true;
                // console.log('createmarker', mark)
                allMarks.set(element.expressID, mark);
            }
        })

        return allMarks;
    }

    private createNewMark = (world: OBC.World, label: string | null, color: string | undefined) => {
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