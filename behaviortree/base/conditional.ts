import { IConditional } from "../iface/ITask";
import { Task } from "./task";

export abstract class Conditional extends Task implements IConditional{
    IsConditional(): boolean {
        return true
    }

    IsImplementsIConditional(): boolean {
        return true
    }
}