import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { HistoryPlayDiceModel } from 'src/model';
import { HistoryPlayRepositoryInterface } from '../interface/history-play.interface';
import { BaseRepositoryAbstract } from 'src/repositories/base';

@Injectable()
export class HistoryPlayRepository extends BaseRepositoryAbstract<HistoryPlayDiceModel> implements HistoryPlayRepositoryInterface {
  constructor(@InjectModel(HistoryPlayDiceModel) private readonly historyPlayDiceModel: typeof HistoryPlayDiceModel) {
    super(historyPlayDiceModel);
  }
}
