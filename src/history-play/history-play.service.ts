import { Inject, Injectable } from '@nestjs/common';
import { CreateHistoryPlayDto } from './dto/create-history-play.dto';
import { UpdateHistoryPlayDto } from './dto/update-history-play.dto';
import { HistoryPlayRepositoryInterface } from './interface/history-play.interface';
import { RedisService } from 'src/cache/redis.service';
import { StatusDiceDetail, TypeAnswerDice, messageResponse } from 'src/constants';
import { GamePointService } from 'src/game-point/game-point.service';
import { UserPointService } from 'src/user-point/user-point.service';

@Injectable()
export class HistoryPlayService {
  constructor(
    @Inject('HistoryPlayRepositoryInterface')
    private readonly historyPlayRepository: HistoryPlayRepositoryInterface,
    private readonly cacheService: RedisService,
    private readonly gamePointService: GamePointService,
    private readonly userPointService: UserPointService,
  ) {}

  async create(dto: CreateHistoryPlayDto) {
    if (dto.point <= 0) throw new Error(messageResponse.system.dataInvalid);
    const keyRunning = `dice:${dto.diceDetailId}:${dto.transaction}`;
    const checkTTLKey = await this.cacheService.get(keyRunning);
    if (checkTTLKey != StatusDiceDetail.bet) throw new Error(messageResponse.historyPlay.outsideBettingTime);
    // Check các option đã chơi
    const keyCheckBetPosition = `dice-play:${dto.diceDetailId}:${dto.transaction}:${dto.userId}`;
    const dataRedis = await this.cacheService.hget(keyCheckBetPosition);
    const dataAnswerUser = Object.keys(dataRedis);
    if (dataAnswerUser.includes(String(dto.answer))) throw new Error(messageResponse.historyPlay.positionHasChoice);
    // Trường hợp chọn các ô ngoài cl, tx thì chỉ dc chọn 1 ô
    const rateHights = [TypeAnswerDice.p1, TypeAnswerDice.p2, TypeAnswerDice.p3, TypeAnswerDice.p8, TypeAnswerDice.p9, TypeAnswerDice.p10];
    const answerHightRate = rateHights.includes(dto.answer);
    const checkHasHightRate = rateHights.some((r) => dataAnswerUser.includes(String(r)));
    if (answerHightRate && checkHasHightRate) {
      throw new Error(messageResponse.historyPlay.cannotChooseAnswer);
    }
    // trừ tiền
    const gamePointId = await this.checkBalanceAndDeductPoint('ku-casino', dto.userId, dto.point);
    if (!gamePointId) throw new Error(messageResponse.historyPlay.accountNotHaveEnoughPoints);
    // Lưu lại lịch sử vừa chơi
    await this.cacheService.hset(keyCheckBetPosition, String(dto.answer), dto.point);
    return this.historyPlayRepository.create({ ...dto, gamePointId });
  }

  async checkBalanceAndDeductPoint(slug: string, userId: number, points: number): Promise<number> {
    const gamePoint = await this.gamePointService.findOneBySlugAndSaveRedis(slug);
    const deductPoint = await this.userPointService.deductPointByUser(userId, gamePoint.id, points);
    if (deductPoint) return gamePoint.id;
    return null;
  }

  findAll(transaction: number, diceDetailId: number) {
    return this.historyPlayRepository.findAll(
      { transaction, diceDetailId },
      {
        projection: ['id', 'userId', 'gamePointId', 'point', 'answer'],
      },
    );
  }

  remove(id: number) {
    return `This action removes a #${id} historyPlay`;
  }
}
