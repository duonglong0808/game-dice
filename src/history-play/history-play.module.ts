import { Module } from '@nestjs/common';
import { HistoryPlayService } from './history-play.service';
import { HistoryPlayController } from './history-play.controller';
import { HistoryPlayRepository } from './repository/history-play.repository';
import { SequelizeModule } from '@nestjs/sequelize';
import { HistoryPlayDiceModel } from 'src/model';
import { RedisService } from 'src/cache/redis.service';

@Module({
  imports: [SequelizeModule.forFeature([HistoryPlayDiceModel])],
  controllers: [HistoryPlayController],
  providers: [
    HistoryPlayService,
    {
      provide: 'HistoryPlayRepositoryInterface',
      useClass: HistoryPlayRepository,
    },
    RedisService,
  ],
})
export class HistoryPlayModule {}
