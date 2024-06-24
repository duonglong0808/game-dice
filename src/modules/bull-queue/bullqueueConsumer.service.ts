import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { TypeAnswerBaccarat, TypeAnswerDice, TypePlayGameBaccarat, TypeUpdatePointUser, pointPoker } from 'src/constants';
import { HistoryPlayService } from '../history-play/history-play.service';
import { BullQueueService } from './bullqueue.service';
import { UserPointService } from '../user-point/user-point.service';
import { SendMessageWsService } from '../send-message-ws/send-message-ws.service';
import { DataJobAddPointToUser, DataJobCalcPointDice, DataJobAutoUpdateStatusDice, DataJobAutoUpdateStatusBaccarat, DataJobCalcPointBaccarat } from './dto/interface';
import { DiceDetailService } from '../dice-detail/dice-detail.service';
import { BaccaratDetailService } from '../baccarat-detail/baccarat-detail.service';

@Processor('calc-point-dice')
export class BullQueueConsumerServiceCalcPointDice {
  constructor(
    private readonly bullQueueService: BullQueueService,
    private readonly historyPlayService: HistoryPlayService,
    private readonly sendMessageWsService: SendMessageWsService,
    private readonly diceDetailService: DiceDetailService,
  ) {}

  @Process()
  async calcPointDice(job: Job<DataJobCalcPointDice>) {
    // console.log('🚀 ~ BullQueueConsumerServiceCalcPointDice ~ calcPointDice ~ job:', job);
    const data = job.data;
    const { diceDetailId, totalRed } = data;
    const { data: listUser } = await this.historyPlayService.findAllByDiceDetailId(diceDetailId);
    const dataUserUpPoint: DataJobAddPointToUser[] = [];
    if (totalRed == 0 || totalRed == 4) {
      listUser.forEach((userAnswer) => {
        if (userAnswer.answer == TypeAnswerDice.p1 && totalRed == 0) {
          const user = dataUserUpPoint.find((user) => user.userId);
          const points = userAnswer.point + userAnswer.point * 14;
          if (user) user.points += points;
          else
            dataUserUpPoint.push({
              gamePointId: userAnswer.gamePointId,
              userId: userAnswer.userId,
              points,
              type: TypeUpdatePointUser.up,
            });
        } else if (userAnswer.answer == TypeAnswerDice.p8 && totalRed == 4) {
          const user = dataUserUpPoint.find((user) => user.userId);
          const points = userAnswer.point + userAnswer.point * 14;
          if (user) user.points += points;
          else
            dataUserUpPoint.push({
              gamePointId: userAnswer.gamePointId,
              userId: userAnswer.userId,
              points,
              type: TypeUpdatePointUser.up,
            });
        } else if (userAnswer.answer == TypeAnswerDice.p10) {
          const user = dataUserUpPoint.find((user) => user.userId);
          const points = userAnswer.point + userAnswer.point * 6.5;
          if (user) user.points += points;
          else
            dataUserUpPoint.push({
              gamePointId: userAnswer.gamePointId,
              userId: userAnswer.userId,
              points,
              type: TypeUpdatePointUser.up,
            });
        }
      });
      //1:14
    } else if (totalRed == 1 || totalRed == 3) {
      listUser.forEach((userAnswer) => {
        if (userAnswer.answer == TypeAnswerDice.p2 && totalRed == 1) {
          const user = dataUserUpPoint.find((user) => user.userId);
          const points = userAnswer.point + userAnswer.point * 2.8;
          if (user) user.points += points;
          else
            dataUserUpPoint.push({
              gamePointId: userAnswer.gamePointId,
              userId: userAnswer.userId,
              points,
              type: TypeUpdatePointUser.up,
            });
        } else if (userAnswer.answer == TypeAnswerDice.p9 && totalRed == 3) {
          const user = dataUserUpPoint.find((user) => user.userId);
          const points = userAnswer.point + userAnswer.point * 2.8;
          if (user) user.points += points;
          else
            dataUserUpPoint.push({
              gamePointId: userAnswer.gamePointId,
              userId: userAnswer.userId,
              points,
              type: TypeUpdatePointUser.up,
            });
        }
      });
    } else if (totalRed == 2) {
      listUser.forEach((userAnswer) => {
        if (userAnswer.answer == TypeAnswerDice.p3) {
          const user = dataUserUpPoint.find((user) => user.userId);
          const points = userAnswer.point + userAnswer.point * 1.5;
          if (user) user.points += points;
          else
            dataUserUpPoint.push({
              gamePointId: userAnswer.gamePointId,
              userId: userAnswer.userId,
              points,
              type: TypeUpdatePointUser.up,
            });
        }
      });
    }
    // Chẵn
    if (totalRed == 0) {
      listUser.forEach((userAnswer) => {
        if (userAnswer.answer == TypeAnswerDice.p4) {
          const user = dataUserUpPoint.find((user) => user.userId);
          const points = userAnswer.point + userAnswer.point * 0.96;
          if (user) user.points += points;
          else
            dataUserUpPoint.push({
              gamePointId: userAnswer.gamePointId,
              userId: userAnswer.userId,
              points,
              type: TypeUpdatePointUser.up,
            });
        }
      });
    } else if (totalRed == 1) {
      // Lẻ Xỉu
      //1:1.5 1đ
      listUser.forEach((userAnswer) => {
        if (userAnswer.answer == TypeAnswerDice.p6 || userAnswer.answer == TypeAnswerDice.p5) {
          const user = dataUserUpPoint.find((user) => user.userId);
          const points = userAnswer.point + userAnswer.point * 0.96;
          if (user) user.points += points;
          else
            dataUserUpPoint.push({
              gamePointId: userAnswer.gamePointId,
              userId: userAnswer.userId,
              points,
              type: TypeUpdatePointUser.up,
            });
        }
      });
    } else if (totalRed == 2) {
      // Chẵn
      //1:1.5 1đ
      listUser.forEach((userAnswer) => {
        if (userAnswer.answer == TypeAnswerDice.p4) {
          const user = dataUserUpPoint.find((user) => user.userId);
          const points = userAnswer.point + userAnswer.point * 0.96;
          if (user) user.points += points;
          else
            dataUserUpPoint.push({
              gamePointId: userAnswer.gamePointId,
              userId: userAnswer.userId,
              points,
              type: TypeUpdatePointUser.up,
            });
        }
      });
    } else if (totalRed == 3) {
      // Lẻ Tài
      //1:1.5 1đ
      listUser.forEach((userAnswer) => {
        if (userAnswer.answer == TypeAnswerDice.p6 || userAnswer.answer == TypeAnswerDice.p7) {
          const user = dataUserUpPoint.find((user) => user.userId);
          const points = userAnswer.point + userAnswer.point * 0.96;
          if (user) user.points += points;
          else
            dataUserUpPoint.push({
              gamePointId: userAnswer.gamePointId,
              userId: userAnswer.userId,
              points,
              type: TypeUpdatePointUser.up,
            });
        }
      });
    } else if (totalRed == 4) {
      // Chẵn tài
      //1:1.5 1đ
      listUser.forEach((userAnswer) => {
        if (userAnswer.answer == TypeAnswerDice.p4 || userAnswer.answer == TypeAnswerDice.p7) {
          const user = dataUserUpPoint.find((user) => user.userId);
          const points = userAnswer.point + userAnswer.point * 0.96;
          if (user) user.points += points;
          else
            dataUserUpPoint.push({
              gamePointId: userAnswer.gamePointId,
              userId: userAnswer.userId,
              points,
              type: TypeUpdatePointUser.up,
            });
        }
      });
    }

    // calc total bet
    dataUserUpPoint.forEach((userPoint) => (userPoint.points = Math.ceil(userPoint.points)));
    if (listUser.length) {
      const totalBet = listUser.reduce((pre, item) => pre + item.point, 0);
      console.log('🚀 ~ BullQueueConsumerServiceCalcPointDice ~ calcPointDice ~ totalBet:', totalBet);
      const totalReward = dataUserUpPoint.reduce((pre, item) => pre + item.points, 0) || 0;
      console.log('🚀 ~ BullQueueConsumerServiceCalcPointDice ~ calcPointDice ~ totalReward:', totalReward);
      this.diceDetailService.updateDataBetAndReward(data.diceDetailId, totalBet, totalReward);
    }
    this.historyPlayService.updateStatusByDiceDetailId(data.diceDetailId, 1);
    return this.updatePointUserAndSendWs(dataUserUpPoint);
  }

  async updatePointUserAndSendWs(dataUserUpPoint: DataJobAddPointToUser[]) {
    // console.log('🚀 ~ BullQueueConsumerServiceCalcPointDice ~ updatePointUserAndSendWs ~ dataUserUpPoint:', dataUserUpPoint);
    if (dataUserUpPoint.length) {
      await this.sendMessageWsService.upPointByUser(dataUserUpPoint);
      this.bullQueueService.addToQueueAddPointToUser(dataUserUpPoint);
    }
  }
}

@Processor('calc-point-baccarat')
export class BullQueueConsumerServiceCalcPointBaccarat {
  constructor(
    private readonly bullQueueService: BullQueueService,
    private readonly historyPlayService: HistoryPlayService,
    private readonly sendMessageWsService: SendMessageWsService,
    private readonly baccaratDetailService: BaccaratDetailService,
  ) {}

  @Process()
  async calcPointDice(job: Job<DataJobCalcPointBaccarat>) {
    const data = job.data;
    console.log('🚀 ~ BullQueueConsumerServiceCalcPointBaccarat ~ calcPointDice ~ data:', data);
    const { baccaratDetailId, pokerPlayer, pokerBanker, pointBanker, pointPlayer } = data;
    const { data: listUser } = await this.historyPlayService.findAllByBaccaratDetailId(baccaratDetailId);
    const dataUserUpPoint: DataJobAddPointToUser[] = [];
    const valuePokerPlayer: number[] = pokerPlayer.map((pk) => pointPoker[pk.split('_')[1].slice(1)]);
    const valuePokerBanker: number[] = pokerBanker.map((pk) => pointPoker[pk.split('_')[1].slice(1)]);
    listUser.forEach((userAnswer) => {
      // Con đôi hoặc cái đôi
      if (valuePokerPlayer[0] == valuePokerPlayer[1] || valuePokerBanker[0] == valuePokerBanker[1]) {
        if ((userAnswer.answer == TypeAnswerBaccarat.p1 && valuePokerPlayer[0] == valuePokerPlayer[1]) || (userAnswer.answer == TypeAnswerBaccarat.p7 && valuePokerBanker[0] == valuePokerBanker[1])) {
          const user = dataUserUpPoint.find((user) => user.userId);
          const points = userAnswer.point + userAnswer.point * 14;
          if (user) user.points += points;
          else
            dataUserUpPoint.push({
              gamePointId: userAnswer.gamePointId,
              userId: userAnswer.userId,
              points,
              type: TypeUpdatePointUser.up,
            });
        }
      }

      // Con long bảo , Con thắng (trừ trường hợp chuẩn hòa)
      if (pointPlayer > pointBanker) {
        const user = dataUserUpPoint.find((user) => user.userId);
        let points = 0;
        // Con thắng
        if (userAnswer.answer == TypeAnswerBaccarat.p5) {
          points += userAnswer.point + userAnswer.point;
        }

        // Con long bảo
        if (pointPlayer - pointBanker >= 4 && userAnswer.answer == TypeAnswerBaccarat.p2) {
          let rate: boolean | number = false;
          if (valuePokerPlayer[0] + valuePokerPlayer[1] >= 8) {
            rate = 1;
          } else {
            switch (pointPlayer - pointBanker) {
              case 4:
                rate = 1;
                break;
              case 5:
                rate = 2;
                break;
              case 6:
                rate = 3;
                break;
              case 7:
                rate = 5;
                break;
              case 8:
                rate = 10;
                break;
              case 9:
                rate = 30;
                break;
              default:
                break;
            }
          }
          if (rate != false) {
            points += userAnswer.point + userAnswer.point * rate;
          }
        }

        if (user) user.points += points;
        else {
          dataUserUpPoint.push({
            gamePointId: userAnswer.gamePointId,
            userId: userAnswer.userId,
            points,
            type: TypeUpdatePointUser.up,
          });
        }
      }

      // Cái long bảo , Cái thắng (trừ trường hợp chuẩn hòa), super 6
      if (pointBanker > pointPlayer) {
        const user = dataUserUpPoint.find((user) => user.userId);
        let points = 0;
        // Cái thắng
        if (userAnswer.answer == TypeAnswerBaccarat.p4) {
          points += userAnswer.type == TypePlayGameBaccarat.old ? userAnswer.point + userAnswer.point * 0.95 : userAnswer.point + userAnswer.point;
        }

        // Cái long bảo
        if (pointBanker - pointPlayer > 4 && userAnswer.answer == TypeAnswerBaccarat.p2) {
          let rate: boolean | number = false;
          if (valuePokerBanker[0] + valuePokerBanker[1] >= 8) {
            rate = 1;
          } else {
            switch (pointBanker - pointPlayer) {
              case 4:
                rate = 1;
                break;
              case 5:
                rate = 2;
                break;
              case 6:
                rate = 3;
                break;
              case 7:
                rate = 5;
                break;
              case 8:
                rate = 10;
                break;
              case 9:
                rate = 30;
                break;
              default:
                break;
            }
          }

          if (rate != false) {
            points += userAnswer.point + userAnswer.point * rate;
          }
        }

        // Super 6
        if (pointBanker == 6 && userAnswer.answer == TypeAnswerBaccarat.p6) {
          const rate = valuePokerBanker.length == 2 ? 12 : 20;
          points += userAnswer.point + userAnswer.point * rate;
        }

        if (user) user.points += points;
        else {
          dataUserUpPoint.push({
            gamePointId: userAnswer.gamePointId,
            userId: userAnswer.userId,
            points,
            type: TypeUpdatePointUser.up,
          });
        }
      }

      // Hòa or con, cái (long bảo chuẩn hòa)
      if (pointBanker == pointPlayer) {
        let points = 0;
        // Hòa
        if (userAnswer.answer == TypeAnswerBaccarat.p3) {
          points += userAnswer.point + userAnswer.point * 8;
        }
        // Hồi tiền cược con or cái(long bảo)
        if (valuePokerPlayer[0] + valuePokerPlayer[1] >= 8 && valuePokerBanker[0] + valuePokerBanker[1] >= 8 && (userAnswer.answer == TypeAnswerBaccarat.p2 || userAnswer.answer == TypeAnswerBaccarat.p8)) {
          points += userAnswer.point;
        }
        const user = dataUserUpPoint.find((user) => user.userId);
        if (user) user.points += points;
        else {
          dataUserUpPoint.push({
            gamePointId: userAnswer.gamePointId,
            userId: userAnswer.userId,
            points,
            type: TypeUpdatePointUser.up,
          });
        }
      }
    });

    // calc total bet
    dataUserUpPoint.forEach((userPoint) => (userPoint.points = Math.ceil(userPoint.points)));
    if (listUser.length) {
      const totalBet = listUser.reduce((pre, item) => pre + item.point, 0);
      console.log('🚀 ~ BullQueueConsumerServiceCalcPointDice ~ calcPointDice ~ totalBet:', totalBet);
      const totalReward = dataUserUpPoint.reduce((pre, item) => pre + item.points, 0) || 0;
      console.log('🚀 ~ BullQueueConsumerServiceCalcPointDice ~ calcPointDice ~ totalReward:', totalReward);
      this.baccaratDetailService.updateDataBetAndReward(baccaratDetailId, totalBet, totalReward);
    }
    console.log('🚀 ~ BullQueueConsumerServiceCalcPointBaccarat ~ calcPointDice ~ dataUserUpPoint:', dataUserUpPoint);
    this.historyPlayService.updateStatusByBaccaratDetailId(baccaratDetailId, 1);
    return this.updatePointUserAndSendWs(dataUserUpPoint);
  }

  async updatePointUserAndSendWs(dataUserUpPoint: DataJobAddPointToUser[]) {
    // console.log('🚀 ~ BullQueueConsumerServiceCalcPointDice ~ updatePointUserAndSendWs ~ dataUserUpPoint:', dataUserUpPoint);
    if (dataUserUpPoint.length) {
      await this.sendMessageWsService.upPointByUser(dataUserUpPoint);
      this.bullQueueService.addToQueueAddPointToUser(dataUserUpPoint);
    }
  }
}

@Processor('add-point-to-user')
export class BullQueueConsumerServiceAddPointToUser {
  constructor(
    private userPointService: UserPointService,
    private readonly bullQueueService: BullQueueService,
  ) {}

  @Process()
  async addPointToMultiUser(job: Job<DataJobAddPointToUser[]>) {
    const { data } = job;
    const dataFailed: DataJobAddPointToUser[] = [];
    const dataAddPoint = await Promise.all(data.map((item) => this.userPointService.addPointToUser(item)));
    dataAddPoint.forEach((status, index) => {
      if (!status) dataFailed.push(data[index]);
    });
    if (dataFailed.length) {
      await this.bullQueueService.addToQueueAddPointToUser(dataFailed);
    }
  }
}

@Processor('auto-update-status-dice')
export class BullQueueConsumerServiceUpdateStatusDice {
  constructor(private readonly diceDetailService: DiceDetailService) {}

  @Process()
  async updateStatusDice(job: Job<DataJobAutoUpdateStatusDice>) {
    const { data } = job;
    console.log('🛫🛫🛫 ~ file: bullqueueConsumer.service.ts:211 ~ updateStatusDice ~ data:', data, new Date().getTime());
    return this.diceDetailService.updateStatus(data.diceDetailId);
  }
}

@Processor('auto-update-status-baccarat')
export class BullQueueConsumerServiceUpdateStatusBaccarat {
  constructor(private readonly baccaratDetailService: BaccaratDetailService) {}

  @Process()
  async updateStatusDice(job: Job<DataJobAutoUpdateStatusBaccarat>) {
    const { data } = job;
    console.log('🛫🛫🛫 ~ file: bullqueueConsumer.service.ts:211 ~ updateStatusDice ~ data:', data, new Date().getTime());
    return this.baccaratDetailService.updateStatus(data.baccaratDetailId);
  }
}
