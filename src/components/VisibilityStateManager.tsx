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
        updateVisibility();
    },[modelContext?.groupVisibility])

    
    const updateVisibility = async () => {
        
        if(components && modelContext?.currentModel)
        {
          const fragments = components.get(OBC.FragmentsManager);


          // get an array with all elements from station that are visible

          // then get array of all building steps that are visible

          // then only keep elements that exist in both lists

          const stations = modelContext.groups.get('Station');
          if(!stations) return;
          let visibleElements: buildingElement[] = [];
          let hiddenElement: buildingElement[] = [];
          for(let [key,value] of stations?.entries())
          {
            if(modelContext?.groupVisibility.has(key) && modelContext?.groupVisibility.get(key))
                visibleElements = visibleElements.concat(value);            
            else
                hiddenElement = hiddenElement.concat(value)
          }

          const duplicatedMap = new Map(modelContext.groups);
          duplicatedMap.delete('Station')
          // with each of the map items vis or invis 
          let subGroupedElements: buildingElement[] = [];

          // get all groups except for stations and group if visible or add to hidden if invisible
          for(let [groupType,group] of duplicatedMap?.entries())
          {
            for(let [groupName,elements] of group?.entries())
          {
            if(modelContext?.groupVisibility.has(groupName) && modelContext?.groupVisibility.get(groupName))            
                subGroupedElements = subGroupedElements.concat(elements);
            else
                hiddenElement = hiddenElement.concat(elements)
          } 
          }

          // all hiddenElements will be hidden in the end 
          // all visible elements if they does exist in hidden will be made visible


          const subElementIds = new Set(subGroupedElements.map(element => element.expressID))
          const overlap = visibleElements.filter(element => subElementIds.has(element.expressID))

          const showExpressIds = overlap.map(element => element.expressID);
          const hideExpressIds = hiddenElement.map(element => element.expressID);

          const showFragments = GetFragmentsFromExpressIds(showExpressIds,fragments,modelContext?.currentModel);
          const hideFragments = GetFragmentsFromExpressIds(hideExpressIds,fragments,modelContext?.currentModel);
          console.log('setting visibility, hidden',hideFragments)
          console.log('setting visibility, show',showFragments)

          showFragments.forEach((ids,frag) => frag.setVisibility(true,ids));
          hideFragments.forEach((ids,frag) => frag.setVisibility(false,ids));
        }
      };

    return(<>
    </>)
}