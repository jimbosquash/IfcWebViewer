
import * as OBC from "@thatopen/components";

const viewer = new OBC.Components();

export default function SetUpIfcComponents(containerRef: React.RefObject<HTMLElement | undefined>) : OBC.Components {
    if (containerRef.current) {
        console.log("component set up: starting...")
        const components = new OBC.Components()
        const worlds = components.get(OBC.Worlds);
        const world = worlds.create<
        OBC.SimpleScene,
        OBC.SimpleCamera,
        OBC.SimpleRenderer
        >();

        world.scene = new OBC.SimpleScene(components)
        world.renderer = new OBC.SimpleRenderer(components, containerRef.current)
        const cameraComponent = new OBC.OrthoPerspectiveCamera(components);
        cameraComponent.controls.setLookAt(10, 10, 10, 0, 0, 0);
        world.camera = cameraComponent;
        world.camera.enabled;
        components.init()
        const grids = components.get(OBC.Grids);
        grids.create(world);
        world.scene.setup();
        console.log("component set up")
    }
    return viewer;
}