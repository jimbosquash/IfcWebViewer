import { Button, useTheme } from "@mui/material";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { tokens } from "../../../../theme";
import * as OBC from "@thatopen/components";
import * as WEBIFC from "web-ifc";
import { ModelCache } from "../../../../bim-components/modelCache";

export const TaskBrowserPanel = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const components = useComponentsContext();

  const handleSaveClick = async () => {

    const cache = components.get(ModelCache);
    const propertiesManager = components.get(OBC.IfcPropertiesManager);
    const data = cache.getModelData(cache.models()[0].uuid);
    if (!data) {
      console.log("unable to find Uint8Array data for exporting ifc model, export ending");
      return;
    }
    const newIFC = await propertiesManager.saveToIfc(cache.models()[0], data);

    // // Export modified model

    const modifiedFile = new File([newIFC], "small-modified.ifc");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(modifiedFile);
    a.download = modifiedFile.name;
    a.click();
    URL.revokeObjectURL(a.href);
  };


  const handleClick = async () => {
    // get model
    // get selected

    const cache = components.get(ModelCache);
    const propertiesManager = components.get(OBC.IfcPropertiesManager);
    if (!cache.models()[0]) return;
    const model = cache.models()[0];
    try {
      // Add a new pset
      const { pset } = await propertiesManager.newPset(model, "CalculatedQuantities");

      const prop = await propertiesManager.newSingleNumericProperty(model, "IfcReal", "Volume", 12.25);

      await propertiesManager.addPropToPset(model, pset.expressID, prop.expressID);
      console.log("saving pSet", pset.expressID, prop.expressID);

      await propertiesManager.addElementToPset(model, pset.expressID, 186);

      // Modify existing entity attributes
      const entityAttributes = await model.getProperties(186);
      if (entityAttributes) {
        entityAttributes.Name.value = "New Wall Name";
        await propertiesManager.setData(model, entityAttributes);
      }

      // Create a new random entity
      const ifcTask = new WEBIFC.IFC4X3.IfcTask(
        new WEBIFC.IFC4X3.IfcGloballyUniqueId(OBC.UUID.create()),
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        new WEBIFC.IFC4X3.IfcBoolean(false),
        null,
        null,
        null
      );

      await propertiesManager.setData(model, ifcTask);

      const success = await propertiesManager.setData(cache.models()[0], generateRandomTask());
      console.log("saving tasks");
    } catch (e) {
      console.log("error saving tasks");
      return;
    }

    
  };

  const generateRandomTask = (): any[] => {
    // Create a new random entity
    const ifcTask = new WEBIFC.IFC4X3.IfcTask(
      new WEBIFC.IFC4X3.IfcGloballyUniqueId(crypto.randomUUID()),
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      new WEBIFC.IFC4X3.IfcBoolean(false),
      null,
      null,
      null
    );
    // console.log("task expressID", ifcTask.expressID);
    return [ifcTask];
  };

  return (
    <>
      <Button
        onClick={() => handleClick()}
        sx={{
          backgroundColor: colors.grey[500],
          //   fontWeight: "bold",
          //   padding: "2px 10px",
        }}
      >
        add Tasks
      </Button>
      <Button
        onClick={async () => {
          try {
            await handleSaveClick();
            // Handle success here if needed
          } catch (error) {
            // Handle error here
            console.error("Error saving IFC:", error);
          }
        }}
        sx={{
          backgroundColor: colors.grey[500],
          //   fontWeight: "bold",
          //   padding: "2px 10px",
        }}
      >
        Save IFC
      </Button>
    </>
  );
};

export default TaskBrowserPanel;
