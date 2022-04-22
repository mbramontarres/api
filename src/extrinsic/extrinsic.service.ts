import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Extrinsic, ExtrinsicDocument } from './extrinsic.schema';
import { ExtrinsicType } from './extrinsic.dto';

@Injectable()
export class ExtrinsicService {
    constructor(@InjectModel(Extrinsic.name) private extrinsicModel: Model<ExtrinsicDocument>) {}

    async findAll(): Promise<Extrinsic[]> {
        return this.extrinsicModel.find().exec();
    }

    async create(createExtrinsicDto: ExtrinsicType): Promise<Extrinsic> {
        const createdExtrinsic = new this.extrinsicModel(createExtrinsicDto);
        return createdExtrinsic.save();
    }

    async update(id: string, updateExtrinsicDto: ExtrinsicType): Promise<Extrinsic> {
        return this.extrinsicModel.findByIdAndUpdate(id, updateExtrinsicDto);
    }
    
    async delete(id: string): Promise<Extrinsic> {
        return this.extrinsicModel.findByIdAndDelete(id);
    }
}