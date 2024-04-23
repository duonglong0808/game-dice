import { Inject, Injectable } from '@nestjs/common';
import { CreateHistoryPlayDto } from './dto/create-history-play.dto';
import { UpdateHistoryPlayDto } from './dto/update-history-play.dto';
import { HistoryPlayRepositoryInterface } from './interface/history-play.interface';
import { RedisService } from 'src/cache/redis.service';
import { messageResponse } from 'src/constants';

@Injectable()
export class HistoryPlayService {
  constructor(
    @Inject('HistoryPlayRepositoryInterface')
    private readonly gameDiceRepository: HistoryPlayRepositoryInterface,
    private readonly cacheService: RedisService,
  ) {}

  async create(dto: CreateHistoryPlayDto) {
    if (dto.point <= 0) throw new Error(messageResponse.system.dataInvalid);
    const keyRunning = `dice:${dto.diceDetailId}:${dto.transaction}`;
    const checkTTLKey = await this.cacheService.ttl(keyRunning);
    console.log('🛫🛫🛫 ~ file: history-play.service.ts:19 ~ create ~ checkTTLKey:', checkTTLKey);
    if (checkTTLKey == -2) throw new Error(messageResponse.historyPlay.transactionIsFinished);
    const keyCheckBetPosition = `dice-play:${dto.diceDetailId}:${dto.transaction}:${dto.userId}`;
    const dataPosition = await this.cacheService.hget(keyCheckBetPosition);
    if (dataPosition[dto.answer]) throw new Error(messageResponse.historyPlay.positionHasChoice);
    await this.cacheService.hset(keyCheckBetPosition, String(dto.answer), dto.point);
    return this.gameDiceRepository.create(dto);
  }

  findAll() {
    return `This action returns all historyPlay`;
  }

  remove(id: number) {
    return `This action removes a #${id} historyPlay`;
  }
}
