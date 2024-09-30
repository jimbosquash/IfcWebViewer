import * as OBC from "@thatopen/components";
import * as THREE from "three";

interface ViewProps {
    // id: number, // number of point index
    name: string, // user editable name
}

export class Showcaser extends OBC.Component implements OBC.Disposable {
    static uuid = "009f51d3-ff6c-401e-8ffa-1328636acdfc" as const;
    enabled = true;

    private _world: OBC.World | null = null;
    private _pathCurve: THREE.CatmullRomCurve3;
    private _targetCurve: THREE.CatmullRomCurve3;
    private _clock: THREE.Clock;
    private _isPlaying: boolean;
    readonly pathMesh: THREE.Mesh;

    constructor(components: OBC.Components) {
        super(components);
        components.add(Showcaser.uuid, this);

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
    }
    dispose = (): void | Promise<void> => {
        // do something grand
    }


    onDisposed: OBC.Event<any> = new OBC.Event();
    onPointAdded: OBC.Event<any> = new OBC.Event();
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

    addPoint() {
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

        // Adds the new point to the curve's points
        this._pathCurve.points.push(position);
        this._targetCurve.points.push(target);

        this._views.push({name: `View ${this._pathCurve.points.length}`})

        // The points property needs at least two points,
        // when there are enough points, the geometry is created/updated
        if (this._pathCurve.points.length > 1) {
            this.updateGeometry();
        }
        this.onPointAdded.trigger(position);
        this.onPointsChanged.trigger();
    }

    async setCamAtIndex(index: number) {
        const camPos = this.pathPoints[index];
        const targetPos = this.targetPoints[index]
        if (!(camPos && targetPos)) return;
        if (!this.camera.hasCameraControls()) return;

        await this.camera.controls.setLookAt(camPos.x, camPos.y, camPos.z,targetPos.x, targetPos.y, targetPos.z, true)
    }

    deletePoint(index: number) {
        console.log(` delete ${index}`,this.pathPoints )
        this._pathCurve.points = this.pathPoints.filter((_, ptIndex) => {
            return ptIndex !== index;
        })
        this._targetCurve.points = this.targetPoints.filter((_, ptIndex) => {
            return ptIndex !== index;
        })

        this._views = this._views.filter((_,ptIndex) => {
            return ptIndex !== index;
        })
        this.onPointsChanged.trigger();

        if (this.pathPoints.length > 1 && this.targetPoints.length > 1) {
            this.updateGeometry();
        } else {
            this.pathMesh.visible = false;
        }
        this.onPointsChanged.trigger();
    }

    changeViewProperties(index: number, props: ViewProps) {
        const view = this._views[index]
        if(!view) return;

        view.name = props.name;
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

    
    private _views: ViewProps[] = []; // should look up cache

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

export default Showcaser;