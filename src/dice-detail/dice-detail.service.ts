import { Inject, Injectable } from '@nestjs/common';
import { CreateGameDiceDetailDto } from './dto/create-dice-detail.dto';
import { UpdateGameDiceDetailDto } from './dto/update-dice-detail.dto';
import { DiceDetailRepositoryInterface } from './interface/dice-detail.interface';
import { StatusDiceDetail, messageResponse } from 'src/constants';
import { Pagination } from 'src/middlewares';
import { DiceService } from 'src/dice/dice.service';
import { RedisService } from 'src/cache/redis.service';
import { BullQueueService } from 'src/bull-queue/bullqueue.service';
import { SendMessageWsService } from 'src/send-message-ws/send-message-ws.service';

@Injectable()
export class DiceDetailService {
  constructor(
    @Inject('DiceDetailRepositoryInterface')
    private readonly gameDiceRepository: DiceDetailRepositoryInterface,
    private readonly diceService: DiceService,
    private readonly cacheService: RedisService,
    private readonly bullQueueService: BullQueueService,
    private readonly sendMessageWsService: SendMessageWsService,
  ) {}

  async create(dto: CreateGameDiceDetailDto) {
    if (!dto.dateId || !dto.gameDiceId || !dto.mainTransaction) throw new Error(messageResponse.system.missingData);
    const checkExit = await this.gameDiceRepository.findOneByCondition({ dateId: dto.dateId, mainTransaction: dto.mainTransaction, gameDiceId: dto.gameDiceId });
    if (checkExit) {
      return this.update(checkExit.id, dto);
    } else {
      if (dto.totalRed) {
        if (dto.totalRed > 4 || dto.totalRed <= 0) throw new Error(messageResponse.system.dataInvalid);
      }
      const dice = await this.diceService.checkExitByCondition({ id: dto.gameDiceId });
      if (dice == 0) throw new Error(messageResponse.system.dataInvalid);
      const totalTransaction = await this.gameDiceRepository.count({ gameDiceId: dto.gameDiceId });
      return this.gameDiceRepository.create({ ...dto, status: StatusDiceDetail.prepare, transaction: totalTransaction + 1 });
    }
  }

  findAllCMS(gameDiceId: number, pagination: Pagination, sort?: string, typeSort?: string) {
    const filter: any = {};
    if (gameDiceId) filter.gameDiceId = gameDiceId;
    return this.gameDiceRepository.findAll(filter, { sort, typeSort, ...pagination, projection: ['id', 'transaction', 'mainTransaction', 'totalRed', 'status', 'dateId', 'createdAt'] });
  }

  async findHistoryNear(gameDiceId: number) {
    const { data: dataHistory } = await this.gameDiceRepository.findAll(
      {
        gameDiceId,
        status: StatusDiceDetail.end,
      },
      {
        limit: 10,
        sort: 'transaction',
        typeSort: 'ASC',
      },
    );
    const { data: transactionNow } = await this.gameDiceRepository.findAll({ gameDiceId }, { limit: 1, sort: 'transaction', typeSort: 'DESC' });
    return {
      dataHistory,
      transactionNow,
    };
  }

  findOne(id: number) {
    return this.gameDiceRepository.findOneById(id, ['id', 'transaction', 'mainTransaction', 'totalRed', 'status', 'dateId', 'createdAt']);
  }

  async update(id: number, dto: UpdateGameDiceDetailDto, checkDto?: boolean) {
    const diceDetail = await this.findOne(id);
    if (checkDto) {
      if (!diceDetail) throw Error(messageResponse.system.idInvalid);
      if (diceDetail.status >= StatusDiceDetail.check) throw Error(messageResponse.diceDetail.transactionIsRunning);
    }
    const update = await this.gameDiceRepository.findByIdAndUpdate(id, dto);
    if (!update) throw Error(messageResponse.system.badRequest);
    return update;
  }

  async updateStatus(id: number) {
    const diceDetail = await this.gameDiceRepository.findOneById(id, ['id', 'transaction', 'gameDiceId', 'totalRed', 'status']);
    if (!diceDetail) throw new Error(messageResponse.system.idInvalid);
    const key = `dice-detail:${diceDetail.gameDiceId}:${diceDetail.id}:${diceDetail.transaction}`;
    const date = new Date().getTime();
    const countDown = 14 * 1000;
    switch (diceDetail.status) {
      case StatusDiceDetail.prepare:
        diceDetail.status = StatusDiceDetail.shake;
        await this.cacheService.set(key, StatusDiceDetail.shake);
        break;
      case StatusDiceDetail.shake:
        await this.cacheService.set(key, `${StatusDiceDetail.bet}:${date + countDown}`);
        // await this.cacheService.set(key, 1, 14);
        diceDetail.status = StatusDiceDetail.bet;
        break;
      case StatusDiceDetail.bet:
        await this.cacheService.set(key, StatusDiceDetail.waitOpen);
        diceDetail.status = StatusDiceDetail.waitOpen;
        // Delete keys
        const keyPlayer = `dice-play:${diceDetail.gameDiceId}:${diceDetail.transaction}:`;
        const keys = await this.cacheService.scanKey(keyPlayer);
        console.log('🚀 ~ DiceDetailService ~ updateStatus ~ keyPlayer:', keyPlayer, keys);
        this.cacheService.deleteMany(keys);
        break;
      case StatusDiceDetail.waitOpen:
        await this.cacheService.set(key, StatusDiceDetail.check);
        diceDetail.status = StatusDiceDetail.check;
        break;
      case StatusDiceDetail.check:
        await this.cacheService.delete(key);
        this.bullQueueService.addToQueueCalcPointDice({ diceDetailId: diceDetail.id, totalRed: diceDetail.totalRed, transactionId: diceDetail.transaction });
        diceDetail.status = StatusDiceDetail.end;
        break;

      default:
        throw new Error(messageResponse.diceDetail.transactionIsFinished);
        break;
    }
    await this.sendMessageWsService.updateStatusDice(diceDetail.gameDiceId, diceDetail.id, diceDetail.transaction, diceDetail.status == StatusDiceDetail.bet ? `${StatusDiceDetail.bet}:${date + countDown}` : diceDetail.status, diceDetail.status == StatusDiceDetail.check && diceDetail.totalRed);
    await diceDetail.save();

    // if (diceDetail.status == StatusDiceDetail.check) {
    //   const createDto: CreateGameDiceDetailDto = {
    //     dateId: diceDetail.dateId,
    //     gameDiceId: diceDetail.gameDiceId,
    //     mainTransaction: diceDetail.mainTransaction + 1,
    //     totalRed: null,
    //   };
    //   await this.create(createDto);
    // }

    return diceDetail;
  }

  async remove(id: number) {
    const diceById = await this.gameDiceRepository.findOneById(id);
    if (diceById && diceById.status !== StatusDiceDetail.prepare) throw Error(messageResponse.diceDetail.transactionIsRunning);
    const softDelete = await this.gameDiceRepository.softDelete(id);
    if (!softDelete) throw Error(messageResponse.system.badRequest);
    return softDelete;
  }
}
