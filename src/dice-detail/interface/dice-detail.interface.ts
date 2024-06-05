import { DiceDetailModel } from 'src/model';
import { BaseRepositoryInterface } from 'src/repositories/base/base.interface.repository';

export interface DiceDetailRepositoryInterface extends BaseRepositoryInterface<DiceDetailModel> {
  getTotalBetAndReward(dateFrom: number, dateTo: number): Promise<any>;
}
