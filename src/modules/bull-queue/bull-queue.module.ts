import { BullModule } from '@nestjs/bull';
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { BullQueueConsumerServiceAddPointToUser, BullQueueConsumerServiceCalcPointDice, BullQueueConsumerServiceUpdateStatusDice } from './bullqueueConsumer.service';
import { BullQueueService } from './bullqueue.service';
import { HistoryPlayModule } from '../history-play/history-play.module';
import { HistoryPlayService } from '../history-play/history-play.service';
import { UserPointModule } from '../user-point/user-point.module';
import { UserPointService } from '../user-point/user-point.service';
import { RedisService } from '../cache/redis.service';
import { GamePointModule } from '../game-point/game-point.module';
import { SendMessageWsService } from '../send-message-ws/send-message-ws.service';
import { HttpModule } from '@nestjs/axios';
import { DiceDetailModule } from '../dice-detail/dice-detail.module';
import { DiceDetailService } from '../dice-detail/dice-detail.service';

@Module({
  imports: [
    // SequelizeModule.forFeature([HistoryPlayDiceModel]),
    HttpModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        prefix: `{bull-queue}:${process.env.APP_ID}:${process.env.APP_NAME}`,
        createClient: (type) => {
          const opts = type !== 'client' ? { enableReadyCheck: false, maxRetriesPerRequest: null } : {};

          return new Redis({
            host: process.env.HOST_REDIS,
            password: process.env.PASSWORD_REDIS,
            port: Number(process.env.PORT_REDIS),
            ...opts,
          });
        },
        defaultJobOptions: {
          attempts: 20,
          removeOnComplete: true,
          removeOnFail: false,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      {
        name: 'calc-point-dice',
      },
      {
        name: 'add-point-to-user',
      },
      {
        name: 'auto-update-status-dice',
      },
    ),
    HistoryPlayModule,
    UserPointModule,
    GamePointModule,
    forwardRef(() => DiceDetailModule),
  ],
  providers: [
    //
    BullQueueConsumerServiceCalcPointDice,
    BullQueueConsumerServiceAddPointToUser,
    BullQueueConsumerServiceUpdateStatusDice,
    BullQueueService,
    HistoryPlayService,
    UserPointService,
    RedisService,
    SendMessageWsService,
    DiceDetailService,
  ],
  exports: [BullQueueService],
})
export class BullQueueModule {}