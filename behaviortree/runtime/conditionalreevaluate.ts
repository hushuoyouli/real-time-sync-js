import { TaskStatus } from "../iface/const"

export class ConditionalReevaluate{
    index:number
    taskStatus:TaskStatus
    compositeIndex:number

    constructor(index:number, taskStatus:TaskStatus, compositeIndex:number){
        this.index = index
        this.taskStatus = taskStatus
        this.compositeIndex = compositeIndex
    }

    Initialize(index:number, taskStatus:TaskStatus, compositeIndex:number){
        this.index = index
        this.taskStatus = taskStatus
        this.compositeIndex = compositeIndex
    }
}

