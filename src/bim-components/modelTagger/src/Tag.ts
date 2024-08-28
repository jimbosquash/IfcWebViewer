import * as THREE from "three";


export class Tag{
    text: string;
    position?: THREE.Vector3
    constructor(text: string,position?: THREE.Vector3) {
        this.text = text;
        this.position = position;
    }
}