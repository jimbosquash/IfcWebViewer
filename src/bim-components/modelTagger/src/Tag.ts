import * as THREE from "three";
import { BuildingElement, knownProperties } from "../../../utilities/types";
import * as OBC from '@thatopen/components';
import { GetCenterPoint } from "../../../utilities/IfcUtilities";
import { GetPropertyByName } from "../../../utilities/BuildingElementUtilities";
import { ModelTagger } from "..";


export class markProperties {
    text: string;
    position?: THREE.Vector3
    color?: string;
    /**
     * A type could be the ifc entity type or another type created for grouping tags
     */
    type?: string;

    globalID: string;

    constructor(globalID: string, text: string, position?: THREE.Vector3, color?: string, type?: string) {
        this.globalID = globalID;
        this.text = text;
        this.position = position;
        this.color = color;
        this.type = type;
    }

    dispose() {
        // Remove circular references
        if (this.position) {
            this.position = undefined;
        }

        // Clear other properties
        this.text = '';
        this.color = undefined;
        this.type = undefined;
    }

    /**
* Get a tag using the building elements, name, and center point based on its bounding box. Color based on its material.
* @param buildingElements 
* @returns key = buildingElement.GlobalID , value = Tag
*/
    static create(components: OBC.Components, buildingElements: BuildingElement[]) {

        const tags = new Map<string, markProperties>();

        const elementsByModel = buildingElements.reduce((acc, element) => {
            if (!acc.has(element.modelID)) {
                acc.set(element.modelID, [])
            }
            acc.get(element.modelID)?.push(element)
            return acc;
        }, new Map<string, BuildingElement[]>)

        const colorMap = components.get(ModelTagger).colorMap
        const fragments = components.get(OBC.FragmentsManager);
        elementsByModel.forEach((elements, modelID) => {
            const model = fragments.groups.get(modelID);

            if (!model) {
                console.log("failed to creat tags as no model found for", modelID, elements)
                return;
            }

            elements.forEach(element => {
                const pt = GetCenterPoint(element, model, components)
                if (!pt) {
                    console.log('Get Center failed: no center point found', element)
                    return;
                }

                const material = GetPropertyByName(element, knownProperties.Material)?.value ?? "";
                tags.set(element.GlobalID, new markProperties(element.GlobalID, element.name, pt, colorMap.get(material), element.type));
            })
        })
        return tags;
    }

}