import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Log, LogDocument } from './log.schema';
import { LogType } from './log.dto';

@Injectable()
export class LogService {
    constructor(@InjectModel(Log.name) private logModel: Model<LogDocument>) {}

    async findAll(): Promise<Log[]> {
        return this.logModel.find().exec();
    }

    async create(createLogDto: LogType): Promise<Log> {
        const createdLog = new this.logModel(createLogDto);
        return createdLog.save();
    }

    async update(id: string, updateLogDto: LogType): Promise<Log> {
        return this.logModel.findByIdAndUpdate(id, updateLogDto);
    }
    
    async delete(id: string): Promise<Log> {
        return this.logModel.findByIdAndDelete(id);
    }
}