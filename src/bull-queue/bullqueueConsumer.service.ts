import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Sequelize } from 'sequelize';
import { DataJobAddPointToUser, DataJobCalcPointDice, TypeAnswerDice } from 'src/constants';
import { HistoryPlayService } from 'src/history-play/history-play.service';
import { BullQueueService } from './bullqueue.service';
import { UserPointService } from 'src/user-point/user-point.service';

@Processor('calc-point-dice')
export class BullQueueConsumerServiceCalcPointDice {
  constructor(
    private readonly bullQueueService: BullQueueService,
    private readonly historyPlayService: HistoryPlayService,
  ) {}

  @Process()
  async calcPointDice(job: Job<DataJobCalcPointDice>) {
    // console.log('🚀 ~ BullQueueConsumerServiceCalcPointDice ~ calcPointDice ~ job:', job);
    const data = job.data;
    const { diceDetailId, transactionId, totalRed } = data;
    const { data: listUser } = await this.historyPlayService.findAll(transactionId, diceDetailId);
    const dataUserUpPoint: DataJobAddPointToUser[] = [];
    if (totalRed == 0 || totalRed == 4) {
      listUser.forEach((userAnswer) => {
        if (userAnswer.answer == TypeAnswerDice.p1 || userAnswer.answer == TypeAnswerDice.p8) {
          const user = dataUserUpPoint.find((user) => user.userId);
          const points = userAnswer.point * 14 + userAnswer.point * 6.5;
          if (user) user.points += points;
          else
            dataUserUpPoint.push({
              gamePointId: userAnswer.gamePointId,
              userId: userAnswer.userId,
              points,
            });
        } else if (userAnswer.answer == TypeAnswerDice.p10) {
          const user = dataUserUpPoint.find((user) => user.userId);
          const points = userAnswer.point * 6.5;
          if (user) user.points += points;
          else
            dataUserUpPoint.push({
              gamePointId: userAnswer.gamePointId,
              userId: userAnswer.userId,
              points,
            });
        }
      });
      //1:14
    } else if (totalRed == 1 || totalRed == 3) {
      listUser.forEach((userAnswer) => {
        if (userAnswer.answer == TypeAnswerDice.p2 || userAnswer.answer == TypeAnswerDice.p9) {
          const user = dataUserUpPoint.find((user) => user.userId);
          const points = userAnswer.point * 2.8;
          if (user) user.points += points;
          else
            dataUserUpPoint.push({
              gamePointId: userAnswer.gamePointId,
              userId: userAnswer.userId,
              points,
            });
        }
      });
    } else if (totalRed == 2) {
      listUser.forEach((userAnswer) => {
        if (userAnswer.answer == TypeAnswerDice.p3) {
          const user = dataUserUpPoint.find((user) => user.userId);
          const points = userAnswer.point * 1.5;
          if (user) user.points += points;
          else
            dataUserUpPoint.push({
              gamePointId: userAnswer.gamePointId,
              userId: userAnswer.userId,
              points,
            });
        }
      });
    }
    // Chẵn
    if (totalRed == 0) {
      listUser.forEach((userAnswer) => {
        if (userAnswer.answer == TypeAnswerDice.p4) {
          const user = dataUserUpPoint.find((user) => user.userId);
          const points = userAnswer.point * 0.96;
          if (user) user.points += points;
          else
            dataUserUpPoint.push({
              gamePointId: userAnswer.gamePointId,
              userId: userAnswer.userId,
              points,
            });
        }
      });
    } else if (totalRed == 1) {
      // Lẻ Xỉu
      //1:1.5 1đ
      listUser.forEach((userAnswer) => {
        if (userAnswer.answer == TypeAnswerDice.p6 || userAnswer.answer == TypeAnswerDice.p5) {
          const user = dataUserUpPoint.find((user) => user.userId);
          const points = userAnswer.point * 0.96;
          if (user) user.points += points;
          else
            dataUserUpPoint.push({
              gamePointId: userAnswer.gamePointId,
              userId: userAnswer.userId,
              points,
            });
        }
      });
    } else if (totalRed == 2) {
      // Chẵn
      //1:1.5 1đ
      listUser.forEach((userAnswer) => {
        if (userAnswer.answer == TypeAnswerDice.p4) {
          const user = dataUserUpPoint.find((user) => user.userId);
          const points = userAnswer.point * 0.96;
          if (user) user.points += points;
          else
            dataUserUpPoint.push({
              gamePointId: userAnswer.gamePointId,
              userId: userAnswer.userId,
              points,
            });
        }
      });
    } else if (totalRed == 3) {
      // Lẻ Tài
      //1:1.5 1đ
      listUser.forEach((userAnswer) => {
        if (userAnswer.answer == TypeAnswerDice.p6 || userAnswer.answer == TypeAnswerDice.p7) {
          const user = dataUserUpPoint.find((user) => user.userId);
          const points = userAnswer.point * 0.96;
          if (user) user.points += points;
          else
            dataUserUpPoint.push({
              gamePointId: userAnswer.gamePointId,
              userId: userAnswer.userId,
              points,
            });
        }
      });
    } else if (totalRed == 4) {
      // Chẵn tài
      //1:1.5 1đ
      listUser.forEach((userAnswer) => {
        if (userAnswer.answer == TypeAnswerDice.p4 || userAnswer.answer == TypeAnswerDice.p7) {
          const user = dataUserUpPoint.find((user) => user.userId);
          const points = userAnswer.point * 0.96;
          if (user) user.points += points;
          else
            dataUserUpPoint.push({
              gamePointId: userAnswer.gamePointId,
              userId: userAnswer.userId,
              points,
            });
        }
      });
    }

    return this.updatePointUser(dataUserUpPoint);
  }

  async updatePointUser(dataUserUpPoint: DataJobAddPointToUser[]) {
    if (dataUserUpPoint.length) {
      await this.bullQueueService.addToQueueAddPointToUser(dataUserUpPoint);
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
