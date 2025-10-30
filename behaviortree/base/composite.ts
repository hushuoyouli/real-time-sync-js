import { AbortType } from "../iface/const";
import { IComposite } from "../iface/ITask";
import { ParentTask } from "./parenttask";

export  abstract class Composite extends ParentTask  implements IComposite{
    abortType:AbortType

    AbortType(): AbortType {
        return this.abortType
    }
    SetAbortType(abortType: AbortType) {
        this.abortType = abortType
    }

    IsComposite(): boolean {
        return true
    }

    IsImplementsIComposite(): boolean {
        return true
    }
}