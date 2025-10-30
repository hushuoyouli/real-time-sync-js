import { IDecorator } from "../iface/ITask";
import { ParentTask } from "./parenttask";

export abstract class Decorator extends ParentTask implements IDecorator{
    MaxChildren(): number {
        return 1
    }

    IsDecorator(): boolean {
        return true
    }


    IsImplementsIDecorator(): boolean {
        return true
    }
}

