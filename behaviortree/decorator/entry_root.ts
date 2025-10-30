import { Decorator } from "../base/decorator";
import { TaskStatus } from "../iface/const";

/*
    NOTICE:这个类用来占位用,没有其他用途
*/

export class EntryRoot extends Decorator{
    executionStatus:TaskStatus

    OnAwake(): void {
        this.executionStatus = TaskStatus.Inactive
    }

    CanExecute(): boolean {
        return this.executionStatus == TaskStatus.Inactive
    }

    OnStart(): void {
        
    }

    OnEnd(): void {
        this.executionStatus = TaskStatus.Inactive
    }

    OnChildExecuted1(childStatus: TaskStatus): void {
        this.executionStatus = childStatus
    }
}