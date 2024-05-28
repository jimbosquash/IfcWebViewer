
import * as OBC from "openbim-components";

const viewer = new OBC.Components();

export default function SetUpIfcComponents(containerRef: React.RefObject<HTMLElement | undefined>) : OBC.Components {
    if (containerRef.current) {
        console.log("component set up: starting...")
        const components = new OBC.Components()
        components.scene = new OBC.SimpleScene(components)
        components.renderer = new OBC.SimpleRenderer(components, containerRef.current)
        const cameraComponent = new OBC.OrthoPerspectiveCamera(components);
        cameraComponent.controls.setLookAt(10, 10, 10, 0, 0, 0);
        components.camera = cameraComponent;
        components.camera.enabled;
        components.init()
        console.log("component set up")
    }
    return viewer;
}