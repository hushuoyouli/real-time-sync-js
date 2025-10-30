import { TaskStatus } from "../iface/const";
import { IParentTask, ITask } from "../iface/ITask";
import { Task } from "./task";

export abstract class ParentTask extends Task implements IParentTask{
    childTasks:ITask[]

    constructor(){
        super()
        this.childTasks = new Array();
    }

    MaxChildren(): number {
        return Number.MAX_VALUE
    }

    CanRunParallelChildren(): boolean {
        return false
    }

    OnChildExecuted1(childStatus: TaskStatus) {
        
    }

    OnChildStarted0() {
        
    }

    OnChildExecuted2(index: number, childStatus: TaskStatus) {
        
    }

    OnChildStarted1(index: number) {
        
    }

    CurrentChildIndex(): number {
        return 0
    }

    CanExecute(): boolean {
        return true
    }

    Decorate(status: TaskStatus): TaskStatus {
        return status
    }

    OverrideStatus0(): TaskStatus {
        return TaskStatus.Running
    }

    OverrideStatus1(status: TaskStatus): TaskStatus {
        return status
    }

    OnConditionalAbort(index: number) {
        
    }

    OnCancelConditionalAbort() {
        
    }

    Children(): ITask[] {
        return this.childTasks
    }

    AddChild(task: ITask) {
        this.childTasks.push(task)
    }

    IsImplementsIParentTask(): boolean {
        return true
    }
}