import { Module } from '@nestjs/common';
import { DiceDetailService } from './dice-detail.service';
import { DiceDetailController } from './dice-detail.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { DiceDetailModel } from 'src/model';
import { DiceDetailRepository } from './repository/dice-detail.repository';
import { GameDiceModule } from 'src/dice/dice.module';
import { DiceService } from 'src/dice/dice.service';
import { RedisService } from 'src/cache/redis.service';
import { BullQueueModule } from 'src/bull-queue/bull-queue.module';

@Module({
  imports: [SequelizeModule.forFeature([DiceDetailModel]), GameDiceModule, BullQueueModule],
  controllers: [DiceDetailController],
  providers: [
    DiceDetailService,
    {
      provide: 'DiceDetailRepositoryInterface',
      useClass: DiceDetailRepository,
    },
    DiceService,
    RedisService,
  ],
  exports: [
    {
      provide: 'DiceDetailRepositoryInterface',
      useClass: DiceDetailRepository,
    },
  ],
})
export class DiceDetailModule {}
