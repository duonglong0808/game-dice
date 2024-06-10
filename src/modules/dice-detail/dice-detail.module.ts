import { Module } from '@nestjs/common';
import { DiceDetailService } from './dice-detail.service';
import { DiceDetailController } from './dice-detail.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { DiceDetailModel } from 'src/model';
import { DiceDetailRepository } from './repository/dice-detail.repository';
import { GameDiceModule } from '../dice/dice.module';
import { DiceService } from '../dice/dice.service';
import { RedisService } from '../cache/redis.service';
import { BullQueueModule } from '../bull-queue/bull-queue.module';
import { HttpModule } from '@nestjs/axios';
import { SendMessageWsService } from '../send-message-ws/send-message-ws.service';

@Module({
  imports: [SequelizeModule.forFeature([DiceDetailModel]), GameDiceModule, BullQueueModule, HttpModule],
  controllers: [DiceDetailController],
  providers: [
    DiceDetailService,
    {
      provide: 'DiceDetailRepositoryInterface',
      useClass: DiceDetailRepository,
    },
    DiceService,
    RedisService,
    SendMessageWsService,
  ],
  exports: [
    {
      provide: 'DiceDetailRepositoryInterface',
      useClass: DiceDetailRepository,
    },
    DiceService,
  ],
})
export class DiceDetailModule {}
