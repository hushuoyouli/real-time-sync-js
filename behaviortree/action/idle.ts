import { Action } from "../base/atction";
import { TaskStatus } from "../iface/const";
import { btclass } from "../register/btclass";

@btclass("BehaviorDesigner.Runtime.Tasks.Idle")
export class Idle extends Action{
    OnAwake(): void {
        
    }

    OnStart(): void {
        
    }

    OnUpdate(): TaskStatus {
        return TaskStatus.Running;
    }

    OnEnd(): void {
        
    }
}