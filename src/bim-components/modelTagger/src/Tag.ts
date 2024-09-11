import * as THREE from "three";


export class Tag{
    text: string;
    position?: THREE.Vector3
    color?: string;
    constructor(text: string,position?: THREE.Vector3, color?: string) {
        this.text = text;
        this.position = position;
        this.color = color;
    }
}