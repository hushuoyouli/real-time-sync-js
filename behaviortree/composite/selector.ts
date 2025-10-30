import { Composite } from "../base/composite";
import { TaskStatus } from "../iface/const";
import { btclass } from "../register/btclass";

@btclass("BehaviorDesigner.Runtime.Tasks.Selector")
export class Selector extends Composite{
    currentChildIndex:number
    executionStatus:TaskStatus

    OnAwake(): void {
        this.executionStatus = TaskStatus.Inactive
        this.currentChildIndex = 0
    }

    OnStart(): void {
        
    }

    CanRunParallelChildren(): boolean {
        return false
    }

    OnChildExecuted1(childStatus: TaskStatus): void {
        this.currentChildIndex++
        this.executionStatus = childStatus
    }

    OnChildStarted0(): void {
        super.OnChildStarted0()
    }

    CurrentChildIndex(): number {
        return this.currentChildIndex
    }

    CanExecute(): boolean {
        return this.currentChildIndex < this.Children().length && this.executionStatus != TaskStatus.Success
    }

    OnConditionalAbort(index: number): void {
        this.currentChildIndex = index
        this.executionStatus = TaskStatus.Failure
    }

    OnCancelConditionalAbort(): void {
        this.currentChildIndex = 0
        this.executionStatus = TaskStatus.Inactive
    }

    OnEnd(): void {
        this.currentChildIndex = 0
        this.executionStatus = TaskStatus.Inactive
    }
}