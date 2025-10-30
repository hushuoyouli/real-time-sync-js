import { TaskStatus } from "../iface/const";
import { ITask,IBehaviorTree,IParentTask } from "../iface/ITask";
import {IUnit} from "../iface/iunit";

export abstract class Task implements ITask{
    correspondingType:string
	owner:IBehaviorTree
	parent:IParentTask
	id:number
	name:string
	isInstant:boolean
	disabled:boolean
	unit:IUnit
    CorrespondingType(): string {
        return this.correspondingType
    }

    SetCorrespondingType(correspondingType: string): void {
        this.correspondingType = correspondingType
    }

    Owner(): IBehaviorTree {
        return this.owner
    }

    SetOwner(owner: IBehaviorTree) {
        this.owner = owner
    }

    Parent(): IParentTask {
        return this.parent
    }
    SetParent(parent: IParentTask) {
        this.parent = parent
    }

    ID(): number {
        return this.id
    }

    SetID(id: number) {
        this.id = id
    }

    Name(): string {
        return this.name
    }

    SetName(name: string) {
        this.name = name
    }

    IsInstant(): boolean {
        return this.isInstant
    }

    SetIsInstant(isInstant: boolean) {
        this.isInstant = isInstant
    }

    Disabled(): boolean {
        return this.disabled
    }

    SetDisabled(disabled: boolean) {
        this.disabled = disabled
    }
    Unit(): IUnit {
        return this.unit
    }

    SetUnit(unit: IUnit) {
        this.unit = unit
    }

    OnAwake() {
        
    }

    OnStart() {
        
    }

    OnUpdate(): TaskStatus {
        return TaskStatus.Success
    }

    OnEnd() {
        
    }

    OnComplete() {
        
    }

    IsImplementsIAction(): boolean {
        return false
    }

    IsImplementsIComposite(): boolean {
        return false
    }

    IsImplementsIDecorator(): boolean {
        return false
    }

    IsImplementsIConditional(): boolean {
        return false
    }

    IsImplementsIParentTask(): boolean {
        return false
    }

    SetVariables(variableConfigs:Map<string, any>):Error{
        return null
    }
}

