import { Composite } from "../base/composite";
import { TaskStatus } from "../iface/const";
import { btclass } from "../register/btclass";

@btclass("BehaviorDesigner.Runtime.Tasks.Sequence")
export class Sequence extends Composite{
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
        this.currentChildIndex ++
        this.executionStatus = childStatus
    }

    OnChildStarted0(): void {
        super.OnChildStarted0()
    }

    CurrentChildIndex(): number {
        return this.currentChildIndex
    }

    CanExecute(): boolean {
        return this.currentChildIndex < this.Children().length && this.executionStatus != TaskStatus.Failure
    }

    OnConditionalAbort(index: number): void {
        this.currentChildIndex = index
        this.executionStatus = TaskStatus.Inactive
    }

    OnCancelConditionalAbort(): void {
        this.executionStatus = TaskStatus.Inactive
        this.currentChildIndex = 0
    }

    OnEnd(): void {
        this.executionStatus = TaskStatus.Inactive
        this.currentChildIndex = 0
    }
}

