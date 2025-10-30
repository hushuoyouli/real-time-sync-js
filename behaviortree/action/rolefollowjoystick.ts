import { Action } from "../base/atction";
import { TaskStatus } from "../iface/const";
import { btclass } from "../register/btclass";

/*
    NOTICE:测试用
*/
@btclass("BehaviorDesigner.Runtime.Tasks.Role.MainRole.RoleFollowJoystick")
export class RoleFollowJoystick extends Action{
    
    OnStart(): void {
        
    }

    OnUpdate(): TaskStatus {
        return TaskStatus.Running
    }

    OnEnd(): void {
    }

    IsSyncToClient(): boolean {
        return true
    }

    RebuildSyncDatas(): void {
        
    }
}