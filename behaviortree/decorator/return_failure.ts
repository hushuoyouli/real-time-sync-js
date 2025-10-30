import { Decorator } from "../base/decorator";
import { TaskStatus } from "../iface/const";
import { btclass } from "../register/btclass";

@btclass("BehaviorDesigner.Runtime.Tasks.ReturnFailure")
export class ReturnFailure extends Decorator{
    executionStatus:TaskStatus

    OnAwake(): void {
        this.executionStatus = TaskStatus.Inactive
    }

    CanExecute(): boolean {
        return this.executionStatus == TaskStatus.Running || this.executionStatus == TaskStatus.Inactive
    }

    OnEnd(): void {
        this.executionStatus = TaskStatus.Inactive
    }

    OnChildExecuted1(childStatus: TaskStatus): void {
        this.executionStatus = childStatus
    }

    Decorate(status: TaskStatus): TaskStatus {
        if (status == TaskStatus.Success){
            return TaskStatus.Failure
        }

        return TaskStatus.Failure
    }
}