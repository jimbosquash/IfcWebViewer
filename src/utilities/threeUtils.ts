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