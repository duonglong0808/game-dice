import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GamePointModel } from 'src/model';
import { BaseRepositoryAbstract } from 'src/repositories/base/base.abstract.repository';
import { BaseRepositoryInterface } from 'src/repositories/base/base.interface.repository';

@Injectable()
export class GamePointRepository extends BaseRepositoryAbstract<GamePointModel> implements BaseRepositoryInterface<GamePointModel> {
  constructor(@InjectModel(GamePointModel) private readonly gamePointModel: typeof GamePointModel) {
    super(GamePointModel);
  }
}
