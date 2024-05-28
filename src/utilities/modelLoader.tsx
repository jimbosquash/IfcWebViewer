import * as FRAGS from "bim-fragment";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { MeshStandardMaterial } from "three";

interface LoadModelProps {
    ifcModel: FRAGS.FragmentsGroup | undefined
}

// model was already loaded by user button and now jut applying it to the 3js fiber scene
const LoadModel: React.FC<LoadModelProps> = ({ifcModel}) => {
    console.log("loading begins: ",ifcModel)
    const setTempModel = () => {
        console.log("temp model being set")
        const geometry = new THREE.BoxGeometry()
        const material = new THREE.MeshBasicMaterial()
        return new THREE.Mesh(geometry, material)
    }

    // Get the scene from the underlying instance of threejs
    const { scene } = useThree()
    // State that will contain the rendered model at everytime, starts with a temporary cube
    const [meshObj, setMeshObj] = useState<any>(setTempModel())

    // On component mount, load the IFC model
    // On component unmount, clear the IFC model
    useEffect(() => {
        setMeshObj(setTempModel());

        if (ifcModel) {
            console.log("seting meshes: ",ifcModel)
            makeMeshFacesTwoSided(ifcModel);
            setMeshObj(ifcModel);
        }
        else
        {
            console.log("no container ref")
        }

        return () => {
            console.log('removing model')
            // IMPORTANT NOTE: It might be wise to use the ".dispose" method available from OBC components to dispose all OBC elements, not just the model in threejs
            if (ifcModel && scene.children.includes(ifcModel)) {
                scene.remove(ifcModel);
            }
        }
    },[ifcModel])

    // Idea: might be possible to use <Suspense> here and create a loading state, instead of the temp cube
    console.log("Load Model function: ", meshObj)
    return <primitive object={meshObj} />;
}


function makeMeshFacesTwoSided(model: FRAGS.FragmentsGroup)
{
    for(var i = 0; i < model.children.length; i++)
                {

                    var child = model.children[i]
                    if(child instanceof THREE.InstancedMesh)
                    {
                        // 1. set new stadnard material = lower performance, better shadows
                        if(child.instanceColor !== null){
                            var oldColor = child.instanceColor.array;
                            var material = new MeshStandardMaterial();
                            material.color = new THREE.Color(oldColor[0],oldColor[1],oldColor[2]);
                            material.side = THREE.DoubleSide;
                            child.material = [material]

                            // 2. just make same material double sided = lighter and ugly
                            // if(child.material[0] instanceof THREE.MeshLambertMaterial)
                            // {
                            //     child.material[0].side = THREE.DoubleSide;
                            // }

                        }
                    }
                    else
                    {
                        console.log('not frag')
                    }
                }
}

export default LoadModel;