import * as OBC from "@thatopen/components";
import * as THREE from "three";
import { ConfigManager } from "../../utilities/ConfigManager";
import { deserializeVector3, serializeVector3 } from "../../utilities/threeUtils";
import { SelectionGroup } from "../../utilities/types";
import { ModelViewManager } from "../modelViewer";
import { viewPresenterConfig, viewPresenterConfigSchema } from "./src/ViewPresenterConfig";

// used for saving
export interface viewPoint {
    index: number,
    properties: viewData,
    position: {
        x: number
        y: number
        z: number
    },
    target: {
        x: number
        y: number
        z: number
    },
}

export interface viewData {
    // id: number, // number of point index
    name: string, // user editable name
    SelectionGroupId?: string, // the id of the treenode to select
    id: string, // random number for unqiue tracking
    index: number, // the index in an array of the camera path and target
    position: THREE.Vector3,
    target: THREE.Vector3
}

const generateRandomId = (): string => {
    return Math.random().toString(36).substr(2, 9);
};



export class ViewPresenter extends OBC.Component implements OBC.Disposable {
    static uuid = "009f51d3-ff6c-401e-8ffa-1328636acdfc" as const;
    enabled = true;

    private _world: OBC.World | null = null;
    private _pathCurve: THREE.CatmullRomCurve3;
    private _targetCurve: THREE.CatmullRomCurve3;
    private _clock: THREE.Clock;
    private _isPlaying: boolean;
    readonly pathMesh: THREE.Mesh;
    private _Config = new ConfigManager<viewPresenterConfig>(viewPresenterConfigSchema, 'viewPresenterConfig');


    constructor(components: OBC.Components) {
        super(components);
        components.add(ViewPresenter.uuid, this);

        this._pathCurve = new THREE.CatmullRomCurve3();
        this._targetCurve = new THREE.CatmullRomCurve3();

        // A basic material for the mesh
        const showcaseMaterial = new THREE.MeshBasicMaterial({
            color: "#3ac632",
        });
        this.pathMesh = new THREE.Mesh();
        this.pathMesh.material = showcaseMaterial;

        // To not show mesh right away
        this.pathMesh.visible = false;

        this._clock = new THREE.Clock();
        this._isPlaying = false;
        const cachedViews = this._Config.get('viewPoints')
        if (cachedViews) {
            this.viewPoints = cachedViews;
        }
    }

    private set viewPoints(viewPoints: viewPoint[]) {
        const sortedViews = viewPoints.sort((viewA, viewB) => { return viewA.index - viewB.index })

        sortedViews.forEach((vp) => {
            console.log('loading saved data', vp.position, vp.target)
            if (!(vp.position && vp.target)) return;
            this._pathCurve.points.push(deserializeVector3(vp.position))
            this._targetCurve.points.push(deserializeVector3(vp.target))
            this._views.push(vp.properties)
        })
        if (this._pathCurve.points.length > 1) {
            this.updateGeometry();
        }
    }


    dispose = (): void | Promise<void> => {
        // do something grand
    }


    onDisposed: OBC.Event<any> = new OBC.Event();
    onViewAdded: OBC.Event<any> = new OBC.Event();
    onPointsChanged: OBC.Event<any> = new OBC.Event();

    set world(world: OBC.World | null) {
        this._world = world;
        if (world) {
            world.scene.three.add(this.pathMesh);
        } else {
            this.pathMesh.removeFromParent();
        }
    }

    get world(): OBC.World {
        if (!this._world) {
            throw new Error("Showcaser: There is no world set.");
        }
        return this._world;
    }

    private get camera(): OBC.BaseCamera {
        if (!this.world.camera) {
            throw new Error("Showcase: There is no camera set.");
        }
        return this.world.camera;
    }

    showPath() {
        this.pathMesh.visible = !this.pathMesh.visible;
    }

    // addPoint() {
    //     // Vector3 objects to track _position and _target
    //     const position = new THREE.Vector3();
    //     const target = new THREE.Vector3();

    //     // We need to make sure our camera has controls!
    //     if (this.camera.hasCameraControls()) {
    //         this.camera.controls.getPosition(position);
    //         this.camera.controls.getTarget(target);
    //     } else {
    //         throw new Error("Showcase: Camera has no controls!");
    //     }

    //     // Adds the new point to the curve's points
    //     this._pathCurve.points.push(position);
    //     this._targetCurve.points.push(target);
    //     this.addView(`View ${this._pathCurve.points.length}`, this._pathCurve.points.length + 1)

    //     // The points property needs at least two points,
    //     // when there are enough points, the geometry is created/updated
    //     if (this._pathCurve.points.length > 1) {
    //         this.updateGeometry();
    //     }
    //     this.onViewAdded.trigger(position);
    //     this.onPointsChanged.trigger();
    // }

    getPoints() {
        // Vector3 objects to track _position and _target
        const position = new THREE.Vector3();
        const target = new THREE.Vector3();

        // We need to make sure our camera has controls!
        if (this.camera.hasCameraControls()) {
            this.camera.controls.getPosition(position);
            this.camera.controls.getTarget(target);
        } else {
            throw new Error("Showcase: Camera has no controls!");
        }
        return { position: position, target: target }
    }

    addNewView(name?: string) {
        const points = this.getPoints()
        if (!(points.position && points.target)) {
            console.log('failed to create new view, point creation failed')
            return;
        }

        const selectedGroup = this.components.get(ModelViewManager).SelectedGroup;
        const index = this._pathCurve.points.push(points.position) - 1;
        this._targetCurve.points.push(points.target);

        const newView = {
            name: name ?? `View ${this._pathCurve.points.length}`,
            SelectionGroupId: selectedGroup?.id ?? undefined,
            id: generateRandomId(),
            index: index,
            position: points.position,
            target: points.target
        }
        this._views.push(newView)

        this._Config.set("viewPoints", this.viewPoints)

        // The points property needs at least two points,
        // when there are enough points, the geometry is created/updated
        if (this._pathCurve.points.length > 1) {
            this.updateGeometry();
        }
        this.onViewAdded.trigger(newView);
        this.onPointsChanged.trigger();
    }
    // // first
    // private addView(name: string, index: number) {
    //     //get if any group is selected
    //     const selectedGroup = this.components.get(ModelViewManager).SelectedGroup;

    //     this._views.push({
    //         name: name,
    //         SelectionGroupId: selectedGroup?.id ?? undefined,
    //         id: generateRandomId(),
    //         index: index,
    //         position: ...,
    //         target: ...
    //     })



    //     this._Config.set("viewPoints", this.viewPoints)
    // }

    private get viewPoints() {
        const positions = this.pathPoints;
        const targets = this.targetPoints;
        const viewPoints: viewPoint[] = [];
        this._views.forEach((view, index) => {
            viewPoints.push({
                index: index,
                properties: view,
                position: serializeVector3(positions[index]),
                target: serializeVector3(targets[index])
            })
        })
        console.log('cahcing view points', viewPoints)
        return viewPoints;
    }

    /**
     * optional groupId for updating modelViewManager to display group
     */
     async setCamAtView(id: string, groupId?: string) {
        console.log('set cam at view',id)

        let view = this._views.find(view => view.id === id)
        if (!view) {
            console.log('failed to set cam to view no id match', id,this._views)
            return;
        }


        const camPos = this.pathPoints[view.index];
        const targetPos = this.targetPoints[view.index]
        console.log('set cam at view', view,camPos,targetPos)

        if (!(camPos && targetPos)) return;

        if (!this.camera.hasCameraControls()) return;
        console.log('setting groupid', groupId)

        if (view.SelectionGroupId) {
            this.components.get(ModelViewManager).setSelectionGroupByID(view.SelectionGroupId, true)
        }
        await this.camera.controls.setLookAt(camPos.x, camPos.y, camPos.z, targetPos.x, targetPos.y, targetPos.z, true)
    }

    // /**
    //  * optional groupId for updating modelViewManager to display group
    //  */
    // async setCamAtIndex(index: number, groupId?: string) {
    //     const camPos = this.pathPoints[index];
    //     const targetPos = this.targetPoints[index]
    //     if (!(camPos && targetPos)) return;
    //     if (!this.camera.hasCameraControls()) return;
    //     console.log('setting groupid',index, groupId)

    //     if (groupId) {
    //         this.components.get(ModelViewManager).setSelectionGroupByID(groupId, true)
    //     }
    //     await this.camera.controls.setLookAt(camPos.x, camPos.y, camPos.z, targetPos.x, targetPos.y, targetPos.z, true)
    // }

    // deletePoint(index: number) {
    //     console.log(` delete ${index}`, this._views[index], this.pathPoints[index])
    //     this._pathCurve.points = this.pathPoints.filter((_, ptIndex) => {
    //         return ptIndex !== index;
    //     })
    //     this._targetCurve.points = this.targetPoints.filter((_, ptIndex) => {
    //         return ptIndex !== index;
    //     })

    //     this._views = this._views.filter((_, ptIndex) => {
    //         return ptIndex !== index;
    //     })

    //     const viewPoints = this.viewPoints;
    //     console.log('updated view points', viewPoints)

    //     this._Config.set("viewPoints", viewPoints)

    //     if (this.pathPoints.length > 1 && this.targetPoints.length > 1) {
    //         this.updateGeometry();
    //     } else {
    //         this.pathMesh.visible = false;
    //     }
    //     this.onPointsChanged.trigger();
    // }

    deleteView(id: string) {
        let view = this._views.find(view => view.id === id)
        if (!view) {
            console.log('failed to delete view no id match', id)
            return;
        }

        // now find its index by assuming that its wrong
        // quickly check if index does match the position point other wise search until equel

        if (this._pathCurve.points[view.index] === view.position) {
            // then index is correct and can delete
            this._pathCurve.points = this.pathPoints.filter((_, ptIndex) => {
                return ptIndex !== view?.index;
            })
            this._targetCurve.points = this.targetPoints.filter((_, ptIndex) => {
                return ptIndex !== view?.index;
            })
            this._views = this._views.filter((viewB) => {
                return viewB.id !== view?.id;
            })

            view = undefined;

            // go back through all views and reindex them assuming the array index is the correct index

            this._views.forEach((v, index) => { v.index = index })

            const viewPoints = this.viewPoints;
            console.log('updated view points', viewPoints)

            this._Config.set("viewPoints", viewPoints)

            if (this.pathPoints.length > 1 && this.targetPoints.length > 1) {
                this.updateGeometry();
            } else {
                this.pathMesh.visible = false;
            }
            this.onPointsChanged.trigger();


        } else {
            console.log('index is out of order, deletion canceled,', id, this._views)
        }


    }

    changeViewName(id: string, name: string) {
        const view = this._views.find(view => view.id === id)
        if (!view) return;

        view.name = name;
        this._Config.set("viewPoints", this.viewPoints)
    }

    async overridePositionTo(index: number) {
        if (!this.camera.hasCameraControls()) return;

        // Vector3 objects to track _position and _target
        const position = new THREE.Vector3();
        const target = new THREE.Vector3();

        // We need to make sure our camera has controls!
        if (this.camera.hasCameraControls()) {
            this.camera.controls.getPosition(position);
            this.camera.controls.getTarget(target);
        } else {
            throw new Error("Showcase: Camera has no controls!");
        }

        if (this._pathCurve.points.length >= index) {
            this._pathCurve.points.push(position)
        } else {
            this._pathCurve.points[index] = position;
        }

        if (this._targetCurve.points.length >= index) {
            this._targetCurve.points.push(target)
        } else {
            this._targetCurve.points[index] = target;
        }

        if (this._pathCurve.points.length < 2) {
            this.pathMesh.visible;
        } else {
            this.updateGeometry()
        }
    }

    private updateGeometry() {
        this.pathMesh?.geometry.dispose();
        const disposer = this.components.get(OBC.Disposer)
        if (this._pathCurve) {
            disposer.disposeGeometry(this.pathMesh.geometry)
        }
        this.pathMesh.geometry = new THREE.TubeGeometry(
            this._pathCurve,
            100,
            0.1,
            3,
            false,
        );
    }

    get targetPoints() {
        return this._targetCurve.points
    }

    get pathPoints() {
        return this._pathCurve.points
    }


    private _views: viewData[] = []; // should look up cache

    get views() {
        return this._views;
    }

    private updateCamera() {
        const time = this._clock.getElapsedTime();

        // The lower the value the faster the movement through the curve
        const looptime = 5;

        // Ensures we get a value between 0 and 1
        const t = (time % looptime) / looptime;

        // Returns the _position and _target along the curve
        console.log('tick', t)
        const cameraPosition = this._pathCurve.getPoint(t);
        const cameraTarget = this._targetCurve.getPoint(t);

        if (this.camera.hasCameraControls()) {
            this.camera.controls.setLookAt(
                cameraPosition.x,
                cameraPosition.y,
                cameraPosition.z,
                cameraTarget.x,
                cameraTarget.y,
                cameraTarget.z,
            );
        }
    }

    private animate = () => {
        if (this._isPlaying) {
            requestAnimationFrame(this.animate);
            this.updateCamera();
        }
    };

    playPause() {
        this._isPlaying = !this._isPlaying;
        if (this._pathCurve.points.length > 1) {
            this.animate();
        }
    }
}

// we want to know at which point the cam should trigger a change of the elements visible

export default ViewPresenter;