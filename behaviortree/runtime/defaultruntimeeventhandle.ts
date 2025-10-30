import {EmptyRuntimeEventHandle} from "./emptyruntimeeventhandle"
import { IBehaviorTree, IRebuildSyncDataCollector, ITask, IAction, IParentTask, IComposite } from "../iface/ITask";
import { StackRuntimeData } from "../iface/stackruntimedata";
import { TaskRuntimeData } from "../iface/TaskRuntimeData";
import { TaskStatus,TaskStatusToString } from "../iface/const";

export class DefaultRuntimeEventHandle extends EmptyRuntimeEventHandle{
    PostInitialize(behaviorTree:IBehaviorTree, nowtimestampInMilli:number){
        behaviorTree.Unit().Log().log(`在时间:${nowtimestampInMilli} 角色:${behaviorTree.Unit().ID()} 行为树:${behaviorTree.ID()} =>初始化完成\n`)
    }
	//	树结束
	PostOnComplete(behaviorTree:IBehaviorTree, nowtimestampInMilli:number){
        behaviorTree.Unit().Log().log(`在时间:${nowtimestampInMilli} 角色:${behaviorTree.Unit().ID()} 行为树:${behaviorTree.ID()} =>结束执行\n`)
    }

	//	同步需要
	NewStack(behaviorTree:IBehaviorTree, data:StackRuntimeData){
        behaviorTree.Unit().Log().log(`在时间:${behaviorTree.Clock().TimesampInMill()} 角色:${behaviorTree.Unit().ID()} 行为树:${behaviorTree.ID()} =>增加执行栈${data.StackID}, 时间戳:${data.StartTime}\n`)
    }

	RemoveStack(behaviorTree:IBehaviorTree, data:StackRuntimeData, nowtimestampInMilli:number){
        behaviorTree.Unit().Log().log(`在时间:${behaviorTree.Clock().TimesampInMill()} 角色:${behaviorTree.Unit().ID()} 行为树:${behaviorTree.ID()} =>删除执行栈${data.StackID}, 时间戳:${nowtimestampInMilli}\n`)
    }

	//	以下3个回调可以用于追踪树的执行
	PreOnStart(behaviorTree:IBehaviorTree, taskRuntimeData :TaskRuntimeData, stackRuntimeData:StackRuntimeData, task:ITask){
        behaviorTree.Unit().Log().log(`在时间:${behaviorTree.Clock().TimesampInMill()} 角色:${behaviorTree.Unit().ID()} 行为树:${behaviorTree.ID()} =>在时间:${taskRuntimeData.StartTime} 任务${task.CorrespondingType()}:${task.ID()}-${taskRuntimeData.ExecuteID}进入堆栈:${stackRuntimeData.StackID}\n`)
    }

	PostOnUpdate(behaviorTree:IBehaviorTree, taskRuntimeData :TaskRuntimeData, stackRuntimeData:StackRuntimeData, task:ITask, nowtimestampInMilli:number, status:TaskStatus) {
        behaviorTree.Unit().Log().log(`在时间:${behaviorTree.Clock().TimesampInMill()} 角色:${behaviorTree.Unit().ID()} 行为树:${behaviorTree.ID()} => 在时间:${nowtimestampInMilli}任务:${task.CorrespondingType()}:${task.ID()}-${taskRuntimeData.ExecuteID}在堆栈:${stackRuntimeData.StackID},执行结果:${TaskStatusToString(status)}\n`)
    }

	PostOnEnd(behaviorTree:IBehaviorTree, taskRuntimeData :TaskRuntimeData, stackRuntimeData:StackRuntimeData, task:ITask, nowtimestampInMilli:number){
        behaviorTree.Unit().Log().log(`在时间:${behaviorTree.Clock().TimesampInMill()} 角色:${behaviorTree.Unit().ID()} 行为树:${behaviorTree.ID()} => 在时间:${nowtimestampInMilli}任务:${task.CorrespondingType()}:${task.ID()}-${taskRuntimeData.ExecuteID}离开堆栈:${stackRuntimeData.StackID}\n`, )
    }

	//	需要同步的action的回调，同步需要
	ActionPostOnStart(behaviorTree:IBehaviorTree, taskRuntimeData :TaskRuntimeData, stackRuntimeData:StackRuntimeData, task:ITask, datas:ArrayBuffer[]){
        behaviorTree.Unit().Log().log(`在时间:${behaviorTree.Clock().TimesampInMill()} 角色:${behaviorTree.Unit().ID()} 行为树:${behaviorTree.ID()} => 在时间:${taskRuntimeData.StartTime} 同步任务${task.CorrespondingType()}:${task.ID()}-${taskRuntimeData.ExecuteID}	进入堆栈:${stackRuntimeData.StackID} 同步数据:${datas}\n`)
    }

	ActionPostOnUpdate(behaviorTree:IBehaviorTree, taskRuntimeData :TaskRuntimeData, stackRuntimeData:StackRuntimeData, task:ITask, nowtimestampInMilli:number, status:TaskStatus, datas:ArrayBuffer[]) {
        behaviorTree.Unit().Log().log(`在时间:${behaviorTree.Clock().TimesampInMill()} 角色:${behaviorTree.Unit().ID()} 行为树:${behaviorTree.ID()} => 在时间:${nowtimestampInMilli}	同步任务${task.CorrespondingType()}:${task.ID()}-${taskRuntimeData.ExecuteID}在堆栈:${stackRuntimeData.StackID},执行结果:${TaskStatusToString(status)} 同步数据:${datas}\n`)
    }

	ActionPostOnEnd(behaviorTree:IBehaviorTree, taskRuntimeData :TaskRuntimeData, stackRuntimeData:StackRuntimeData, task:ITask, nowtimestampInMilli:number, datas :ArrayBuffer[]){
        behaviorTree.Unit().Log().log(`在时间:${behaviorTree.Clock().TimesampInMill()} 角色:${behaviorTree.Unit().ID()} 行为树:${behaviorTree.ID()} => 在时间:${nowtimestampInMilli}	同步任务:${task.CorrespondingType()}:${task.ID()}-${taskRuntimeData.ExecuteID}离开堆栈:${stackRuntimeData.StackID} 同步数据:${datas}\n`)
    }

	//	需要同步的并发任务进入调用，同步需要
	ParallelPreOnStart(behaviorTree:IBehaviorTree, taskRuntimeData :TaskRuntimeData, stackRuntimeData:StackRuntimeData, task:ITask){
        behaviorTree.Unit().Log().log(`在时间:${behaviorTree.Clock().TimesampInMill()} 角色:${behaviorTree.Unit().ID()} 行为树:${behaviorTree.ID()} =>在时间:${taskRuntimeData.StartTime} 并发任务${task.CorrespondingType()}:${task.ID()}-${taskRuntimeData.ExecuteID} 进入堆栈:${stackRuntimeData.StackID}\n`)
    }

	ParallelPostOnEnd(behaviorTree:IBehaviorTree, taskRuntimeData :TaskRuntimeData, stackRuntimeData:StackRuntimeData, task:ITask, nowtimestampInMilli:number){
        behaviorTree.Unit().Log().log(`在时间:${behaviorTree.Clock().TimesampInMill()} 角色:${behaviorTree.Unit().ID()} 行为树:${behaviorTree.ID()} => 在时间:${nowtimestampInMilli} 并发任务:${task.CorrespondingType()}:${task.ID()}-${taskRuntimeData.ExecuteID} 离开堆栈:${stackRuntimeData.StackID}\n`) 
    }

	//	并发任务相关的执行栈的增加/减少，调用顺序是NewStack/ParallelAddChildStack/ParallelRemoveChildStack/RemoveStack
	ParallelAddChildStack(behaviorTree:IBehaviorTree, taskRuntimeData :TaskRuntimeData, stackRuntimeData:StackRuntimeData, task:ITask, childStackRuntimeData:StackRuntimeData){
        behaviorTree.Unit().Log().log(`在时间:${behaviorTree.Clock().TimesampInMill()} 角色:${behaviorTree.Unit().ID()} 行为树:${behaviorTree.ID()} => 在时间:${childStackRuntimeData.StartTime}任务:${task.CorrespondingType()}:${task.ID()}-${taskRuntimeData.ExecuteID}在堆栈:${stackRuntimeData.StackID},生成一个子执行栈:${childStackRuntimeData.StackID}\n`)
    }

	ParallelRemoveChildStack(behaviorTree:IBehaviorTree, taskRuntimeData :TaskRuntimeData, stackRuntimeData:StackRuntimeData, task:ITask, childStackRuntimeData:StackRuntimeData, nowtimestampInMilli:number){
        behaviorTree.Unit().Log().log(`在时间:${behaviorTree.Clock().TimesampInMill()} 角色:${behaviorTree.Unit().ID()} 行为树:${behaviorTree.ID()} => 在时间:${nowtimestampInMilli}任务:${task.CorrespondingType()}:${task.ID()}-${taskRuntimeData.ExecuteID}在堆栈:${stackRuntimeData.StackID},弹出子执行栈:${childStackRuntimeData.StackID}\n`)
    }
}
