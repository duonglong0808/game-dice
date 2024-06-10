import { Module } from '@nestjs/common';
import { UserPointService } from './user-point.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserPointModel } from 'src/model';
import { UserPointRepository } from './repository/user-point.repository';

@Module({
  imports: [SequelizeModule.forFeature([UserPointModel])],
  providers: [
    UserPointService,
    {
      provide: 'UserPointRepositoryInterface',
      useClass: UserPointRepository,
    },
  ],
  exports: [
    {
      provide: 'UserPointRepositoryInterface',
      useClass: UserPointRepository,
    },
  ],
})
export class UserPointModule {}
