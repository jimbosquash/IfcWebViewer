import { useContext, useEffect } from "react";
import { ComponentsContext } from "../context/ComponentsContext";
import { ModelStateContext } from "../context/ModelStateContext";
import { buildingElement, GroupingType } from "../utilities/BuildingElementUtilities";
import * as OBC from "@thatopen/components";
import { GetFragmentsFromExpressIds } from "../utilities/IfcUtilities";



export const VisibilityStateManager = () => {
    const modelContext = useContext(ModelStateContext);
    const components = useContext(ComponentsContext);

    useEffect(() => {
        if(!modelContext?.groupVisibility) return;

        // set the visibility of all groups
        // if user setting support zoom then zoom on all things not invisible.
        console.log('visibility manager update')





    },[modelContext?.groupVisibility])

    
    const updateVisibility = () => {
        
        if(components && modelContext?.currentModel)
        {
          const fragments = components.get(OBC.FragmentsManager);


          // get an array with all elements from station that are visible

          // then get array of all building steps that are visible

          // then only keep elements that exist in both lists

          const stations = modelContext.groups.get('Station');
          if(!stations) return;
          let elements: buildingElement[] = [];
          for(let [key,value] of stations?.entries())
          {
            if(modelContext?.groupVisibility.has(key) && modelContext?.groupVisibility.get(key))
            {
                // add building elements
                elements = elements.concat(value);
            }
          }

          const buildingSteps = modelContext.groups.get('BuildingSteps');
          if(!buildingSteps) return;
          let stepElements: buildingElement[] = [];
          for(let [key,value] of buildingSteps?.entries())
          {
            if(modelContext?.groupVisibility.has(key) && modelContext?.groupVisibility.get(key))
            {
                // add building elements
                stepElements = stepElements.concat(value);
            }
          }

          const stepIds = new Set(stepElements.map(element => element.expressID))
          const overlap = elements.filter(element => stepIds.has(element.expressID))

          const expressIds = overlap.map(element => element.expressID);






          // if(!groupToSearch) return;
          //const expressIds = groupToSearch?.get(groupName)?.map((e) => {return e.expressID})
          if(!expressIds) return;
          const taskFragments = GetFragmentsFromExpressIds(expressIds,fragments,modelContext?.currentModel);
  
          for(const fragmentType of taskFragments)
          {
            fragmentType[0].setVisibility(true,fragmentType[1])
          }
        }
      };

    return(<>
    </>)
}