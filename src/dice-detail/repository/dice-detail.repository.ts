import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DiceDetailModel } from 'src/model';
import { BaseRepositoryAbstract } from 'src/repositories/base/base.abstract.repository';
import { DiceDetailRepositoryInterface } from '../interface/dice-detail.interface';

@Injectable()
export class DiceDetailRepository extends BaseRepositoryAbstract<DiceDetailModel> implements DiceDetailRepositoryInterface {
  constructor(@InjectModel(DiceDetailModel) private readonly diceDetailModel: typeof DiceDetailModel) {
    super(diceDetailModel);
  }
}
