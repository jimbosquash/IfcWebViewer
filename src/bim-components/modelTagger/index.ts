import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import { Mark } from "@thatopen/components-front";
import * as THREE from "three";
import { GetAllVisibleExpressIDs, GetCenterPoints } from "../../utilities/IfcUtilities";
import { ModelCache } from "../modelCache";
import { Tag } from "./src/Tag";

export class ModelTagger extends OBC.Component {

    // when model is loaded search for the center of all geometry and store it in a Map with expressIDs
    static uuid = "d2802b2c-1a26-4ec6-ba2a-79e20a6b65be" as const;
    readonly list: Tag[] = []
    readonly onTagAdded = new OBC.Event<Tag>()

    private _enabled = false
    private _world: OBC.World | null = null
    private _previewElement: OBF.Mark | null = null
    private _hitPoint: THREE.Vector3 | null = null
    private _hitLabel: string | null = null;
    private _visible: boolean = false;

    private _markers: Set<Mark> = new Set<Mark>();


    constructor(components: OBC.Components) {
        super(components)
        components.add(ModelTagger.uuid, this)
    }

    set world(world: OBC.World | null) {
        this._world = world
        if (world) {
            this.createPreviewElement(world)
            this.setEvents(world, true)
        }
    }

    get visible() { return this._visible}

    set visible(value:boolean) {
        this._visible = value;
        if(!this._markers)
            return;
        this._markers.forEach(mark => mark.visible = value)
    }

    get world() {
        return this._world
    }

    set enabled(value: boolean) {
        this._enabled = value
        if (!value && this._previewElement) {
            this._previewElement.visible = false
        }
        if (value) {
            //set up all markers
            if( this._markers)
            {
                this._markers.forEach(m => m.dispose())
            }
            const newMarkers = this.getAllElementsTags();
            if(newMarkers)
                this._markers = newMarkers;
        }
    }

    get enabled() {
        return this._enabled
    }




    addTag(text: string, position?: THREE.Vector3) {
        const comment = new Tag(text)
        comment.position = position
        this.list.push(comment)
        this.onTagAdded.trigger(comment);
        return comment;
    }

    getAllElementsTags = () => {
        const cache = this.components.get(ModelCache)
        // const marker = this.components.get(OBF.Marker)
        const allMarks = new Set<Mark>();
        if (this._world === null) return;
        // console.log("model", cache.models())
        const allVisibleElements = GetAllVisibleExpressIDs(cache.models())
        const centers = GetCenterPoints(cache.models(), allVisibleElements, this.components);

        [...centers].forEach(element => {
            // console.log('createmarker')
            if (this._world?.uuid && element.position) {
               const mark = this.createNewTag(this._world,element.text);
               mark.three.position.copy(element.position);
               mark.three.visible = true;
               console.log('createmarker',mark)
               allMarks.add(mark);
            }
        });
        return allMarks;
    }


    checkHitPointAndSetTagName = () => {
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

    private getHitTargetsName() {

    }


    private createPreviewElement = (world: OBC.World) => {
        const newTag = this.createNewTag(world, "tag name");
        this._previewElement = newTag;

    }
    private createNewTagStyle = (world: OBC.World,label: string | null) => {
        const icon = document.createElement("bim-label")
        icon.textContent = label;
        //icon.icon = "material-symbols:comment"
        icon.style.backgroundColor = "var(--bim-ui_bg-base)"
        icon.style.padding = "0.5rem"
        icon.style.borderRadius = "0.5rem"
        const preview = new OBF.Mark(world, icon)
        return icon;
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


    private addCommentOnPreviewPoint = () => {
        if (!(this.enabled && this._hitPoint)) return;
        const text = prompt("Comment")
        if (!(text && text.trim() !== "")) return;
        this.addTag(text, this._hitPoint);
    }

}