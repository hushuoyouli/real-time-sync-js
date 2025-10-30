export class TaskRuntimeData{
    TaskID:number
	StartTime:number
	ExecuteID:number
	ActiveStackID:number

    constructor( TaskID:number,       StartTime:number,        ExecuteID:number,        ActiveStackID:number){
        this.TaskID = TaskID;
        this.StartTime = StartTime
        this.ExecuteID = ExecuteID
        this.ActiveStackID = ActiveStackID
    }
}

