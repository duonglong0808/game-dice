import { Module } from '@nestjs/common';
import { HistoryPlayService } from './history-play.service';
import { HistoryPlayController } from './history-play.controller';
import { HistoryPlayRepository } from './repository/history-play.repository';
import { SequelizeModule } from '@nestjs/sequelize';
import { RedisService } from '../cache/redis.service';
import { UserPointModule } from '../user-point/user-point.module';
import { UserPointService } from '../user-point/user-point.service';
import { GamePointModule } from '../game-point/game-point.module';
import { GamePointService } from '../game-point/game-point.service';
import { HistoryPlayDiceModel } from 'src/model';

@Module({
  imports: [
    //
    SequelizeModule.forFeature([HistoryPlayDiceModel]),
    UserPointModule,
    GamePointModule,
  ],
  controllers: [HistoryPlayController],
  providers: [
    HistoryPlayService,
    {
      provide: 'HistoryPlayRepositoryInterface',
      useClass: HistoryPlayRepository,
    },
    RedisService,
    UserPointService,
    GamePointService,
  ],
  exports: [
    {
      provide: 'HistoryPlayRepositoryInterface',
      useClass: HistoryPlayRepository,
    },
  ],
})
export class HistoryPlayModule {}