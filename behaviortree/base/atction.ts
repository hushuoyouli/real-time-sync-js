import {IAction} from '../iface/ITask'
import { SyncDataCollector } from '../iface/syncdatacollector'
import { Task } from './task'

export abstract class Action extends Task implements IAction{
    collector:SyncDataCollector

    IsAction(): boolean {
        return true
    }

    IsSyncToClient(): boolean {
        return false
    }

    SendSyncData(data: ArrayBuffer) {
        if(this.collector){
            this.collector.AddData(data)
        }
    }

    RebuildSyncDatas() {
        
    }

    SetSyncDataCollector(collector: SyncDataCollector) {
        this.collector = collector
    }

    SyncDataCollector(): SyncDataCollector {
        return this.collector
    }

    IsImplementsIAction(): boolean {
        return true
    }
}