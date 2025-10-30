import {IUnit} from "../iface/iunit"
import {ILogger, SLogger} from "../rlog/index"

export class TestUnit implements IUnit{
    log:ILogger

    constructor(){
        this.log = new SLogger()
    }

    ID():number{
        return 0
    }

    Log():ILogger{
        return  this.log
    }
}