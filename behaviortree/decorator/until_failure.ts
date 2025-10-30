import { Decorator } from "../base/decorator";
import { TaskStatus } from "../iface/const";
import { btclass } from "../register/btclass";

@btclass("BehaviorDesigner.Runtime.Tasks.UntilFailure")
export class UntilFailure extends Decorator{
    executionStatus:TaskStatus
    OnAwake(): void {
        this.executionStatus = TaskStatus.Inactive
    }

    CanExecute(): boolean {
        return this.executionStatus == TaskStatus.Success||this.executionStatus == TaskStatus.Inactive
    }

    OnEnd(): void {
        this.executionStatus = TaskStatus.Inactive
    }

    OnChildExecuted1(childStatus: TaskStatus): void {
        this.executionStatus = childStatus
    }
}