import { Module } from '@nestjs/common';
import { HistoryPlayService } from './history-play.service';
import { HistoryPlayController } from './history-play.controller';
import { HistoryPlayRepository } from './repository/history-play.repository';
import { SequelizeModule } from '@nestjs/sequelize';
import { HistoryPlayDiceModel } from 'src/model';
import { RedisService } from 'src/cache/redis.service';
import { UserPointModule } from 'src/user-point/user-point.module';
import { UserPointService } from 'src/user-point/user-point.service';
import { GamePointModule } from 'src/game-point/game-point.module';
import { GamePointService } from 'src/game-point/game-point.service';

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
