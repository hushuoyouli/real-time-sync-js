export enum TaskStatus{
    Inactive,
    Running,
    Success,
	Failure,
}

export function TaskStatusToString(status:TaskStatus):string{
    switch(status){
        case TaskStatus.Failure: return "Failure";
        case TaskStatus.Inactive: return "Inactive";
        case TaskStatus.Running: return "Running";
        case TaskStatus.Success: return "Success";
    }
}

export enum AbortType{
    None,
	Self,
	LowerPriority,
	Both,
}

export function AbortTypeToString(type:AbortType):string{
    switch(type){
        case AbortType.Both: return "Both";
        case AbortType.LowerPriority: return "LowerPriority";
        case AbortType.None: return "None";
        case AbortType.Self: return "Self";
    }
}


