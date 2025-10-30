export class SyncDataCollector{
    datas:ArrayBuffer[]
    constructor(){
        this.datas = [];
    }

    AddData(data:ArrayBuffer){
        this.datas.push(data)
    }

    GetAndClear():ArrayBuffer[]{
        let datas = this.datas
        this.datas = []
        return datas
    }
}