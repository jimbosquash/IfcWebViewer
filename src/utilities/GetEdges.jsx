
import * as FRAGS from "@thatopen/fragments";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { MeshStandardMaterial } from "three";
import { useThree } from "@react-three/fiber";

export const GetEdges = ({model})  =>
{
    const {scene} = useThree();
    console.log("edge begins",model)

    let lineMat = new THREE.LineBasicMaterial({
        color: "yellow",
        onBeforeCompile: shader => {
          shader.vertexShader = `
          attribute vec3 instT;
          attribute vec4 instR;
          attribute vec3 instS;
          
          // http://barradeau.com/blog/?p=1109
          vec3 trs( inout vec3 position, vec3 T, vec4 R, vec3 S ) {
              position *= S;
              position += 2.0 * cross( R.xyz, cross( R.xyz, position ) + R.w * position );
              position += T;
              return position;
          }
          ${shader.vertexShader}
      `.replace(
            `#include <begin_vertex>`,
            `#include <begin_vertex>
            transformed = trs(transformed, instT, instR, instS);
      `
          );
          console.log(shader.vertexShader);
        }
      });
      let pos = [];
let rot = [];
let scl = [];
    for(var i = 0; i < model.children.length; i++)
                {

                    var child = model.children[i]
                    if(child instanceof THREE.InstancedMesh)
                    {
                        if(child.geometry)
                        {
                            console.log("child geometry", child.geometry)
                            let lineGeom = new THREE.EdgesGeometry(child.geometry);
                            let t = new THREE.InstancedBufferGeometry().copy(lineGeom);
                            lineGeom.instanceCount = Infinity;
                            lineGeom.setAttribute("instT", new THREE.InstancedBufferAttribute(new Float32Array(pos), 3));
                            lineGeom.setAttribute("instR", new THREE.InstancedBufferAttribute(new Float32Array(rot), 4));
                            lineGeom.setAttribute("instS", new THREE.InstancedBufferAttribute(new Float32Array(scl), 3));
                            let lines = new THREE.LineSegments(lineGeom, lineMat);

                            if(scene)
                                scene.add(lines)
                        }
                    }
                    else
                    {
                        console.log('not frag')
                    }
                }

    return (<></>);
}

export default GetEdges;