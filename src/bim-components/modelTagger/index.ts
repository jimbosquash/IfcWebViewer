import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import { Mark } from "@thatopen/components-front";
import * as THREE from "three";
import { GetCenterPoints } from "../../utilities/IfcUtilities";
import { BuildingElement } from "../../utilities/types";
import { ModelCache } from "../modelCache";
import { ModelViewManager } from "../modelViewer";
import { Tag } from "./src/Tag";

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
    private _hitLabel: string | null = null;
    private _visible: boolean = false;

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
        if (world) {
            this.setEvents(world, true)
        }
    }


    get world() {
        return this._world
    }


    set visible(value: boolean) {
        this._visible = value;
        // console.log('model Tagger setting visiblity', this._markers)
        if (!this._markers)
            return;

        this._markers.forEach(mark => mark.visible = value)
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
        if (!value) {
            viewManager.onVisibilityUpdated.remove((data) => this.updateVisible(data))
            cache.onBuildingElementsChanged.remove((data) => this.updateTags(data))
            this._markers.forEach(mark => mark.visible = false)
        }
        if (value) {
            viewManager.onVisibilityUpdated.add((data) => this.updateVisible(data))
            cache.onBuildingElementsChanged.add((data) => this.updateTags(data))

            // create new markers
            if (cache.BuildingElements) {
                // console.log('creating new markers', cache.BuildingElements)
                this.updateTags(cache.BuildingElements)
            }

        }
    }

    get enabled() {
        return this._enabled
    }


    /**
     * when model is loaded search for the center of all geometry and store it in a Map with expressIDs
     * @param buildingElements 
     * @returns 
     */
    private updateTags(buildingElements: BuildingElement[]) {
        if (!this._enabled) return;
        const markers = this.createTags(buildingElements);
        if (markers) {
            this._markers = markers;
            console.log('new Markers set', this._markers)
        }
    }


    private updateVisible(buildingElements: BuildingElement[]) {
        if (!this.enabled) return;
        //set up markers for visible things
        console.log('new visibility change', this._markers, buildingElements)

        this._markers.forEach((value, key) => {
            const visSet = buildingElements.find(element => element.expressID === key);
            if (visSet) {
                value.visible = true;
                // console.log('vis found', entry[1].id)
            } else
                value.visible = false;
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

        [...centers].forEach((element) => {
            // console.log('createmarker')
            if (this._world?.uuid && element[1].position) {
                const mark = this.createNewTag(this._world, element[1].text);
                mark.three.position.copy(element[1].position);
                mark.three.visible = true;
                console.log('createmarker', mark)
                allMarks.set(element[0].expressID, mark);
            }
        });
        return allMarks;
    }


    private createNewTag = (world: OBC.World, label: string | null) => {
        const icon = document.createElement("bim-label")
        icon.textContent = label;
        //icon.icon = "material-symbols:comment"
        icon.style.backgroundColor = "var(--bim-ui_bg-base)"
        icon.style.padding = "0.5rem"
        icon.style.borderRadius = "0.5rem"
        const preview = new OBF.Mark(world, icon)
        preview.visible = false
        return preview;
    }


    // related to floating tag point and may be removable


    private setEvents(world: OBC.World, enabled: boolean) {
        if (!(world.renderer && world.renderer.three.domElement.parentElement)) {
            throw new Error("Comments: your world needs a renderer!")
        }
        const worldContainer = world.renderer.three.domElement.parentElement
        console.log("setting events for comments", worldContainer)
        if (enabled) {
            worldContainer.addEventListener("mousemove", this.checkHitPointAndSetTagName)
            // worldContainer.addEventListener("click", this.addCommentOnPreviewPoint)
        } else {
            worldContainer.removeEventListener("mousemove", this.checkHitPointAndSetTagName)
            // worldContainer.removeEventListener("click", this.addCommentOnPreviewPoint)
        }
    }

    
    private checkHitPointAndSetTagName = () => {
        // we want the express id
        if (!(this.enabled && this.world && this._previewElement)) { return }
        const raycasters = this.components.get(OBC.Raycasters)
        const cache = this.components.get(ModelCache)
        const raycaster = raycasters.get(this.world)
        const result = raycaster.castRay()
        if (result) {

            if (this._hitLabel !== result.object.fragment.id) {
                this._hitLabel = result.object.fragment.id;

                const firstElement = result.object.fragment.ids.values().next().value as number | undefined;

                if (firstElement) {
                    const element = cache.getElementByExpressId(firstElement, result.object.fragment.group.uuid)
                    this._hitLabel = element?.name ?? null;
                    const newTag = this.createNewTag(this.world, this._hitLabel);
                    this._previewElement.dispose();
                    this._previewElement = newTag;
                    console.log("Checkhit success modelID:", element)
                    // this.getAllElementsTags();
                }

            }
            this._previewElement.visible = true
            this._previewElement.three.position.copy(result.point)
            this._hitPoint = result.point




        } else {
            this._previewElement.visible = false
            this._hitPoint = null
            this._hitLabel = null;
        }


    }
}