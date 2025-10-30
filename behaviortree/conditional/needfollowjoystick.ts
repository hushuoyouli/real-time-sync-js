import { Conditional } from "../base/conditional";
import { TaskStatus } from "../iface/const";
import { btclass } from "../register/btclass";

/*
    NOTICE:测试用
*/ 
//export var NeedFollowJoystickFlag = false

@btclass("BehaviorDesigner.Runtime.Tasks.Role.MainRole.NeedFollowJoystick")
export class NeedFollowJoystick extends Conditional{
    static NeedFollowJoystickFlag = false
    OnStart(): void {
        
    }

    OnUpdate(): TaskStatus {
        if (NeedFollowJoystick.NeedFollowJoystickFlag){
            return TaskStatus.Success
        }else{
            return TaskStatus.Failure
        }
    }

    OnEnd(): void {
        
    }
}
