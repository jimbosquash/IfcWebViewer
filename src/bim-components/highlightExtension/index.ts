import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as THREE from "three";
import { GetPropertyByName } from "../../utilities/BuildingElementUtilities";
import { BuildingElement, knownProperties } from "../../utilities/types";
import { ModelCache } from "../modelCache";
import { ModelTagger } from "../modelTagger";
import { ModelViewManager } from "../modelViewer";

export class HighlightExtension extends OBC.Component {

    static uuid = "6b198ead-9d53-4849-8bc7-019dd8d8a81f" as const;

    private _enabled = false
    private _world: OBC.World | null = null
    private _previewElement: OBF.Mark | null = null
    private _hitPoint: THREE.Vector3 | null = null
    private _hitLabel: string | null = null;

    constructor(components: OBC.Components) {
        super(components)
        components.add(HighlightExtension.uuid, this)
    }

    set world(world: OBC.World | null) {
        this._world = world
        if (world) {
            this.createPreviewElement(world, null)
            this.setEvents(world, true)
        }
    }

    get world() {
        return this._world
    }

    set enabled(value: boolean) {
        this._enabled = value
        if (!value && this._previewElement) {
            this._previewElement.visible = false
        }
    }

    get enabled() {
        return this._enabled
    }


    checkHitPoint = () => {

        if (!(this.enabled && this.world && this._previewElement)) { return }
        const raycasters = this.components.get(OBC.Raycasters)
        const raycaster = raycasters.get(this.world)
        const result = raycaster.castRay()
        const ray = raycaster.three.ray.direction;
        if (result) {
            this._previewElement.visible = true
            this._previewElement.three.position.copy(result.point)
            this._previewElement.three.position.add(ray)
            this._hitPoint = result.point
        } else {
            this._previewElement.visible = false
            this._hitPoint = null
        }
    }


    private createPreviewElement = (world: OBC.World, label: string | null) => {
        const icon = document.createElement("bim-label")
        icon.textContent = label
        icon.icon = "material-symbols:comment"
        icon.style.backgroundColor = "#4A514D"
        icon.style.color = "#a4a9fc"
        // icon.style.backgroundColor = {}
        icon.style.padding = "0.5rem"
        icon.style.boxShadow = "0 3px 0.55rem #a4a9fc"
        icon.style.borderRadius = "0.5rem"
        const preview = new OBF.Mark(world, icon)
        preview.visible = false
        this._previewElement = preview
    }


    private setEvents(world: OBC.World, enabled: boolean) {
        if (!(world.renderer && world.renderer.three.domElement.parentElement)) {
            throw new Error("Comments: your world needs a renderer!")
        }
        const worldContainer = world.renderer.three.domElement.parentElement
        console.log("setting events for comments", worldContainer)
        if (enabled) {
            worldContainer.addEventListener("mousemove", this.checkHitPointAndSetTagName)
            //worldContainer.addEventListener("click", this.addCommentOnPreviewPoint)
        } else {
            worldContainer.removeEventListener("mousemove", this.checkHitPointAndSetTagName)
            //worldContainer.removeEventListener("click", this.addCommentOnPreviewPoint)
        }
    }

    private createNewTag = (world: OBC.World, label: string | null) => {
        const icon = document.createElement("bim-label")
        icon.textContent = label
        // icon.icon = "material-symbols:comment"
        icon.style.backgroundColor = "#4A514D"
        icon.style.color = "#a4a9fc"
        // icon.style.backgroundColor = {}
        icon.style.padding = "0.5rem"
        icon.style.boxShadow = "0 3px 0.55rem #a4a9fc"
        icon.style.borderRadius = "0.5rem"
        const preview = new OBF.Mark(world, icon)
        preview.visible = false
        return preview;
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
                    this._hitLabel = element !== undefined ? this.getLabel(element) : null;
                    const newTag = this.createNewTag(this.world, this._hitLabel);
                    this._previewElement.dispose();
                    this._previewElement = newTag;
                    // console.log("Checkhit success modelID:", element)
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

    private getLabel = (element: BuildingElement) : string => {
        const config = this.components.get(ModelTagger).Configuration;
        const labelStyle = config.get('labelStyle')
        let label = element.name;
        if(labelStyle === `Code`) {
            let code = GetPropertyByName(element,knownProperties.ProductCode)?.value
            const mat = GetPropertyByName(element, knownProperties.Material)?.value ?? "";
            if(mat && code) code = `${mat}_${code}`
            if(code) label = code;
        }
        return label;
    }
}