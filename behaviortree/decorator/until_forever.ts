import { Decorator } from "../base/decorator";
import { TaskStatus } from "../iface/const";
import { btclass } from "../register/btclass";

@btclass("BehaviorDesigner.Runtime.Tasks.UntilForever")
export class UntilForever extends Decorator{
    OnAwake(): void {
        
    }

    CanExecute(): boolean {
        return true
    }

    OnEnd(): void {
        
    }

    OnChildExecuted1(childStatus: TaskStatus): void {
        
    }
}