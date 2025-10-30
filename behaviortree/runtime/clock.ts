import { IClock } from "../iface/IClock";

/*
    默认用的clock
*/

export  class DefaultClock implements IClock{
    taskExecuteID:number
    timesampInMill:number
    constructor() {
        this.taskExecuteID = 1;
        this.timesampInMill = 0;
    }

    IncTimesampInMill(incVal:number){
        this.timesampInMill += incVal
    }

    TimesampInMill(): number {
        return this.timesampInMill
    }

    NextTaskExecuteID(): number {
        return this.taskExecuteID++;
    }
}