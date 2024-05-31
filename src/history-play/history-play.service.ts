import { Inject, Injectable } from '@nestjs/common';
import { CreateHistoryPlayDto } from './dto/create-history-play.dto';
import { UpdateHistoryPlayDto } from './dto/update-history-play.dto';
import { HistoryPlayRepositoryInterface } from './interface/history-play.interface';
import { RedisService } from 'src/cache/redis.service';
import { StatusDiceDetail, TypeAnswerDice, messageResponse } from 'src/constants';
import { GamePointService } from 'src/game-point/game-point.service';
import { UserPointService } from 'src/user-point/user-point.service';
import { Pagination } from 'src/middlewares';
import { Op } from 'sequelize';

@Injectable()
export class HistoryPlayService {
  constructor(
    @Inject('HistoryPlayRepositoryInterface')
    private readonly historyPlayRepository: HistoryPlayRepositoryInterface,
    private readonly cacheService: RedisService,
    private readonly gamePointService: GamePointService,
    private readonly userPointService: UserPointService,
  ) {}

  // Check vị trí ddax choiw
  // {
  // const keyCheckBetPosition = `dice-play:${dto.gameDiceId}:${dto.transaction}:${dto.userId}`;
  //   const dataRedis = await this.cacheService.hget(keyCheckBetPosition);
  //   const dataAnswerUser = Object.keys(dataRedis);
  //   if (dataAnswerUser.includes(String(dto.answer))) throw new Error(messageResponse.historyPlay.positionHasChoice);
  //   // Trường hợp chọn các ô ngoài cl, tx thì chỉ dc chọn 1 ô
  //   const rateHights = [TypeAnswerDice.p1, TypeAnswerDice.p2, TypeAnswerDice.p3, TypeAnswerDice.p8, TypeAnswerDice.p9, TypeAnswerDice.p10];
  //   const answerHightRate = rateHights.includes(dto.answer);
  //   const checkHasHightRate = rateHights.some((r) => dataAnswerUser.includes(String(r)));
  //   if (answerHightRate && checkHasHightRate) {
  //     throw new Error(messageResponse.historyPlay.cannotChooseAnswer);
  //   }
  // }

  async create(dto: CreateHistoryPlayDto) {
    if (dto.point <= 0) throw new Error(messageResponse.system.dataInvalid);
    const keyRunning = `${process.env.APP_NAME}:dice-detail:${dto.gameDiceId}:${dto.diceDetailId}:${dto.transaction}`;
    const statusDice: string = await this.cacheService.get(keyRunning);
    if (+statusDice?.split(':')[0] != StatusDiceDetail.bet) throw new Error(messageResponse.historyPlay.outsideBettingTime);
    // Check các option đã chơi
    const keyCheckBetPosition = `dice-play:${dto.gameDiceId}:${dto.transaction}`;

    // trừ tiền
    const gamePointId = await this.checkBalanceAndDeductPoint('ku-casino', dto.userId, dto.point);
    if (!gamePointId) throw new Error(messageResponse.historyPlay.accountNotHaveEnoughPoints);
    // Lưu lại lịch sử vừa chơi
    await Promise.all([
      //
      this.cacheService.hset(keyCheckBetPosition, String(dto.answer), dto.point),
      // this.cacheService.sadd(`user-play-dice:${dto.transaction}`, keyCheckBetPosition),
    ]);
    return this.historyPlayRepository.create({ ...dto, gamePointId, createdAt: new Date() });
  }

  async checkBalanceAndDeductPoint(slug: string, userId: number, points: number): Promise<number> {
    const gamePoint = await this.gamePointService.findOneBySlugAndSaveRedis(slug);
    const deductPoint = await this.userPointService.deductPointByUser(userId, gamePoint.id, points);
    if (deductPoint) return gamePoint.id;
    return null;
  }

  findAllByDiceDetailId(diceDetailId: number) {
    return this.historyPlayRepository.findAll(
      { diceDetailId },
      {
        projection: ['id', 'userId', 'gamePointId', 'point', 'answer'],
      },
    );
  }

  findAllCms(pagination: Pagination, diceDetailId: number, gameDiceId: number, userId: number, dateFrom: Date, dateTo: Date, sort?: string, typeSort?: string) {
    const filter: any = {};
    if (diceDetailId) filter.diceDetailId = diceDetailId;
    if (gameDiceId) filter.gameDiceId = gameDiceId;
    if (userId) filter.userId = userId;
    if (dateFrom && dateTo)
      filter.dateId = {
        [Op.gte]: dateFrom,
        [Op.lte]: dateTo,
      };

    return this.historyPlayRepository.findAll(filter, {
      //
      sort,
      typeSort,
      ...pagination,
      projection: ['id', 'answer', 'point', 'status', 'gameDiceId', 'diceDetailId', 'userId', 'createdAt'],
    });
  }

  updateStatusByDiceDetailId(diceDetailId: number, status: number) {
    return this.historyPlayRepository.updateMany({ diceDetailId }, { status: status });
  }

  update(id: number, dto: any) {
    return this.historyPlayRepository.findByIdAndUpdate(id, dto);
  }

  remove(id: number) {
    return `This action removes a #${id} historyPlay`;
  }
}
