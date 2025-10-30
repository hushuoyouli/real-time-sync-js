import { Composite } from "../base/composite";
import { TaskStatus } from "../iface/const";
import { btclass } from "../register/btclass";

@btclass("BehaviorDesigner.Runtime.Tasks.Parallel")
export class Parallel extends Composite{
    currentChildIndex:number
	executionStatus:TaskStatus[]

    OnAwake(): void {
        this.executionStatus = new Array();
        this.currentChildIndex = 0
        for(var i = 0; i < this.Children.length; i++){
            this.executionStatus.push(TaskStatus.Inactive)
        }
    }

    OnStart(): void {
        
    }

    CanRunParallelChildren(): boolean {
        return true
    }

    OnChildExecuted2(index: number, childStatus: TaskStatus): void {
        this.executionStatus[index] = childStatus
    }

    OnChildStarted1(index: number): void {
        this.currentChildIndex++
        this.executionStatus[index] = TaskStatus.Running
    }

    CurrentChildIndex(): number {
        return this.currentChildIndex
    }

    CanExecute(): boolean {
        return this.currentChildIndex < this.Children().length
    }

    OverrideStatus1(status: TaskStatus): TaskStatus {
        var childrenComplete = true

        for (var i = 0; i < this.executionStatus.length; i++){
            if(this.executionStatus[i] == TaskStatus.Running){
                childrenComplete = false
            }else if(this.executionStatus[i] == TaskStatus.Failure){
                return TaskStatus.Failure
            }
        }

        if(childrenComplete){
            return TaskStatus.Success
        }else{
            return TaskStatus.Running
        }
    }

    OnConditionalAbort(index: number): void {
         this.currentChildIndex = 0
         for(var i = 0; i < this.executionStatus.length; i++){
            this.executionStatus[i] = TaskStatus.Inactive
         }
    }

    OnCancelConditionalAbort(): void {
        
    }

    OnEnd(): void {
        this.currentChildIndex = 0
        for(var i = 0; i < this.executionStatus.length; i++){
            this.executionStatus[i] = TaskStatus.Inactive
        }
    }
}
