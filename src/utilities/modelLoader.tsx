import * as FRAGS from "@thatopen/fragments";
import * as THREE from "three";
import { MeshProps } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
//import GetEdges from "./GetEdges";
import * as OBC from "@thatopen/components";

interface LoadModelProps {
    ifcModel: FRAGS.FragmentsGroup | undefined
    components: OBC.Components | undefined;
}

// model was already loaded by user button and now jut applying it to the 3js fiber scene
export const LoadModel = ({ifcModel, components} : LoadModelProps) => {
    //console.log("loading begins: ",ifcModel)
    const setTempModel = () => {
        //console.log("temp model being set")
        const geometry = new THREE.BoxGeometry()
        const material = new THREE.MeshBasicMaterial()
        return new THREE.Mesh(geometry, material)
    }

    // Get the scene from the underlying instance of threejs
    // const { scene,gl,camera } = useThree()
    

    // State that will contain the rendered model at everytime, starts with a temporary cube
    const [meshObj, setMeshObj] = useState<any>(setTempModel())

// on first time create scene and link renders
    useEffect(() => {
        console.log("setting up scene")
        if(components)
        {
            const worlds = components.get(OBC.Worlds);
            const world = worlds.list.size !== 0 ? worlds.list.values().next().value : worlds.create<
            OBC.SimpleScene,
            OBC.SimpleCamera,
            OBC.SimpleRenderer
            >()
            console.log("obc world", world)
        }
        else
        {
            console.log('no compoenents to set up scene')
        }

        

        return () => {
            console.log('unhooking scene somehow...')
            // remoive scene somehow
        }
    },[components])

    // On component mount, load the IFC model
    // On component unmount, clear the IFC model
    useEffect(() => {
        setMeshObj(setTempModel());

        if (ifcModel) {
            //console.log("seting meshes: ",ifcModel)
            //makeMeshFacesTwoSided(ifcModel);

            setMeshObj(ifcModel);
        }
        else
        {
            console.log("no container ref")
        }

        return () => {
            console.log('removing model')
            // IMPORTANT NOTE: It might be wise to use the ".dispose" method available from OBC components to dispose all OBC elements, not just the model in threejs
            // if (ifcModel && scene.children.includes(ifcModel)) {
            //     scene.remove(ifcModel);
            // }
        }
    },[ifcModel])

    // Idea: might be possible to use <Suspense> here and create a loading state, instead of the temp cube
    //console.log("Load Model function: ", meshObj)
    return (
        <>
            <primitive object={meshObj}/>
        </> 
    )
}


interface InteractableGeometryGroupProps {
    fragmentsGroup: FRAGS.FragmentsGroup | undefined;
    //onSelect: (selected: THREE.Intersection[]) => void;
}

export const InteractableModel: React.FC<InteractableGeometryGroupProps> = ({fragmentsGroup}) => {
    const [model, setModel] = useState<any>();
    const groupRef = useRef<THREE.Group>(null);

    useEffect(() => {
        if(!fragmentsGroup)
            return;
        //console.log('bounding box:', ifcModel?.children);
        console.log('setting interactable model');
        setModel(model)
    } ,[fragmentsGroup])


    // set up events

    // handlePointerOVer

    // handlePointOut

    // handleClick


    return (
        <>
            {/* < LoadModel ifcModel={model}/> */}
            {/* <primitive object={model}/> */}
            <group ref={groupRef}>
                {fragmentsGroup?.children.map((child,index) => {
                                            console.log("welcome to the world child",child)
                    if(child instanceof THREE.Mesh) {
                        return <CustomMesh
                                    key={index}
                                    geometry={child.geometry}
                                    material={child.material}
                        />
                    }
                    else
                    {
                        console.log(child)
                    }
                })}
            </group>
        </>
    )
}

interface CustomMeshProps extends MeshProps {
    geometry: THREE.BufferGeometry;
    material: THREE.Material;
  }
  
  const CustomMesh: React.FC<CustomMeshProps> = ({ geometry, material, ...props }) => {
    const meshRef = useRef<THREE.Mesh>(null);

    console.log('custom mesh creation:', geometry)
  
    return (
      <mesh scale={0.001}
        ref={meshRef}
        {...props}
      >
        <primitive attach="geometry" object={geometry} />
        <primitive attach="material" object={material} />
      </mesh>
    );
  };

//export default LoadModel;