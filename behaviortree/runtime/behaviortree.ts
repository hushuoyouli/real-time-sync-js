import { IBehaviorTree, IRebuildSyncDataCollector, ITask, IAction, IParentTask, IComposite } from "../iface/ITask";
import { IUnit } from "../iface/iunit";
import { IClock } from "../iface/IClock";
import { TaskStatus, AbortType } from "../iface/const";
import {ConditionalReevaluate} from "./conditionalreevaluate"
import { StackRuntimeData } from "../iface/stackruntimedata";
import { TaskRuntimeData } from "../iface/TaskRuntimeData";
import { IRuntimeEventHandle } from "../iface/iruntimeeventhandle";
import {SyncDataCollector} from "../iface/syncdatacollector"
import {TaskAddData, Deserialize} from "../parser/deserialize";
import {EntryRoot} from "../decorator/entry_root"

class Stack{
    stackID:number
    taskList:number[]
    constructor(stackID:number){
        this.stackID = stackID
        this.taskList = new Array;
    }

    Len():number{
        return this.taskList.length
    }

    Peak():number{
        return this.taskList[this.taskList.length - 1]
    }

    Push(taskIndex:number){
        this.taskList.push(taskIndex)
    }

    Pop(){
        this.taskList.pop()
    }
}

export class BehaviorTree implements IBehaviorTree{
    protected id:number

    protected taskList:ITask[]
    protected parentIndex:number[]
	protected childrenIndex:number[][]
	protected relativeChildIndex:number[]

    protected activeStack:Stack[]
	protected nonInstantTaskStatus:TaskStatus[]
	protected conditionalReevaluate:ConditionalReevaluate[]
	protected conditionalReevaluateMap:Map<number, ConditionalReevaluate>

    protected parentCompositeIndex:number[]
	protected childConditionalIndex:number[][]

    protected isRunning:boolean
    protected initializeFirstStackAndFirstTask:boolean
    protected executionStatus:TaskStatus
    protected config:string
    protected unit:IUnit
    protected rootTask:ITask
    protected clock:IClock
    protected stackID:number
    protected stackID2StackData:Map<number, StackRuntimeData>

    protected taskDatas:Map<number, TaskRuntimeData>

    protected stackID2ParallelTaskID:Map<number, number>
    protected parallelTaskID2StackIDs:Map<number, number[]>

    protected runtimeEventHandle:IRuntimeEventHandle
    protected initializeForBaseFlag:boolean

    protected extraParam:any

    constructor(config:string, unit:IUnit, clock:IClock, runtimeEventHandle:IRuntimeEventHandle){
        this.taskList = new Array();
        this.parentIndex = new Array();
        this.childrenIndex = new Array();
        this.relativeChildIndex = new Array();

        this.activeStack = new Array();
        this.nonInstantTaskStatus = new Array();
        this.conditionalReevaluate = new Array();
        this.conditionalReevaluateMap = new Map<number, ConditionalReevaluate>;

        this.parentCompositeIndex = new Array();
        this.childConditionalIndex = new Array();

        this.isRunning = false
        this.executionStatus = TaskStatus.Inactive
        this.config = config
        this.unit = unit
        this.rootTask = null

        this.clock = clock
        this.stackID = 1
        this.stackID2StackData = new Map;
        this.taskDatas = new Map;

        this.stackID2ParallelTaskID = new Map;
        this.parallelTaskID2StackIDs = new Map;

        this.runtimeEventHandle = runtimeEventHandle
        this.initializeForBaseFlag = false

        this.extraParam = null
    }

    ExtraParam():any{
        return this.extraParam
    }

    SetExtraParam(param:any){
        this.extraParam = param
    }

    Config():string{
        return this.config
    }

    Clock():IClock{
        return this.clock
    }

    SetClock(clock:IClock){
        this.clock = clock
    }

    SetRuntimeEventHandle(runtimeEventHandle:IRuntimeEventHandle){
        this.runtimeEventHandle = runtimeEventHandle
    }

    ID():number{
        return this.id
    }

    IsRunning():boolean{
        return this.isRunning
    }

    protected static behaviorTreeId:number = 1

    protected static nextBehaviorTreeID():number{
        var val = BehaviorTree.behaviorTreeId
        BehaviorTree.behaviorTreeId++
        return val 
    }

    Unit():IUnit{
        return this.unit
    }

    SetUnit(unit:IUnit){
        this.unit = unit
        if(this.initializeForBaseFlag){
            this.taskList.forEach((task:ITask, index:number, array:ITask[]) =>{
                task.SetUnit(unit)
            })
        }
    }

    RebuildSync(collector:IRebuildSyncDataCollector){
        if(this.isRunning){
            this.activeStack.forEach((val:Stack, stackIndex:number, array:Stack[]) =>{
                var stackRuntimeData = this.getStackRuntimeData(stackIndex)
                collector.Stack(this, stackRuntimeData)
            })
            
            this.activeStack.forEach((stack:Stack, stackIndex:number, array:Stack[]) =>{
                if(stack.Len() > 0){
                    var stackRuntimeData = this.getStackRuntimeData(stackIndex)
                    var taskId = stack.Peak()
				    var task = this.taskList[taskId]
                    if(task.IsImplementsIAction()){
                        var action = task as IAction
                        if(action.IsSyncToClient()){
                            var taskRuntimeData = this.taskDatas.get(task.ID())
                            action.SyncDataCollector().GetAndClear()
                            action.RebuildSyncDatas()
                            var syncDatas = action.SyncDataCollector().GetAndClear()
                            collector.Action(this, taskRuntimeData, stackRuntimeData, task, syncDatas)
                        }
                    }else if(task.IsImplementsIParentTask()){
                        var parentTask = task as IParentTask
                        if(parentTask.CanRunParallelChildren()){
                            var taskRuntimeData = this.taskDatas.get(parentTask.ID())
                            var childStackRuntimeDatas = new Array<StackRuntimeData>();
                            this.parallelTaskID2StackIDs.get(parentTask.ID()).forEach((childStackID:number, index:number, array:number[])=>{
                                childStackRuntimeDatas.push(this.stackID2StackData.get(childStackID))
                            })

                            collector.Parallel(this, taskRuntimeData, stackRuntimeData, task, childStackRuntimeDatas)
                        }
                    }
                }
            })
        }
    }

    ExecutionStatus():TaskStatus{
        return this.executionStatus
    }

    Enable():Error{
        if(!this.isRunning){
            this.executionStatus = TaskStatus.Inactive
            this.id = BehaviorTree.nextBehaviorTreeID()

            var err = this.Initialize()
            if(err){
                return err
            }

            this.taskList.forEach((task:ITask, index:number, array:ITask[]) => {
                if(task.IsImplementsIAction()){
                    var action = task as IAction
                    if(action.IsSyncToClient()){
                        action.SetSyncDataCollector(new SyncDataCollector())
                    }
                }
            })

            this.taskList.forEach((task:ITask, index:number, array:ITask[]) => {
                if(!task.Disabled()){
                    task.OnAwake()
                }
            })

            this.executionStatus = TaskStatus.Running
		    this.isRunning = true
            
            var nowTimesampInMill = this.clock.TimesampInMill()
            this.runtimeEventHandle.PostInitialize(this, nowTimesampInMill)

            this.initializeFirstStackAndFirstTask = true
            return null
        }else{
            return new Error("already running")
        }
    }

	Disable():Error{
        if(this.isRunning){
            var status = TaskStatus.Success
            for(var i = this.activeStack.length - 1; i >= 0; i--){
                while(this.activeStack[i].Len() > 0) {
                    var stackCount = this.activeStack[i].Len()
                    status = this.PopTask(this.activeStack[i].Peak(), i, status, false)
                    if(stackCount == 1) {
                        break
                    }
                }
            }

            this.taskList.forEach((task:ITask, index:number, array:ITask[]) =>{
                if(!task.Disabled()){
                    task.OnComplete()
                }
            })

            this.RemoveChildConditionalReevaluate(-1)
            //数据收集器解析掉
            this.taskList.forEach((task:ITask, index:number, array:ITask[]) =>{
                if(task.IsImplementsIAction()){
                    var action = task as IAction
                    if(action.IsSyncToClient()) {
                        var collector = action.SyncDataCollector()
                        if(collector != null) {
                            collector.GetAndClear()
                            action.SetSyncDataCollector(null)
                        }
                    }
                }
            })

            this.executionStatus = status
            this.isRunning = false
            this.runtimeEventHandle.PostOnComplete(this, this.clock.TimesampInMill())
            return null
        }else{
            return new Error("not running")
        }
    }

	Update(){
        if(this.isRunning){
            if(this.initializeFirstStackAndFirstTask){
                this.AddStack()
                this.PushTask(0, 0)
                this.initializeFirstStackAndFirstTask = false
            }

            this.ReevaluateConditionalTasks()

            for(var j = this.activeStack.length - 1; j > -1; j--) {
                var status = TaskStatus.Inactive
                var startIndex = -1
                var taskIndex  = 0

                //	通过判断当前位置上的队列是否是同一个
                var currentStack = this.activeStack[j]
                while(status != TaskStatus.Running && j < this.activeStack.length && this.activeStack[j].Len() > 0 && currentStack == this.activeStack[j]) {
                    taskIndex = this.activeStack[j].Peak()
                    if(!this.isRunning) {
                        break
                    }
    
                    if(this.activeStack[j].Len() > 0 && startIndex == this.activeStack[j].Peak()) {
                        break
                    }
    
                    startIndex = taskIndex
                    status = this.RunTask(taskIndex, j, status)
                }
            }
        }
    }

    protected Initialize():Error{
        if (!this.initializeForBaseFlag){
            var err = this.initializeForBase()
            if(err){
                return err
            }

            this.initializeForBaseFlag = true
        }

        this.stackID = 1

        this.activeStack = new Array();
        this.nonInstantTaskStatus = new Array();
        this.conditionalReevaluate = new Array();
        this.conditionalReevaluateMap = new Map();

        return null
    }

    protected PushTask(taskIndex:number, stackIndex:number){
        if(!this.isRunning || stackIndex >= this.activeStack.length){
            return
        }

        if(this.activeStack[stackIndex].Len() == 0||this.activeStack[stackIndex].Peak() != taskIndex){
            this.activeStack[stackIndex].Push(taskIndex)
            this.nonInstantTaskStatus[stackIndex] = TaskStatus.Running
            
            var task = this.taskList[taskIndex]
            
            var stack = this.activeStack[stackIndex]
            var stackData = this.stackID2StackData.get(stack.stackID)
            var nowTimestamp = this.clock.TimesampInMill()
            var taskExecuteID = this.nextTaskExecuteID()

            var taskRuntimeData = new TaskRuntimeData(task.ID(), nowTimestamp, taskExecuteID, stackData.StackID)
            this.taskDatas.set(task.ID(), taskRuntimeData)

            this.runtimeEventHandle.PreOnStart(this, taskRuntimeData, stackData, task)
            if(task.IsImplementsIParentTask()){
                var parentTask = task as IParentTask
                if(parentTask.CanRunParallelChildren()){
                    this.runtimeEventHandle.ParallelPreOnStart(this, taskRuntimeData, stackData, task)
                } 
            }

            //	先清理数据
            if(task.IsImplementsIAction()){
                var action = task as IAction
                if(action.IsSyncToClient()){
                    action.SyncDataCollector().GetAndClear()
                }
            }

            task.OnStart()
            if(task.IsImplementsIAction()){
                var action = task as IAction
                if(action.IsSyncToClient()){
                    var datas = action.SyncDataCollector().GetAndClear()
                    this.runtimeEventHandle.ActionPostOnStart(this, taskRuntimeData, stackData, task, datas)
                }
            }

            if(task.IsImplementsIConditional()){
                if(this.conditionalReevaluateMap.has(taskIndex)){
                    var conditionalReevaluate = this.conditionalReevaluateMap.get(taskIndex)
                    conditionalReevaluate.compositeIndex = -1
                }
            }

            if(task.IsImplementsIParentTask()){
                var parentTask = task as IParentTask
                if(parentTask.CanRunParallelChildren()){
                    this.parallelTaskID2StackIDs.set(task.ID(), new Array)
                }

                if(task.IsImplementsIComposite()){
                    var compositeTask = task as IComposite
                    if(compositeTask.AbortType() != AbortType.None){
                        this.conditionalReevaluate.forEach((conditionalReevaluate:ConditionalReevaluate, index:number, array:ConditionalReevaluate[]) =>{
                            if(this.IsParentTask(taskIndex, conditionalReevaluate.index)){
                                conditionalReevaluate.compositeIndex = taskIndex
                            }
                        })

                        if( compositeTask.AbortType() == AbortType.LowerPriority){
                            var childConditionalIndexes = this.childConditionalIndex[compositeTask.ID()]
                            childConditionalIndexes.forEach((childConditionalIndex:number, index:number, array:number[]) =>{
                                if(this.conditionalReevaluateMap.has(childConditionalIndex)){
                                    var conditionalReevaluate = this.conditionalReevaluateMap.get(childConditionalIndex)
                                    conditionalReevaluate.compositeIndex = -1
                                }
                            })
                        }
                    }
                }
            }
        }
    }

    protected PopTask(taskIndex:number, stackIndex:number, status:TaskStatus, popChildren:boolean):TaskStatus {
        if(!this.isRunning){
            return status
        }

        if(stackIndex >= this.activeStack.length){
            return status
        }

        if (this.activeStack[stackIndex].Len() == 0 || taskIndex != this.activeStack[stackIndex].Peak()) {
            return status
        }

        this.activeStack[stackIndex].Pop()
        this.nonInstantTaskStatus[stackIndex] = TaskStatus.Inactive

        var task = this.taskList[taskIndex]
        //	清理数据
        if(task.IsImplementsIAction()) {
            var action = task as IAction
            if(action.IsSyncToClient()) {
                action.SyncDataCollector().GetAndClear()
            }
        }

        task.OnEnd()
        var parentIndex = this.parentIndex[taskIndex]
        if(parentIndex != -1){
            if(task.IsImplementsIConditional()){
                var compositeParentIndex = this.parentCompositeIndex[taskIndex]
                if(compositeParentIndex != -1){
                    var compositeTask = this.taskList[compositeParentIndex] as IComposite
                    if(compositeTask.AbortType() != AbortType.None) {
                        //var conditionalReevaluate = [taskIndex]
                        var composite = -1
                        if(compositeTask.AbortType() != AbortType.LowerPriority) {
                            composite = compositeParentIndex
                        }
    
                        if(!this.conditionalReevaluateMap.has(taskIndex)) {
                            //index int, taskStatus iface.TaskStatus, compositeIndex int,	stackIndex int
                            var conditionalReevaluate = new ConditionalReevaluate(taskIndex, status, composite)
                            this.conditionalReevaluate.push(conditionalReevaluate)
                            this.conditionalReevaluateMap.set(taskIndex, conditionalReevaluate)
                        } else {
                            var conditionalReevaluate = this.conditionalReevaluateMap.get(taskIndex)
                            conditionalReevaluate.Initialize(taskIndex, status, composite)
                        }
                    }
                }
            }

            var parentTask = this.taskList[parentIndex] as IParentTask
            if(!parentTask.CanRunParallelChildren()){
                parentTask.OnChildExecuted1(status)
                status = parentTask.Decorate(status)
            }else{
                parentTask.OnChildExecuted2(this.relativeChildIndex[taskIndex], status)
            }
        }

        if(task.IsImplementsIParentTask()){
            if(task.IsImplementsIComposite()){
                var compositeTask = task as IComposite
                if(compositeTask.AbortType() == AbortType.Self || compositeTask.AbortType() == AbortType.None) {
                    this.RemoveChildConditionalReevaluate(taskIndex)
                }else if(compositeTask.AbortType() == AbortType.Both || compositeTask.AbortType() == AbortType.LowerPriority){
                    this.conditionalReevaluate.forEach((conditionalReevaluate:ConditionalReevaluate, index:number, array:ConditionalReevaluate[]) =>{
                        if(this.IsParentTask(taskIndex, conditionalReevaluate.index)){
                            conditionalReevaluate.compositeIndex = this.parentCompositeIndex[taskIndex]
                        }
                    })
                }
            }
        }

        if(popChildren){
            for(var i = this.activeStack.length - 1; i > stackIndex; i--){
                var stack = this.activeStack[i]
                while(i < this.activeStack.length&&stack == this.activeStack[i]&&this.activeStack[i].Len() != 0){
                    if(this.IsParentTask(taskIndex, this.activeStack[i].Peak())){
                        var childStatus = TaskStatus.Failure
                        this.PopTask(this.activeStack[i].Peak(), i, childStatus, false)
                    }else{
                        break
                    }   
                }
            }
        }
       
        var taskRuntimeData = this.taskDatas.get(task.ID())
        var stackData = this.getStackRuntimeData(stackIndex)
        var nowTimestamp = this.clock.TimesampInMill()
        this.runtimeEventHandle.PostOnEnd(this, taskRuntimeData, stackData, task, nowTimestamp)

        if(task.IsImplementsIAction()){
            var action = task as IAction
            if(action.IsSyncToClient()){
                var datas = action.SyncDataCollector().GetAndClear()
			    this.runtimeEventHandle.ActionPostOnEnd(this, taskRuntimeData, stackData, task, nowTimestamp, datas)
            }
        }

        //  删除任务运行时数据
        if(task.IsImplementsIParentTask()) {
            var parentTask = task as IParentTask
            if(parentTask.CanRunParallelChildren()){
                this.runtimeEventHandle.ParallelPostOnEnd(this, taskRuntimeData, stackData, task, nowTimestamp)
			    this.parallelTaskID2StackIDs.delete(task.ID())
            }
        }

        this.taskDatas.delete(task.ID())
        if(this.activeStack[stackIndex].Len() == 0){
            if(stackIndex === 0){
                this.RemoveStack(stackIndex)
                this.Disable()
                this.executionStatus = status
			    status = TaskStatus.Inactive
            }else{
                this.RemoveStack(stackIndex)
                status = TaskStatus.Running
            }
        }
        
        return status
    }

    protected AddStack():number {
        var stackIndex = this.activeStack.length
        var stackID = this.nextStackID()
        var stack = new Stack(stackID)
        this.activeStack.push(stack)
        this.nonInstantTaskStatus.push(TaskStatus.Inactive)
        
        var timestampInMill = this.clock.TimesampInMill()
        var stackData = new StackRuntimeData(stackID, timestampInMill)
        this.runtimeEventHandle.NewStack(this, stackData)
        this.stackID2StackData.set(stackID, stackData)

        return stackIndex
    }

    protected RemoveStack(stackIndex:number) {
        if(stackIndex < this.activeStack.length){
            var stack = this.activeStack[stackIndex]
            var stackData = this.stackID2StackData.get(stack.stackID)
            var nowTimesampInMill = this.clock.TimesampInMill()

            if(this.stackID2ParallelTaskID.has(stackData.StackID)){
                var parallelTaskID = this.stackID2ParallelTaskID.get(stackData.StackID)
                var taskRunTimeData = this.taskDatas.get(parallelTaskID)
                var parentStackData = this.stackID2StackData.get(taskRunTimeData.ActiveStackID)
                var task = this.taskList[taskRunTimeData.TaskID]
                this.runtimeEventHandle.ParallelRemoveChildStack(this, taskRunTimeData, parentStackData, task, stackData, nowTimesampInMill)
                
                this.stackID2ParallelTaskID.delete(stackData.StackID)
                var newParallelTaskID2StackIDs = this.parallelTaskID2StackIDs.get(task.ID()).filter((value:number, index:number, array:number[]) =>{
                    return value != stackData.StackID
                })

                this.parallelTaskID2StackIDs.set(task.ID(), newParallelTaskID2StackIDs)
            }
    
            this.runtimeEventHandle.RemoveStack(this, stackData, nowTimesampInMill)
            this.stackID2StackData.delete(stackData.StackID)
            this.activeStack.splice(stackIndex)
            this.nonInstantTaskStatus.splice(stackIndex)
        }
    }

    protected RemoveChildConditionalReevaluate(compositeIndex:number){
        for(var i = this.conditionalReevaluate.length - 1; i > -1; i--){
            if(this.IsParentTask(compositeIndex, this.conditionalReevaluate[i].index)){
                var conditionalIndex = this.conditionalReevaluate[i].index
                this.conditionalReevaluateMap.delete(conditionalIndex)
			    this.conditionalReevaluate.splice(i)
            }
        }
    }

    protected IsParentTask(possibleParent:number, possibleChild:number):boolean{
        var parentIndex = 0
        var childIndex = possibleChild

        while(childIndex != -1) {
            parentIndex = this.parentIndex[childIndex]
            if(parentIndex == possibleParent){
                return true
            }

            childIndex = parentIndex
        }

        return false
    }

    protected nextStackID():number {
        return this.stackID++
    }

    protected nextTaskExecuteID():number {
        return this.clock.NextTaskExecuteID()
    }

    protected ParseChildTask(task:ITask, parent:IParentTask, parentCompositeIndex:number):Error{
        var index = this.taskList.length
        var parentIndex = parent.ID()
        
        this.childrenIndex[parentIndex].push(index)
        this.relativeChildIndex.push(this.childrenIndex[parentIndex].length - 1)
        this.taskList.push(task)
        this.parentIndex.push(parent.ID())
        this.parentCompositeIndex.push(parentCompositeIndex)
        this.childConditionalIndex.push(new Array)
        this.childrenIndex.push(new Array)

        task.SetID(index)
        task.SetParent(parent)
        task.SetOwner(this)

        if(task.IsImplementsIParentTask()){
            if(task.IsImplementsIComposite()){
                parentCompositeIndex = task.ID()
            }

            var parentTask = task as IParentTask
            var children = parentTask.Children()
            for(var i = 0; i < children.length; i++){
                var childTask = children[i]
                var err = this.ParseChildTask(childTask, parentTask, parentCompositeIndex)
                if(err){
                    return err
                }
            }
        } else {
            if(task.IsImplementsIConditional()){
                if(parentCompositeIndex != -1){
                    this.childConditionalIndex[parentCompositeIndex].push(task.ID())
                }
            }
        }

        return null
    }

    protected initializeForBase():Error{
        this.taskList = new Array()
        this.parentIndex = new Array()
        this.childrenIndex = new Array()
        this.relativeChildIndex = new Array()


        this.parentCompositeIndex = new Array()
        this.childConditionalIndex = new Array()
        this.rootTask = null

        var taskAddData = new TaskAddData(this, this.unit)
        var [rootTask, err] = Deserialize(this.config, taskAddData)
        if(err){
            return err
        }

        /*增加一个空的EntryRoot*/
        var entryRoot = new EntryRoot()
        entryRoot.SetOwner(rootTask.Owner())
        entryRoot.SetUnit(rootTask.Unit())
        entryRoot.SetCorrespondingType("EntryRoot")
        entryRoot.SetName("EntryRoot")
        entryRoot.AddChild(rootTask)
        rootTask = entryRoot

        this.rootTask = rootTask
        this.taskList.push(this.rootTask)
        this.parentIndex.push(-1)
        this.parentCompositeIndex.push(-1)
        this.childConditionalIndex.push(new Array())
        this.childrenIndex.push(new Array())
        this.relativeChildIndex.push(-1)

        var parentCompositeIndex = -1
        this.rootTask.SetID(0)

        if(this.rootTask.IsImplementsIParentTask()){
            if(this.rootTask.IsImplementsIComposite()){
                parentCompositeIndex = this.rootTask.ID()
            }

            var parentTask = this.rootTask as IParentTask
            var children = parentTask.Children()
            for(var i = 0; i < children.length; i++){
                var childTask = children[i]
                var err = this.ParseChildTask(childTask, parentTask, parentCompositeIndex)
                if(err){
                    return err
                }
            }
        }
        
        return null
    }

    protected getStackRuntimeData(stackIndex:number):StackRuntimeData {
        var stack = this.activeStack[stackIndex]
        return this.stackID2StackData.get(stack.stackID)
    }

    protected ReevaluateConditionalTasks() {
        var updateConditionIndexes = new Array<ConditionalReevaluate>;
        for(var i = this.conditionalReevaluate.length - 1; i > -1; i--){
            var conditionalReevaluate = this.conditionalReevaluate[i]
            if(conditionalReevaluate.compositeIndex != -1){
                var conditionalIndex = conditionalReevaluate.index
			    var conditionalStatus = this.taskList[conditionalIndex].OnUpdate()
                if(conditionalStatus != conditionalReevaluate.taskStatus) {
                    var compositeIndex = conditionalReevaluate.compositeIndex
                    for(var j = this.activeStack.length - 1; j > -1; j--) {
                        if(this.activeStack[j].Len() > 0){
                            var taskIndex = this.activeStack[j].Peak()
                            if(!this.IsParentTask(compositeIndex, taskIndex)) {
                                continue
                            }

                            var stackCount = this.activeStack.length
                            while(taskIndex != -1 && taskIndex != compositeIndex && this.activeStack.length == stackCount) {
                                var status = TaskStatus.Failure
                                this.PopTask(taskIndex, j, status, false)
                                taskIndex = this.parentIndex[taskIndex]
                            }
                        } 
                    }
                    
                    for(var j = this.conditionalReevaluate.length - 1; j > i; j--){
                        var jConditionalReval = this.conditionalReevaluate[j]
                        if(this.IsParentTask(compositeIndex, jConditionalReval.index)) {
                            this.conditionalReevaluateMap.delete(jConditionalReval.index)
                            this.conditionalReevaluate.splice(j)
                        }
                    }

                    //	原先abort过的要设置为原位
                    for(var i = updateConditionIndexes.length - 1; i > -1; i--) {
                        var jConditionalReval = updateConditionIndexes[i]
                        if(this.IsParentTask(compositeIndex, jConditionalReval.index)) {
                            var taskIndex = this.parentIndex[jConditionalReval.index]
                            while(taskIndex != -1 && taskIndex != jConditionalReval.compositeIndex) {
                                var task = this.taskList[taskIndex] as IParentTask
                                task.OnCancelConditionalAbort()
                                taskIndex = this.parentIndex[taskIndex]
                            }

                            updateConditionIndexes.splice(i)
                        }
                    }

                    updateConditionIndexes.push(conditionalReevaluate)
                    //是否需要把当前的conditionalReevaluate也删除掉？需要
                    this.conditionalReevaluateMap.delete(conditionalIndex)
                    this.conditionalReevaluate.splice(i)

                    var conditionalParentIndexes = new Array<number>()
                    var parentIndex = conditionalIndex
                    while(true){
                        parentIndex = this.parentIndex[parentIndex]
                        conditionalParentIndexes.push(parentIndex)
                        if(parentIndex == compositeIndex) {
                            break
                        }
                    }

                    for(var j = conditionalParentIndexes.length - 1; j > -1; j--) {
                        var parentTask = this.taskList[conditionalParentIndexes[j]] as IParentTask
                        if(j==0){
                            parentTask.OnConditionalAbort(this.relativeChildIndex[conditionalIndex])
                        }else{
                            parentTask.OnConditionalAbort(this.relativeChildIndex[conditionalParentIndexes[j-1]])
                        }
                    }
                } 
            }
        }
    }

    protected FindLCA(taskindex1:number, taskIndex2:number):number{
        var set = new Set<number>
        var parentIndex = this.parentCompositeIndex[taskindex1]
    
        while(true){
            set.add(parentIndex)
            if(parentIndex == -1){
                break
            }

            parentIndex = this.parentCompositeIndex[parentIndex]
        }
    
        parentIndex = this.parentCompositeIndex[taskIndex2]
        while(true) {
            if(set.has(parentIndex)) {
                return parentIndex
            }

            if(parentIndex == -1){
                break
            }
    
            parentIndex = this.parentCompositeIndex[parentIndex]
        }
    
        return -1
    }

    protected RunTask(taskIndex:number, stackIndex:number, previousStatus:TaskStatus):TaskStatus {
        if(taskIndex >= this.taskList.length) {
            return previousStatus
        }

        var task = this.taskList[taskIndex]
        if(task.Disabled()){
            var parentIndex = this.parentIndex[taskIndex]
            if(parentIndex != -1) {
                var parentTask = this.taskList[parentIndex] as IParentTask
                if(!parentTask.CanRunParallelChildren()) {
                    parentTask.OnChildExecuted1(TaskStatus.Inactive)
                } else {
                    parentTask.OnChildExecuted2(this.relativeChildIndex[taskIndex], TaskStatus.Inactive)
                }
            }

            var status = TaskStatus.Success
            if(this.activeStack[stackIndex].Len() == 0) {
                if(stackIndex == 0) {
                    this.RemoveStack(stackIndex)
                    this.Disable()
                    this.executionStatus = status
                    status = TaskStatus.Inactive
                } else {
                    this.RemoveStack(stackIndex)
                    status = TaskStatus.Running
                }
            }
            return status
        }

        var status = previousStatus
        if(!task.IsInstant() && (this.nonInstantTaskStatus[stackIndex] == TaskStatus.Failure || this.nonInstantTaskStatus[stackIndex] == TaskStatus.Success)) {
            status = this.nonInstantTaskStatus[stackIndex]
            status = this.PopTask(taskIndex, stackIndex, status, true)
            return status
        }

        this.PushTask(taskIndex, stackIndex)
        if(task.IsImplementsIParentTask()) {
            [status, stackIndex] = this.RunParentTask(taskIndex, stackIndex, status)
            var parentTask = task as IParentTask
            status = parentTask.OverrideStatus1(status)
        } else {
            //	清理同步数据
            if(task.IsImplementsIAction()) {
                var action = task as IAction
                if(action.IsSyncToClient()) {
                    action.SyncDataCollector().GetAndClear()
                }
            }

            status = task.OnUpdate()
        }

        var taskRunTimeData = this.taskDatas.get(taskIndex)
        var stack = this.activeStack[stackIndex]
        var stackRuntimeData = this.stackID2StackData.get(stack.stackID)

        var nowTimesampInMill = this.clock.TimesampInMill()
        this.runtimeEventHandle.PostOnUpdate(this, taskRunTimeData, stackRuntimeData, task, nowTimesampInMill, status)

        if(task.IsImplementsIAction()){
            var action = task as IAction
            if(action.IsSyncToClient()){
                var datas = action.SyncDataCollector().GetAndClear()
			    this.runtimeEventHandle.ActionPostOnUpdate(this, taskRunTimeData, stackRuntimeData, task, nowTimesampInMill, status, datas)
            }
        }

        if(status != TaskStatus.Running){
            if(task.IsInstant()) {
                status = this.PopTask(taskIndex, stackIndex, status, true)
            } else {
                this.nonInstantTaskStatus[stackIndex] = status
                status = TaskStatus.Running
            }
        }

        return status
    }

    protected RunParentTask(taskIndex:number, stackIndex:number, status:TaskStatus):[TaskStatus, number]{
        var parentTask = this.taskList[taskIndex] as IParentTask
        if(!parentTask.CanRunParallelChildren() || parentTask.OverrideStatus1(TaskStatus.Running) != TaskStatus.Running) {
            var childStatus = TaskStatus.Inactive
            var parentStack = stackIndex
            var parentStackRunTimeData = this.getStackRuntimeData(stackIndex)
            var taskRuntimeData = this.taskDatas.get(taskIndex)
            var childrenIndexes = this.childrenIndex[taskIndex]
            
            while(parentTask.CanExecute() && (childStatus != TaskStatus.Running || parentTask.CanRunParallelChildren()) && this.isRunning) {
                var childIndex = parentTask.CurrentChildIndex()
    
                if(parentTask.CanRunParallelChildren()) {
                    stackIndex = this.AddStack()
                    var childStackRunTimeData = this.getStackRuntimeData(stackIndex)
                    this.stackID2ParallelTaskID.set(childStackRunTimeData.StackID, parentTask.ID())
                    this.parallelTaskID2StackIDs.get(parentTask.ID()).push(childStackRunTimeData.StackID)
                    this.runtimeEventHandle.ParallelAddChildStack(this, taskRuntimeData, parentStackRunTimeData, parentTask, childStackRunTimeData)

                    parentTask.OnChildStarted1(childIndex)
                } else {
                    parentTask.OnChildStarted0()
                }
    
                childStatus = this.RunTask(childrenIndexes[childIndex], stackIndex, status)
                status = childStatus
            }

            stackIndex = parentStack
        }

        return [status, stackIndex]
    }
}