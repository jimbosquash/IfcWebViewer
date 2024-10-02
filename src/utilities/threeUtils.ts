import * as THREE from "three";


export function getAveragePoint(vectors: (THREE.Vector3 | undefined)[]) {
    const sum = new THREE.Vector3();

    for (const vector of vectors) {
        if (!vector) return;
        sum.x += vector.x;
        sum.y += vector.y;
        sum.z += vector.z;
    }

    return sum.divideScalar(vectors.length);
}

// Convert a THREE.Vector3 object to a plain object
export function serializeVector3(vec: THREE.Vector3) {
    return {
        x: vec.x,
        y: vec.y,
        z: vec.z
    }
}

export function deserializeVector3(data: { x: number; y: number; z: number }) {
    return new THREE.Vector3(data.x, data.y, data.z);
}
