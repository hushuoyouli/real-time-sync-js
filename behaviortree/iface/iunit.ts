import {ILogger} from  '../rlog/log';
export interface IUnit  {
	ID():number
	Log():ILogger
}