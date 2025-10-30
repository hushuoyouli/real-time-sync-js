import { IUnit } from "./iunit"
import { TaskStatus,AbortType } from "./const"
import {SyncDataCollector} from "./syncdatacollector"
import {StackRuntimeData} from "./stackruntimedata"
import {IClock} from "./IClock"
import {TaskRuntimeData} from "./TaskRuntimeData"

export interface ITask{
    //	对应客户端的名字
	CorrespondingType():string
	SetCorrespondingType(correspondingType:string):void
	//	所属的树
	Owner():IBehaviorTree
	SetOwner(owner:IBehaviorTree)
	//	父节点
	Parent():IParentTask
	SetParent(parent:IParentTask)
	//	ID
	ID():number
	SetID(id:number)
	//	名字
	Name():string
	SetName(name:string)
	//是否是Instant
	IsInstant() :boolean
	SetIsInstant(isInstant:boolean)
	//是否无效
	Disabled():boolean
	SetDisabled(disabled:boolean)
	//树的宿主
	Unit():IUnit
	SetUnit(unit:IUnit)

	OnAwake()
	OnStart()
	OnUpdate():TaskStatus
	OnEnd()
	OnComplete()


	IsImplementsIAction():boolean
	IsImplementsIComposite():boolean
	IsImplementsIDecorator():boolean
	IsImplementsIConditional():boolean
	IsImplementsIParentTask():boolean

	SetVariables(variableConfigs:Map<string, any>):Error
}


export interface IParentTask extends ITask {
    MaxChildren():number
	CanRunParallelChildren():boolean
	/*
		跟是否可以并发有关的
		OnChildExecuted
		OnChildStarted
		OverrideStatus
	*/
	//	CanRunParallelChildren	为false的时候调用
	OnChildExecuted1(childStatus:TaskStatus)
	OnChildStarted0()

	//	CanRunParallelChildren	为true的时候调用
	OnChildExecuted2(index:number, childStatus:TaskStatus)
	OnChildStarted1(index:number)

	CurrentChildIndex():number
	CanExecute():boolean
	Decorate(status:TaskStatus):TaskStatus

	OverrideStatus0():TaskStatus
	OverrideStatus1(status:TaskStatus):TaskStatus

	OnConditionalAbort(index:number)
	OnCancelConditionalAbort() //当Abort取消的时候，会调用这个接口

	Children():ITask[]
	AddChild(task:ITask)
}

export interface IAction extends ITask{
    IsAction():boolean

	//	是否需要同步到客户端
	IsSyncToClient():boolean
	SendSyncData(data:ArrayBuffer)
	RebuildSyncDatas()
	SetSyncDataCollector(collector:SyncDataCollector)
	SyncDataCollector():SyncDataCollector
    
}

export interface IBehaviorTree{
    ID():number

	Enable():Error
	Disable():Error
	Update()
	IsRunning():boolean

	Unit():IUnit
	RebuildSync(collector:IRebuildSyncDataCollector)

	Clock():IClock

	ExtraParam():any
}

export interface IRebuildSyncDataCollector{
    Stack(behaviorTree:IBehaviorTree, data:StackRuntimeData)

	//	需要同步的action的回调
	Action(behaviorTree:IBehaviorTree, taskRuntimeData:TaskRuntimeData, stackRuntimeData:StackRuntimeData, task:ITask, datas:ArrayBuffer[])

	//	并发任务相关的执行栈恢复同步数据
	Parallel(behaviorTree:IBehaviorTree, taskRuntimeData:TaskRuntimeData, stackRuntimeData:StackRuntimeData, task:ITask, childStackRuntimeDatas:StackRuntimeData[])
}

export interface IComposite extends IParentTask{
    AbortType():AbortType
    SetAbortType(abortType:AbortType)
    IsComposite():boolean
}

export interface IConditional extends ITask {
    IsConditional():boolean 
}

export interface IDecorator extends IParentTask{
    IsDecorator():boolean
}
