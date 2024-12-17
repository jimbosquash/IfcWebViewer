import * as THREE from "three";

export class markProperties {
    text: string;
    position?: THREE.Vector3
    color?: string;
    /**
     * A type could be the ifc entity type or another type created for grouping tags
     */
    type?: string;

    globalID: string;
    icon?: string; // for iconify format

    constructor(globalID: string, text: string, position?: THREE.Vector3, color?: string, type?: string, icon?: string) {
        this.globalID = globalID;
        this.text = text;
        this.position = position;
        this.color = color;
        this.type = type;
        this.icon = icon;
    }

    dispose() {
        // Remove circular references
        if (this.position) {
            this.position = undefined;
        }

        // Clear other properties
        this.text = '';
        this.color = undefined;
        this.type = undefined;
        this.icon = undefined;
    }
}