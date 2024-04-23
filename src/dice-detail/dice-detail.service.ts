import { Inject, Injectable } from '@nestjs/common';
import { CreateGameDiceDetailDto } from './dto/create-dice-detail.dto';
import { UpdateGameDiceDetailDto } from './dto/update-dice-detail.dto';
import { DiceDetailRepositoryInterface } from './interface/dice-detail.interface';
import { StatusDiceDetail, messageResponse } from 'src/constants';
import { Pagination } from 'src/middlewares';
import { DiceService } from 'src/dice/dice.service';
import { RedisService } from 'src/cache/redis.service';

@Injectable()
export class DiceDetailService {
  constructor(
    @Inject('DiceDetailRepositoryInterface')
    private readonly gameDiceRepository: DiceDetailRepositoryInterface,
    private readonly diceService: DiceService,
    private readonly cacheService: RedisService,
  ) {}

  async create(dto: CreateGameDiceDetailDto) {
    if (dto.totalRed > 4 || dto.totalRed <= 0) throw new Error(messageResponse.system.dataInvalid);
    const [exit, dice] = await Promise.all([this.gameDiceRepository.count({ transaction: dto.transaction }), this.diceService.checkExitByCondition({ id: dto.gameDiceId })]);
    if (exit != 0 || dice == 0) throw new Error(messageResponse.system.dataInvalid);
    return this.gameDiceRepository.create({ ...dto, status: StatusDiceDetail.prepare });
  }

  findAll(gameDiceId: number, pagination: Pagination, sort?: string, typeSort?: string) {
    const filter: any = {};
    if (gameDiceId) filter.gameDiceId = gameDiceId;
    return this.gameDiceRepository.findAll(filter, { sort, typeSort, ...pagination, projection: ['id', 'transaction', 'totalRed', 'status', 'gameDiceId'] });
  }

  findOne(id: number) {
    return this.gameDiceRepository.findOneById(id, ['id', 'transaction', 'totalRed', 'status', 'gameDiceId']);
  }

  async update(id: number, dto: UpdateGameDiceDetailDto) {
    const diceDetail = await this.findOne(id);
    if (diceDetail && diceDetail.status != StatusDiceDetail.prepare) throw Error(messageResponse.diceDetail.transactionIsRunning);
    const update = await this.gameDiceRepository.findByIdAndUpdate(id, dto);
    if (!update) throw Error(messageResponse.system.badRequest);
    return update;
  }

  async updateStatus(id: number) {
    const diceDetail = await this.findOne(id);
    if (!diceDetail) throw new Error(messageResponse.system.idInvalid);
    switch (diceDetail.status) {
      case StatusDiceDetail.prepare:
        diceDetail.status = StatusDiceDetail.shake;
        break;
      case StatusDiceDetail.shake:
        const key = `dice:${diceDetail.id}:${diceDetail.transaction}`;
        await this.cacheService.set(key, 1);
        // await this.cacheService.set(key, 1, 14);
        diceDetail.status = StatusDiceDetail.bet;
        break;
      case StatusDiceDetail.bet:
        const keyPlayer = `dice-play:${diceDetail.id}:${diceDetail.transaction}:`;
        const keys = await this.cacheService.scanKey(keyPlayer);
        await this.cacheService.deleteMany(keys);
        diceDetail.status = StatusDiceDetail.waitOpen;
        break;
      case StatusDiceDetail.waitOpen:
        diceDetail.status = StatusDiceDetail.check;
        break;
      case StatusDiceDetail.check:
        diceDetail.status = StatusDiceDetail.end;
        break;

      default:
        throw new Error(messageResponse.diceDetail.transactionIsFinished);
        break;
    }

    return diceDetail.save();
  }

  async remove(id: number) {
    const diceById = await this.gameDiceRepository.findOneById(id);
    if (diceById && diceById.status !== StatusDiceDetail.prepare) throw Error(messageResponse.diceDetail.transactionIsRunning);
    const softDelete = await this.gameDiceRepository.softDelete(id);
    if (!softDelete) throw Error(messageResponse.system.badRequest);
    return softDelete;
  }
}
