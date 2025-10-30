export interface ILogger{
    trace(...data: any[]):void
    log(...data: any[]):void
    error(...data: any[]):void
    warn(...data: any[]):void
    debug(...data: any[]):void
}



export class SLogger implements ILogger{
    trace(...data: any[]): void {
       console.trace(...data); 
    }

    log(...data: any[]): void {
        console.log(...data); 
    }

    error(...data: any[]): void {
        console.error(...data); 
    }

    warn(...data: any[]): void {
        console.warn(...data); 
    }

    debug(...data: any[]): void {
        console.debug(...data);
    }
}

export  var Logger:ILogger = new SLogger();
