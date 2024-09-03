import * as OBC from "@thatopen/components";
import * as WEBIFC from "web-ifc"
import { transformCsv } from "./src/transform-csv"

// task manager is responsible for
// adding tasks to a model
// adding a master task for further tasks
// read tasks from a model
// removing tasks from a model


export class TaskManager extends OBC.Component {
    static uuid = "bd12cd80-7d34-4ab0-b34e-05b7dd617e46" as const;

    private _enabled = false


    constructor(components: OBC.Components) {
        super(components)
        components.add(TaskManager.uuid, this)
    }

    set enabled(value: boolean) {
        this._enabled = value
    }

    get enabled() {
        return this._enabled
    }


    getTestData(): {}[] {
        // We're using the file system API to read the schedule.csv as an string
        //const csvData = fs.readFileSync("./src/schedule.csv", { encoding: "utf-8" })
        // Then, the CSV string is converted into the object shown in the picture above
        const data = transformCsv(exampleTaskData)
        console.log(data)
        return data;

        //this.readFile(new File())

        // Based on the IFC documentation, all first-level tasks must be
        // tied together by a "master" task.
        // The "master" task is called the summary task.
    }

    async setupExistingTasks(modelID: number, data: {}[]): Promise<Uint8Array | undefined> {
        if (!this.components) return;

        const loader = this.components.get(OBC.IfcLoader);
        if (!loader) return;

        await loader.webIfc.Init();

        const summaryTask = newTask({ Name: "Summary" }, modelID, loader.webIfc)

        // This relation is to hold together all first-level tasks with the
        // summary tasks, as denoted by the IFC schema.
        const summaryTaskNests = new WEBIFC.IFC4X3.IfcRelNests(
            newGUID(),
            getOwnerHistoryHandle(modelID, loader.webIfc),
            null,
            null,
            new WEBIFC.Handle(summaryTask.expressID),
            []
        )

        saveEntity(modelID, loader.webIfc, summaryTaskNests)

        // Here is where the real processing starts, as we took the conversion
        // from the CSV file into the more workable structure and start to create
        // the corresponding IFC data.
        for (const task of data) {
            processTaskData(task, summaryTaskNests, modelID, loader.webIfc)
        }

        // The schedule in the IFC schema is denoted by the IfcWorkSchedule entity.
        const schedule = new WEBIFC.IFC4X3.IfcWorkSchedule(
            newGUID(),
            getOwnerHistoryHandle(modelID, loader.webIfc),
            new WEBIFC.IFC4X3.IfcLabel("Planned Schedule"),
            null,
            null,
            null,
            new WEBIFC.IFC4X3.IfcDateTime("now"),
            null,
            null,
            null,
            null,
            new WEBIFC.IFC4X3.IfcDateTime("later"),
            null,
            null,
        )

        saveEntity(modelID, loader.webIfc, schedule)

        // A relation of type IfcRelAssignsToControl is needed to tell the schedule
        // controls the summary tasks (and, consequently, all the schedule tasks)
        const controlRel = new WEBIFC.IFC4X3.IfcRelAssignsToControl(
            newGUID(),
            getOwnerHistoryHandle(modelID, loader.webIfc),
            null,
            null,
            [new WEBIFC.Handle(summaryTask.expressID)],
            null,
            new WEBIFC.Handle(schedule.expressID)
        )

        saveEntity(modelID, loader.webIfc, controlRel)

        //Finally, we need to relate the IfcWorkSchedule with the project it-self,
        const projectHandle = getProjectHandle(modelID,loader.webIfc)
        if (projectHandle) {
            const declaresRel = new WEBIFC.IFC4X3.IfcRelDeclares(
                newGUID(),
                getOwnerHistoryHandle(modelID, loader.webIfc),
                null,
                null,
                projectHandle,
                [new WEBIFC.Handle(schedule.expressID)]
            )
            saveEntity(modelID,loader.webIfc,declaresRel)
        }

        const outputIfc = loader.webIfc.SaveModel(modelID)
        return outputIfc;

    }

    readFile(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target?.result as string);
            reader.onerror = (error) => reject(error);
            reader.readAsText(file);
        });
    }




}

// The input data is just one row from the converted CSV information.
// Take a look at the video for more context about this.
const newTask = (data: any, modelID: number, ifc: WEBIFC.IfcAPI) => {
    const { Name, Description, Identification } = data
    // Is important to know the IFC data type to be used in each entity attribute.
    // In the case of the Name attribute, the IFC data type is IfcLabel.
    // You can know the data types by looking at the specific IFC entity documentation.
    const name = Name ? new WEBIFC.IFC4X3.IfcLabel(Name) : null
    const description = Description ? new WEBIFC.IFC4X3.IfcText(Description) : null
    const identification = Identification ? new WEBIFC.IFC4X3.IfcIdentifier(Identification) : null

    const task = new WEBIFC.IFC4X3.IfcTask(
        newGUID(),
        getOwnerHistoryHandle(modelID, ifc),
        name,
        description,
        null,
        identification,
        null,
        null,
        null,
        new WEBIFC.IFC4X3.IfcBoolean(false),
        null,
        null,
        null,
    )

    // Here we use the function to save the entity in the file.
    saveEntity(modelID, ifc, task)
    return task
}

const processTaskData = (task: any, ifcRel: any, modelID: number, ifc: WEBIFC.IfcAPI) => {
    const { data, children } = task
    const { ID, Name, Description, Start, Finish } = data
    const ifcTask = newTask({ Name, Description, Identification: ID }, modelID, ifc)
    const taskHandle = new WEBIFC.Handle(ifcTask.expressID)
    if (ifcRel) {
        ifcRel.RelatedObjects.push(taskHandle)
        ifc.WriteLine(modelID, ifcRel)
    }
    if (children && children.length !== 0) {
        // If the task have children, it means we need to link them.
        // The kind of relation between an IfcTask and another is IfcRelNests.
        // Here, we create a single IfcRelNests for the ifcTask in order to
        // add all its child tasks.
        const taskNests = new WEBIFC.IFC4X3.IfcRelNests(
            newGUID(),
            null,
            null,
            null,
            taskHandle,
            []
        )
        saveEntity(modelID, ifc, taskNests)
        for (const child of children) {
            processTaskData(child, taskNests, modelID, ifc)
        }
    }
}

const getOwnerHistoryHandle = (modelID: number, ifc: WEBIFC.IfcAPI) => {

    console.log("TaskManager history handle", modelID,ifc)
    const ids = ifc.GetLineIDsWithType(modelID, WEBIFC.IFCOWNERHISTORY)
    console.log("history owner", ids)

    // As there is supposed to be just one IfcOwnerHistory, we can safely take the first element.
    const ownerHistoryID = ids.get(0)
    if (ownerHistoryID) return new WEBIFC.Handle(ownerHistoryID)
    return null
}

// This is doing the same as the getOwnerHistoryHandle function,
// just that it gives a reference to the IfcProject entity in the file
const getProjectHandle = (modelID: number, ifc: WEBIFC.IfcAPI) => {
    const ids = ifc.GetLineIDsWithType(modelID, WEBIFC.IFCPROJECT)
    const projectID = ids.get(0)
    if (projectID) return new WEBIFC.Handle(projectID)
    return null
}

// Most entities in the schema requires a GUID.
// This function just creates a random IfcGloballyUniqueId to be used in new entities.
const newGUID = () => {
    return new WEBIFC.IFC4X3.IfcGloballyUniqueId(crypto.randomUUID())
}


// New entities created must be explicitly save inside the IFC file.
// This function takes an entity, gives it a new expressID based on the last found
// and then writes the information inside the file.
const saveEntity = (modelID: number, ifc: WEBIFC.IfcAPI, entity: WEBIFC.IfcLineObject) => {
    const expressID = ifc.GetMaxExpressID(modelID) + 1
    entity.expressID = expressID
    console.log("ifc writing line", modelID,entity)
    console.log("ifc models", ifc)
    ifc.WriteLine(modelID, entity)

}




const exampleTaskData = `ID,Name,Description,Start,Finish
1,Site Preparation,Clear the site and set up initial facilities,2024-01-01,2024-01-10
1.1,Survey and Marking,Survey the site and mark the boundaries,2024-01-01,2024-01-02
1.2,Excavation,Excavate the foundation area,2024-01-03,2024-01-06
1.2.1,Topsoil Removal,Remove topsoil and vegetation,2024-01-03,2024-01-04
1.2.2,Trench Digging,Dig trenches for foundation,2024-01-05,2024-01-06
1.3,Temporary Facilities,Set up temporary office and storage areas,2024-01-07,2024-01-10
2,Foundation,Build the foundation of the building,2024-01-11,2024-01-25
2.1,Footings,Construct the footings,2024-01-11,2024-01-15
2.1.1,Rebar Placement,Place rebar for footings,2024-01-11,2024-01-12
2.1.2,Concrete Pouring,Pour concrete for footings,2024-01-13,2024-01-15
2.2,Foundation Walls,Build the foundation walls,2024-01-16,2024-01-20
2.3,Backfilling,Backfill around the foundation,2024-01-21,2024-01-25
3,Superstructure,Construct the main structure of the building,2024-01-26,2024-02-28
3.1,Columns and Beams,Install columns and beams,2024-01-26,2024-02-10
3.1.1,Column Rebar,Install rebar for columns,2024-01-26,2024-01-30
3.1.2,Beam Formwork,Set up formwork for beams,2024-02-01,2024-02-05
3.2,Floor Slabs,Pour the concrete floor slabs,2024-02-11,2024-02-20
3.3,Roof Structure,Construct the roof structure,2024-02-21,2024-02-28
4,Exterior,Complete the exterior of the building,2024-03-01,2024-03-31
4.1,Wall Framing,Frame the exterior walls,2024-03-01,2024-03-10
4.2,Windows and Doors,Install windows and doors,2024-03-11,2024-03-20
4.3,Exterior Finishing,Apply exterior finishes,2024-03-21,2024-03-31
5,Interior,Complete the interior of the building,2024-04-01,2024-04-30
5.1,Wall and Ceiling Framing,Frame interior walls and ceilings,2024-04-01,2024-04-10
5.1.1,Interior Wall Framing,Frame interior partition walls,2024-04-01,2024-04-05
5.1.2,Ceiling Joists,Install ceiling joists,2024-04-06,2024-04-10
5.2,Electrical and Plumbing,Install electrical and plumbing systems,2024-04-11,2024-04-20
5.3,Interior Finishes,Install interior finishes,2024-04-21,2024-04-30
6,Final Inspection and Handover,Inspect and hand over the completed building,2024-05-01,2024-05-10
6.1,Final Inspection,Conduct final inspection and address issues,2024-05-01,2024-05-05
6.1.1,Inspection Punch List,Create punch list of issues,2024-05-01,2024-05-02
6.1.2,Issue Resolution,Address punch list issues,2024-05-03,2024-05-05
6.2,Handover,Hand over the completed building to the owner,2024-05-06,2024-05-10`;