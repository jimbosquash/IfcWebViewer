import { useEffect, useRef, useState } from "react";
import { useComponentsContext } from "../../context/ComponentsContext";
import ActionButtonPanel from "./actionButtonPanel/actionButtonPanel";
import * as OBC from "@thatopen/components";
import * as FRAGS from "@thatopen/fragments";
import { ModelViewManager } from "../../bim-components/modelViewer";
import { InfoPanel } from "./src/InfoPanel";
import FloatingCameraPanel from "./floatingIconPanel/CameraIconPanel";

const Overlay = () => {
  const components = useComponentsContext();
  const [hasModel, setHasModel] = useState<boolean>(false);
  const viewManager = useRef<ModelViewManager>();

  useEffect(() => {
    if (!components) return;
    const fragments = components.get(OBC.FragmentsManager);
    viewManager.current = components.get(ModelViewManager);
    if (!fragments || !viewManager.current) return;

    fragments.onFragmentsLoaded.add((data) => handleLoadedModel(data));
    //viewManager.current.onSelectedGroupChanged.add((data) => handleLoadedModel(null));

    return () => {
      fragments.onFragmentsLoaded.remove((data) => handleLoadedModel(data));
    };
  }, [components]);


  const handleLoadedModel = (data: FRAGS.FragmentsGroup | null) => {
    setHasModel(true);
    console.log("overlay handel opening", hasModel);
  };


  return (
    <div
      className="Overlay"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
      }}
    >
      <InfoPanel />

      <ActionButtonPanel />
      <FloatingCameraPanel
          sx={{
            position: "absolute",
            top: "25%",
            // transform: "translateY(-50%)",
            right: 20,
            height: "100%",
            transition: "right 0.2s ease-in-out",
            pointerEvents: "auto",
          }}
        />
    </div>
  );
};
export default Overlay;
