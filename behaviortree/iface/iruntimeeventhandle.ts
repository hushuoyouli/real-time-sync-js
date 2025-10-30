import {TaskRuntimeData} from "./TaskRuntimeData"
import {StackRuntimeData} from "./stackruntimedata"
import {IBehaviorTree,ITask} from "./ITask"
import {TaskStatus} from "./const"

export interface  IRuntimeEventHandle{
	PostInitialize(behaviorTree:IBehaviorTree, nowtimestampInMilli:number)
	//	树结束
	PostOnComplete(behaviorTree:IBehaviorTree, nowtimestampInMilli:number)

	//	同步需要
	NewStack(behaviorTree:IBehaviorTree, data:StackRuntimeData)
	RemoveStack(behaviorTree:IBehaviorTree, data:StackRuntimeData, nowtimestampInMilli:number)

	//	以下3个回调可以用于追踪树的执行
	PreOnStart(behaviorTree:IBehaviorTree, taskRuntimeData :TaskRuntimeData, stackRuntimeData:StackRuntimeData, task:ITask)
	PostOnUpdate(behaviorTree:IBehaviorTree, taskRuntimeData :TaskRuntimeData, stackRuntimeData:StackRuntimeData, task:ITask, nowtimestampInMilli:number, status:TaskStatus) //	任何的任务每帧调用的结果
	PostOnEnd(behaviorTree:IBehaviorTree, taskRuntimeData :TaskRuntimeData, stackRuntimeData:StackRuntimeData, task:ITask, nowtimestampInMilli:number)

	//	需要同步的action的回调，同步需要
	ActionPostOnStart(behaviorTree:IBehaviorTree, taskRuntimeData :TaskRuntimeData, stackRuntimeData:StackRuntimeData, task:ITask, datas:ArrayBuffer[])
	ActionPostOnUpdate(behaviorTree:IBehaviorTree, taskRuntimeData :TaskRuntimeData, stackRuntimeData:StackRuntimeData, task:ITask, nowtimestampInMilli:number, status:TaskStatus, datas:ArrayBuffer[]) //	任何的任务每帧调用的结果
	ActionPostOnEnd(behaviorTree:IBehaviorTree, taskRuntimeData :TaskRuntimeData, stackRuntimeData:StackRuntimeData, task:ITask, nowtimestampInMilli:number, datas :ArrayBuffer[])

	//	需要同步的并发任务进入调用，同步需要
	ParallelPreOnStart(behaviorTree:IBehaviorTree, taskRuntimeData :TaskRuntimeData, stackRuntimeData:StackRuntimeData, task:ITask)
	ParallelPostOnEnd(behaviorTree:IBehaviorTree, taskRuntimeData :TaskRuntimeData, stackRuntimeData:StackRuntimeData, task:ITask, nowtimestampInMilli:number)

	//	并发任务相关的执行栈的增加/减少，调用顺序是NewStack/ParallelAddChildStack/ParallelRemoveChildStack/RemoveStack
	ParallelAddChildStack(behaviorTree:IBehaviorTree, taskRuntimeData :TaskRuntimeData, stackRuntimeData:StackRuntimeData, task:ITask, childStackRuntimeData:StackRuntimeData)
	ParallelRemoveChildStack(behaviorTree:IBehaviorTree, taskRuntimeData :TaskRuntimeData, stackRuntimeData:StackRuntimeData, task:ITask, childStackRuntimeData:StackRuntimeData, nowtimestampInMilli:number)
}