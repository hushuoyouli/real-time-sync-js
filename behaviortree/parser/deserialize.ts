import { _decorator, Component, Node,resources, JsonAsset } from 'cc';

import { IParentTask,IBehaviorTree, ITask, IComposite } from "../iface/ITask";
import { IUnit } from "../iface/iunit";
import { nodeClsMap } from "../register/btclass";
import { AbortType } from "../iface/const";

export class TaskAddData{
    Parent:IParentTask
    ParentIndex:number
	Depth:number
	CompositeParentIndex:number
	Owner:IBehaviorTree
	Unit:IUnit
	ErrorTask:number
	ErrrorTaskName:string

    constructor(Owner:IBehaviorTree, Unit:IUnit){
        this.Parent = null
        this.ParentIndex = -1
        this.Depth = 0
        this.CompositeParentIndex = 0
        this.Owner = Owner
        this.Unit = Unit
        this.ErrorTask = -1
        this.ErrrorTaskName = ""
    }
}

export function Deserialize(jsonText:string, taskAddData:TaskAddData): [ITask, Error] {
    var configJsonObj:Object
    try{
        configJsonObj = JSON.parse(jsonText) as Object
    }catch(e){
        return [null, e]
    }


    if (!configJsonObj.hasOwnProperty("RootTask")){
        return [null, new Error("jsonw文件缺少RootTask的配置")]
    }

    var task2VariableConfigs = new Map<ITask, Map<string, any>>()
    var rootJsonTaskConfig = configJsonObj["RootTask"] as Object
    var id2Task =new Map<Number, ITask>()
    var [rootTask, err] = initializeTask(rootJsonTaskConfig, id2Task, task2VariableConfigs)
    if(err){
        return [null, err]
    }

    var detachedTasksConfigs:Object[] = new Array();
    if(configJsonObj.hasOwnProperty("DetachedTasks")){
        detachedTasksConfigs = configJsonObj["DetachedTasks"] as Object[]
    }

    var detachedTasks:ITask[] = new Array();
    for(var i = 0; i < detachedTasksConfigs.length; i++){
        var detachedTasksConfig = detachedTasksConfigs[i]
        var [detachedTask, err] = initializeTask(detachedTasksConfig, id2Task, task2VariableConfigs)
        if(err){
            return [null, err]
        }

        detachedTasks.push(detachedTask)
    }

    task2VariableConfigs.forEach((variableMap:Map<string, any>, task:ITask, map:Map<ITask, Map<string, any>>) => {
        if(variableMap.size > 0){
            var variableConfigs = new Map<string, any>()
            variableMap.forEach((value: any, key: string) => {
                var ks = key.split(",")
                variableConfigs.set(ks[ks.length - 1].trim(), value)
            })

            task.SetVariables(variableConfigs)
        }
    })
    
    initializeParentTask(rootTask, taskAddData)

    return [rootTask, null]
}

function initializeParentTask(task:ITask, taskAddData:TaskAddData){
   task.SetParent(taskAddData.Parent)
   task.SetOwner(taskAddData.Owner)
   task.SetUnit(taskAddData.Unit)

   if(task.IsImplementsIParentTask()){
        var parent = taskAddData.Parent

        var parentTask = task as IParentTask
        taskAddData.Parent = parentTask
        parentTask.Children().forEach((child:ITask, index:number, array:ITask[]) => {
            initializeParentTask(child, taskAddData)
        })

        taskAddData.Parent = parent
    }
}

function initializeTask(config:Object, id2Task:Map<Number, ITask>, task2VariableConfigs:Map<ITask, Map<string, any>>): [ITask, Error] {
    var correspondingType = config["Type"] as string
    if (!nodeClsMap.get(correspondingType)){
        return [null, new Error(`未找到${correspondingType}的Task类`)]
    }

    var cls = nodeClsMap.get(correspondingType)  as any
    var task = new cls() as ITask    
    var variableConfigs = new Map<string, any>()

    for(var key in config) {
        var val = config[key]
        switch (key) {
            case "Type":
                task.SetCorrespondingType(val as string)
                break
            case "Children":
                break
            case "Name":
                task.SetName(val as string)
                break
            case "ID":
                task.SetID(val as number)
                break
            case "Instant":
                task.SetIsInstant(val as boolean)
                break
            case "Disabled":
                task.SetDisabled(val as boolean)
                break
            case "BehaviorDesigner.Runtime.Tasks.AbortType,abortType":
                if(task.IsImplementsIComposite()){
                    var compositeTask = task as IComposite
                    switch(val as String){
                        case "Both":
                            compositeTask.SetAbortType(AbortType.Both)
                            break
                        case "Self":
                            compositeTask.SetAbortType(AbortType.Self)
                            break
                        case "LowerPriority":
                            compositeTask.SetAbortType(AbortType.LowerPriority)
                            break
                        default:
                            compositeTask.SetAbortType(AbortType.None)
                            break
                    }

                }
                break
            default:
                variableConfigs.set(key, val)
                break
        }
    }
    
    var taskID = task.ID()
    if(taskID == 0){
        return [null, new Error("任务缺少配置参数ID")]
    }

    if(id2Task.has(taskID)){
        return [null, new Error(`任务ID${taskID}有冲突`)]
    }

    id2Task.set(taskID, task)
    task2VariableConfigs.set(task, variableConfigs)

    if(task.IsImplementsIParentTask()){
        if(config.hasOwnProperty("Children")){
            var parentTask = task as IParentTask 
            var childrenCondfigs = config["Children"] as any[];

            for(let childConfig of childrenCondfigs){
                var [childTask, err] = initializeTask(childConfig as Map<string, any>, id2Task, task2VariableConfigs)
                if(err){
                    return [null, err]
                }

                childTask.SetParent(parentTask)
                parentTask.AddChild(childTask)
            }
        }
    }
    return [task, null]
}

