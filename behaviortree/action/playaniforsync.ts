import { Action } from "../base/atction";
import { TaskStatus } from "../iface/const";
import { btclass } from "../register/btclass";

@btclass("BehaviorDesigner.Runtime.Tasks.PlayAniForSync")
export class PlayAniForSync extends Action{
    AnimationName:string
    IsLoop:boolean

    OnStart(): void {
        
    }

    OnUpdate(): TaskStatus {
        return TaskStatus.Running
    }

    OnEnd(): void {
        
    }

    RebuildSyncDatas(): void {
        
    }

    IsSyncToClient():boolean{
        return true
    }

    SetVariables(variableConfigs:Map<string, any>):Error{
        //console.log("Setting variables", variableConfigs)
        if(variableConfigs.has("AnimationName")){
            this.AnimationName = variableConfigs.get("AnimationName") as string
        }

        if(variableConfigs.has("isLoop")){
            this.IsLoop = variableConfigs.get("isLoop") as boolean
        }

        return null
    }
}