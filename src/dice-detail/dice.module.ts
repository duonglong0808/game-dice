import { Module } from '@nestjs/common';
import { DiceDetailService } from './dice.service';
import { DiceDetailController } from './dice.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { DiceDetailModel } from 'src/model';
import { DiceDetailRepository } from './repository/dice.repository';

@Module({
  imports: [SequelizeModule.forFeature([DiceDetailModel])],
  controllers: [DiceDetailController],
  providers: [
    DiceDetailService,
    {
      provide: 'DiceDetailRepositoryInterface',
      useClass: DiceDetailRepository,
    },
  ],
})
export class DiceDetailModule {}
