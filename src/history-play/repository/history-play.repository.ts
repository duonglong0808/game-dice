import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { HistoryPlayDiceModel } from 'src/model';
import { BaseRepositoryAbstract } from 'src/repositories/base/base.abstract.repository';
import { HistoryPlayRepositoryInterface } from '../interface/history-play.interface';

@Injectable()
export class HistoryPlayRepository extends BaseRepositoryAbstract<HistoryPlayDiceModel> implements HistoryPlayRepositoryInterface {
  constructor(@InjectModel(HistoryPlayDiceModel) private readonly historyPlayDiceModel: typeof HistoryPlayDiceModel) {
    super(historyPlayDiceModel);
  }
}
