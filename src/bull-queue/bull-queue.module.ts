import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { BullQueueConsumerServiceAddPointToUser, BullQueueConsumerServiceCalcPointDice } from './bullqueueConsumer.service';
import { BullQueueService } from './bullqueue.service';
import { HistoryPlayModule } from 'src/history-play/history-play.module';
import { HistoryPlayService } from 'src/history-play/history-play.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { HistoryPlayDiceModel } from 'src/model';
import { UserPointModule } from 'src/user-point/user-point.module';
import { UserPointService } from 'src/user-point/user-point.service';
import { RedisService } from 'src/cache/redis.service';
import { GamePointModule } from 'src/game-point/game-point.module';

@Module({
  imports: [
    // SequelizeModule.forFeature([HistoryPlayDiceModel]),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        prefix: `{${process.env.APP_ID}}`,
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
    ),
    HistoryPlayModule,
    UserPointModule,
    GamePointModule,
  ],
  providers: [
    //
    BullQueueConsumerServiceCalcPointDice,
    BullQueueConsumerServiceAddPointToUser,
    BullQueueService,
    HistoryPlayService,
    UserPointService,
    RedisService,
  ],
  exports: [BullQueueService],
})
export class BullQueueModule {}
