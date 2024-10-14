import * as OBC from "@thatopen/components";
import * as THREE from "three";
import { ModelCache } from "../modelCache";


/**
 * Model flipper enables a model to be flipped and notifies user when a model is flipped or eeds flipping.
 */
export class ModelFlipper extends OBC.Component {
    static uuid = "e3f5a7b3-ca1a-4bbf-931c-959f6ed4c2d6" as const;
    private _enabled: boolean = false;
    private _xAxisIsFlipped: boolean = false;
    private _yAxisIsFlipped: boolean = false;

    get xAxisIsFlipped() { return this._xAxisIsFlipped }
    get yAxisIsFlipped() { return this._yAxisIsFlipped }

    readonly onModelFlipEnd = new OBC.Event<any[]>(); // trigger when the model flip ends
    readonly onModelFlipStart = new OBC.Event<any[]>(); // trigger when the model flip ends
    constructor(components: OBC.Components) {
        super(components);
        // this.animateRotation = this.animateRotation.bind(this);

    }

    set enabled(value: boolean) {
        this._enabled = value;
    }
    get enabled() {
        return this._enabled;
    }

    /**
     * Flip model on X or Y Axis
     */
    public flip(orientation: 'xAxis' | 'zAxis' ) {
        this.startRotationAnimation(orientation);
    }



    targetRotation: number | null = null;
    startRotation: number | null = null;
    animationDuration: number = 0.5; // Duration of the animation in seconds
    animationStartTime: number | null = null;
    orientation: 'xAxis' | 'zAxis' = 'zAxis';
    inProgress: boolean = false;
    onUpdateListener: ((event: any) => void) | null = null;
    private model: THREE.Object3D | undefined = undefined;


    private rotationSpeed = 0.5;

    // Function to handle key press
    private onKeyPress(event: KeyboardEvent) {
        console.log('key down', this.model)

        // switch (event.code) {
        //     case 'ArrowUp':
        //         // Rotate around the X-axis (tilting upward)
        //         ifcModel.rotation.x -= this.rotationSpeed;
        //         break;
        //     case 'ArrowDown':
        //         // Rotate around the X-axis (tilting downward)
        //         ifcModel.rotation.x += this.rotationSpeed;
        //         break;
        // }

        // Check if Ctrl is pressed and the 'F' key is pressed
        if (event.ctrlKey && event.code === 'KeyF') {
            // Rotate the model 180 degrees upside down
            // this.rotateModelUpsideDown();
            this.startRotationAnimation(this.orientation);
        }
    }

    // Function to start the rotation animation (toggle between forward and back)
    /**
     * Start rotation and set model fromthe model cache first model.
     * @param orientation 
     * @returns 
     */
    private startRotationAnimation(orientation: 'xAxis' | 'zAxis'): void {
        if (this.inProgress) return;
        this.orientation = orientation;
        // get current model
        const models = this.components.get(ModelCache).models();

        console.log('starting flip', this.orientation)
        if (models.length < 1) {
            return;
        }
        this.model = models[0]

        this.startRotation = this.orientation === 'xAxis' ? this.model.rotation.x : this.model.rotation.z; // Initial rotation

        if (orientation === 'xAxis') {
            this.targetRotation = this._xAxisIsFlipped ? this.startRotation - Math.PI // Rotate back 180 degrees
                : this.startRotation + Math.PI; // Rotate forwad 180 degrees

        } else {
            this.targetRotation = this._yAxisIsFlipped ? this.startRotation - Math.PI // Rotate back 180 degrees
                : this.startRotation + Math.PI; // Rotate forwad 180 degrees
        }

        console.log('target rotation in start', this.targetRotation)


        this.animationStartTime = performance.now(); // Start time using performance.now()

        // Add the animation to the renderer's update event listener if not already added
        if (!this.onUpdateListener) {
            this.onUpdateListener = this.animateRotation;
            this.components.get(ModelCache).world?.renderer?.onBeforeUpdate.add(this.onUpdateListener);
        }
    }

    // Function to smoothly rotate the model over time
    private animateRotation = () => {
        if (!this.inProgress) this.inProgress = true;
        const currentTime = performance.now(); // Get the current time

        // console.log('target rotation', this.targetRotation)
        if (this.targetRotation !== null && this.startRotation !== null && this.animationStartTime !== null) {
            // Calculate elapsed time
            const elapsedTime = (currentTime - this.animationStartTime) / 1000; // Convert to seconds
            const progress = Math.min(elapsedTime / this.animationDuration, 1); // Cap progress at 1 (100%)

            // Interpolate between startRotation and targetRotation
            const currentRotation = this.startRotation + progress * (this.targetRotation - this.startRotation);
            if (this.model) {
                if (this.orientation === 'xAxis') {
                    this.model.rotation.x = currentRotation;
                } else {
                    this.model.rotation.z = currentRotation; // three js z = rhino y
                }
            }

            // If the animation is complete, reset variables and stop listening
            if (progress >= 1) {
                this.targetRotation = null;
                this.startRotation = null;
                this.inProgress = false;

                // Toggle the flag for the next click (forward/back)
                if (this.orientation === 'xAxis') {
                    this._xAxisIsFlipped = !this._xAxisIsFlipped;
                } else {
                    this._yAxisIsFlipped = !this.yAxisIsFlipped;
                }

                // Remove the event listener to stop the animation
                if (this.onUpdateListener) {
                    this.components.get(ModelCache).world?.renderer?.onBeforeUpdate.remove(this.onUpdateListener);
                    this.onUpdateListener = null; // Clear the reference
                }
            }
        }
    }
}


export default ModelFlipper;
