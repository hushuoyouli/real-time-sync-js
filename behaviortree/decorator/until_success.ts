import { Decorator } from "../base/decorator";
import { Task } from "../base/task";
import { TaskStatus } from "../iface/const";
import { btclass } from "../register/btclass";

@btclass("BehaviorDesigner.Runtime.Tasks.UntilSuccess")
export class UntilSuccess extends Decorator{
    executionStatus:TaskStatus
    OnAwake(): void {
        
    }

    CanExecute(): boolean {
        return this.executionStatus == TaskStatus.Failure || this.executionStatus == TaskStatus.Inactive
    }

    OnEnd(): void {
        
    }

    OnChildExecuted1(childStatus: TaskStatus): void {
        this.executionStatus = childStatus;
    }
}