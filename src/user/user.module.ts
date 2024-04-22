import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { FirebaseService } from 'src/utils/firebase-service';
import { UserModel } from 'src/model';
import { Helper } from 'src/utils';
import { SequelizeModule } from '@nestjs/sequelize';
import { SmsTwilioService } from 'src/utils/sendSmsTwilio.service';
import { RedisService } from 'src/cache/redis.service';

@Module({
  imports: [SequelizeModule.forFeature([UserModel])],
  controllers: [UserController],
  providers: [UserService, FirebaseService, Helper, SmsTwilioService, RedisService],
  exports: [UserService],
})
export class UserModule {}
