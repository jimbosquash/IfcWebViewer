import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as THREE from "three";
import { Tag } from "./src/Tag";

export class ModelTagger extends OBC.Component {

    static uuid = "d2802b2c-1a26-4ec6-ba2a-79e20a6b65be" as const;
    readonly list: Tag[] = []
    readonly onTagAdded = new OBC.Event<Tag>()
    
    private _enabled = false
    private _world: OBC.World | null = null
    private _previewElement: OBF.Mark | null = null
    private _hitPoint: THREE.Vector3 | null = null
    private _hitLabel: string | null = null;


    constructor(components: OBC.Components) {
        super(components)
        components.add(ModelTagger.uuid,this)
    }

    set world(world: OBC.World | null) {
        this._world = world
        if(world){
            this.createPreviewElement(world)
            this.setEvents(world,true)
        }
    }

    get world() {
        return this._world
    }

    set enabled(value: boolean) {
        this._enabled = value
        if(!value && this._previewElement) {
            this._previewElement.visible = false
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

    
    checkHitPoint = () => {
        // console.log("Checkhit point",this.enabled,this.world,this._previewElement)

        // we have the fragment ID


        // we want the express id
        if(!(this.enabled && this.world && this._previewElement)) {return}

        const raycasters = this.components.get(OBC.Raycasters)
        const fragment = this.components.get(OBC.FragmentsManager)
        fragment.getModelIdMap()
        const raycaster = raycasters.get(this.world)
        const result = raycaster.castRay()
        if(result) {
            
            if(this._hitLabel !== result.object.fragment.id)
            {
                this._hitLabel = result.object.fragment.id;
                // create new tag
                const newTag = this.createNewTag(this.world,this._hitLabel);
                this._previewElement.dispose();
                this._previewElement = newTag;
                console.log("Checkhit success:",result.object.fragment)
                console.log("Checkhit success:",result.object.fragment)

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


    private createPreviewElement = (world: OBC.World) => {
        const newTag = this.createNewTag(world,"tag name");
        this._previewElement = newTag;

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
        if(!(world.renderer && world.renderer.three.domElement.parentElement)) {
            throw new Error("Comments: your world needs a renderer!")
        }
        const worldContainer = world.renderer.three.domElement.parentElement
        console.log("setting events for comments", worldContainer)
        if(enabled) {
            worldContainer.addEventListener("mousemove", this.checkHitPoint)
            // worldContainer.addEventListener("click", this.addCommentOnPreviewPoint)
        } else {
            worldContainer.removeEventListener("mousemove", this.checkHitPoint)
            // worldContainer.removeEventListener("click", this.addCommentOnPreviewPoint)
        }
    }


    private addCommentOnPreviewPoint = () => {
        if(!(this.enabled && this._hitPoint)) return;
        const text = prompt("Comment")
        if(!(text && text.trim() !== "")) return;
        this.addTag(text,this._hitPoint);
    }
    
}