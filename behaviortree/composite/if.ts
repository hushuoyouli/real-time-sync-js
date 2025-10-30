import { Composite } from "../base/composite";
import { TaskStatus } from "../iface/const";
import { btclass } from "../register/btclass";

@btclass("BehaviorDesigner.Runtime.Tasks.If")
export class If extends Composite{
    currentChildIndex:number
    executionStatus:TaskStatus

    OnStart(): void {
        this.executionStatus = TaskStatus.Inactive;
        this.currentChildIndex = 0;
    }

    MaxChildren(): number {
        return 3
    }

    CanRunParallelChildren(): boolean {
        return false
    }

    OnChildExecuted1(childStatus: TaskStatus): void {
        if(this.currentChildIndex == 0){
            if(childStatus == TaskStatus.Success){
                this.currentChildIndex = 1
            }else{
                this.currentChildIndex = 2
            }

            this.executionStatus = childStatus
        } else{
            this.executionStatus = childStatus
            this.currentChildIndex = 3
        }
    }

    OnChildStarted0(): void {
        super.OnChildStarted0()
    }

    CurrentChildIndex(): number {
        return this.currentChildIndex
    }

    CanExecute(): boolean {
        return this.currentChildIndex < this.Children().length
    }

    OnConditionalAbort(index: number): void {
        this.currentChildIndex = index
    }

    OnEnd(): void {
        
    }
} 

