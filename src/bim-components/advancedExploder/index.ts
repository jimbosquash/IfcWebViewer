import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as THREE from "three";

// - to find the correct exploding direction based on bounding box of al things
// - to explode with multiple groups 
//  - groups of materials or other grouping
//  - be smart enough to kno which group to explode further or less


export class AdvancedExploder extends OBC.Component {

    static uuid = "bf3a5df6-e975-4c5e-8597-a3a6607f6858" as const;
    readonly list: Comment[] = []
    readonly onCommentAdded = new OBC.Event<Comment>()

    private _enabled = false
    private _world: OBC.World | null = null


    constructor(components: OBC.Components) {
        super(components)
    }


    set world(world: OBC.World | null) {
        this._world = world
        if (world) {
        }
    }

    get world() {
        return this._world
    }

    set enabled(value: boolean) {
        this._enabled = value
    }

    get enabled() {
        return this._enabled
    }

    // get the selected group
    // with the group, group by material
    // make a map for the heights and group

    // map key = material, value = fragMap
    // mpa key = material, value = amount

    // explode = () => {
    //     const indexer = this.components.get(OBC.IfcRelationsIndexer);
    //     const relationsFile = await fetch(
    //         "https://thatopen.github.io/engine_components/resources/small-relations.json",
    //     );
    //     const relations = indexer.getRelationsMapFromJSON(await relationsFile.text());
    //     indexer.setRelationMap(model, relations);
    //     indexer.process(model);
    //     const exploded = this.components.get(OBC.Exploder);
    //     exploded.groupName = 
    // }

}
