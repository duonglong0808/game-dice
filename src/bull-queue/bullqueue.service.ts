import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { DataJobCalcPointDice, DataJobAddPointToUser } from 'src/constants';

@Injectable()
export class BullQueueService {
  constructor(
    // auto calc points
    @InjectQueue('calc-point-dice') private readonly calcPointDiceQueue: Queue,
    @InjectQueue('add-point-to-user') private readonly addPointToUserQueue: Queue,
  ) {}

  async addToQueueCalcPointDice(data: DataJobCalcPointDice): Promise<any> {
    console.log('🚀 ~ BullQueueService ~ addToQueueCalcPointDice ~ data:', data);
    return this.calcPointDiceQueue.add(data);
  }

  async addToQueueAddPointToUser(data: DataJobAddPointToUser[]): Promise<any> {
    return this.addPointToUserQueue.add(data);
  }
}
