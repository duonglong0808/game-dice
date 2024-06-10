import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { DataJobAddPointToUser, DataJobAutoUpdateStatusDice, DataJobCalcPointDice } from './dto/interface';

@Injectable()
export class BullQueueService {
  constructor(
    // auto calc points
    @InjectQueue('calc-point-dice') private readonly calcPointDiceQueue: Queue,
    @InjectQueue('add-point-to-user') private readonly addPointToUserQueue: Queue,
    @InjectQueue('auto-update-status-dice') private readonly updateStatusDiceQueue: Queue,
  ) {}

  async addToQueueCalcPointDice(data: DataJobCalcPointDice): Promise<any> {
    // console.log('🚀 ~ BullQueueService ~ addToQueueCalcPointDice ~ data:', data);
    return this.calcPointDiceQueue.add(data);
  }

  async addToQueueAddPointToUser(data: DataJobAddPointToUser[]): Promise<any> {
    return this.addPointToUserQueue.add(data);
  }

  async addToQueueAutoUpdateStatusDice(data: DataJobAutoUpdateStatusDice, delay: number): Promise<any> {
    console.log('THêm addToQueueAutoUpdateStatusDice', new Date().getTime(), delay, new Date().getTime() + delay * 1000);
    return this.updateStatusDiceQueue.add(data, { delay: delay * 1000 });
  }
}
