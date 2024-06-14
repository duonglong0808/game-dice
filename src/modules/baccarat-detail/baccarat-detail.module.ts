import { Module } from '@nestjs/common';
import { BaccaratDetailService } from './baccarat-detail.service';
import { BaccaratDetailController } from './baccarat-detail.controller';

@Module({
  controllers: [BaccaratDetailController],
  providers: [BaccaratDetailService],
})
export class BaccaratDetailModule {}
