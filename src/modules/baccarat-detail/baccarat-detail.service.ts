import { Inject, Injectable } from '@nestjs/common';
import { CreateBaccaratDetailDto } from './dto/create-baccarat-detail.dto';
import { UpdateBaccaratDetailDto, UpdateStatusBaccaratDetailBotDto, UpdateStatusBaccaratDetailDto } from './dto/update-baccarat-detail.dto';
import { BaccaratDetailRepositoryInterface } from './interface/baccarat-detail.interface';
import { BaccaratService } from '../baccarat/baccarat.service';
import { BullQueueService } from '../bull-queue/bullqueue.service';
import { SendMessageWsService } from '../send-message-ws/send-message-ws.service';
import { StatusBaccarat, messageResponse, pointPoker } from 'src/constants';
import { Pagination } from 'src/middlewares';
import { Op } from 'sequelize';
import { formatDateToId } from 'src/utils';
import { RedisService } from '../cache/redis.service';

@Injectable()
export class BaccaratDetailService {
  constructor(
    @Inject('BaccaratDetailRepositoryInterface')
    private readonly baccaratDetailRepository: BaccaratDetailRepositoryInterface,
    private readonly baccaratService: BaccaratService,
    private readonly bullQueueService: BullQueueService,
    private readonly sendMessageWsService: SendMessageWsService,
    private readonly cacheService: RedisService,
  ) {}

  async create(dto: CreateBaccaratDetailDto) {
    if (!dto.dateId || !dto.gameBaccaratId || !dto.mainTransaction) throw new Error(messageResponse.system.missingData);
    const dice = await this.baccaratService.checkExitByCondition({ id: dto.gameBaccaratId });
    if (dice == 0) throw new Error(messageResponse.system.dataInvalid);
    const totalTransaction = dto.transaction ? dto.transaction : await this.baccaratDetailRepository.count({ gameBaccaratId: dto.gameBaccaratId });
    return this.baccaratDetailRepository.create({ ...dto, status: StatusBaccarat.prepare, transaction: totalTransaction + 1 });
  }

  findAllCMS(gameBaccaratId: number, pagination: Pagination, sort?: string, typeSort?: string) {
    const filter: any = {};
    if (gameBaccaratId) filter.gameBaccaratId = gameBaccaratId;
    return this.baccaratDetailRepository.findAll(filter, { sort, typeSort, ...pagination, projection: ['id', 'transaction', 'mainTransaction', 'pokerPlayer', 'pokerBanker', 'status', 'dateId', 'createdAt', 'totalBet', 'totalReward'] });
  }

  async findHistoryNear() {
    const { data: dataHistory } = await this.baccaratDetailRepository.findAll(
      {
        status: StatusBaccarat.end,
        pokerPlayer: { [Op.ne]: null },
      },
      {
        limit: 240,
        sort: 'id',
        typeSort: 'DESC',
        projection: ['id', 'transaction', 'mainTransaction', 'pokerPlayer', 'pokerBanker', 'status', 'dateId', 'gameBaccaratId', 'id'],
      },
    );
    return {
      dataHistory,
    };
  }

  async getBrief(dateFrom: number, dateTo: number) {
    return this.baccaratDetailRepository.getTotalBetAndReward(dateFrom, dateTo);
  }

  async updateStatusAndAnswersBOT(dto: UpdateStatusBaccaratDetailBotDto) {
    const dateId = +formatDateToId();
    const baccaratDetail = await this.baccaratDetailRepository.findOneByCondition({
      gameBaccaratId: dto.gameBaccaratId,
      mainTransaction: dto.mainTransaction,
      dateId,
    });
    if (baccaratDetail) {
      // console.log('Đã có');
      return this.updateStatus(baccaratDetail.id, { ...dto });
    } else {
      // console.log('tạo mới', dto);
      const totalTransaction = await this.baccaratDetailRepository.count({ gameBaccaratId: dto.gameBaccaratId });
      const createDto = {
        dateId,
        gameBaccaratId: dto.gameBaccaratId,
        mainTransaction: dto.mainTransaction,
        status: StatusBaccarat.prepare,
        transaction: totalTransaction + 1,
      };
      const newDice = await this.baccaratDetailRepository.create(createDto);
      return this.updateStatus(newDice.id);
    }
  }

  async updateStatus(id: number, dto?: UpdateStatusBaccaratDetailDto) {
    const baccaratDetail = await this.baccaratDetailRepository.findOneById(id, ['id', 'transaction', 'mainTransaction', 'gameDiceId', 'totalRed', 'status']);
    if (!baccaratDetail) throw new Error(messageResponse.system.idInvalid);
    const key = `${process.env.APP_NAME}:dice-detail:${baccaratDetail.gameBaccaratId}:${baccaratDetail.id}:${baccaratDetail.transaction}`;
    const date = new Date().getTime();
    const countDown = 14 * 1000;
    switch (baccaratDetail.status) {
      case StatusBaccarat.prepare:
        baccaratDetail.status = StatusBaccarat.bet;
        await this.cacheService.set(key, StatusBaccarat.bet, 10);
        break;

      case StatusBaccarat.bet:
        await this.cacheService.set(key, StatusBaccarat.waitOpen, 60);
        baccaratDetail.status = StatusBaccarat.waitOpen;
        break;
      case StatusBaccarat.waitOpen:
        baccaratDetail.status = StatusBaccarat.showPoker;
        await this.cacheService.set(key, StatusBaccarat.showPoker, 20);

        break;
      case StatusBaccarat.showPoker:
        baccaratDetail.status = StatusBaccarat.showPoker;
        const totalPointPlayer = dto.pokerPlayer.reduce((pre, player) => (pre += pointPoker[player.split('-')[0]]), 0) % 10;
        const totalPointBanker = dto.pokerBanker.reduce((pre, player) => (pre += pointPoker[player.split('-')[0]]), 0) % 10;
        if ((dto.pokerPlayer.length == 3 && dto.pokerBanker.length == 3) || totalPointPlayer >= 9 || totalPointBanker >= 9) {
          baccaratDetail.status = StatusBaccarat.check;
        }

        await this.cacheService.set(key, StatusBaccarat.showPoker, 20);

        break;
      case StatusBaccarat.check:
        await this.cacheService.delete(key);
        baccaratDetail.status = StatusBaccarat.end;
        break;

      default:
        throw new Error(messageResponse.baccaratDetail.transactionIsFinished);
        break;
    }
    // await this.sendMessageWsService.updateStatusDice(baccaratDetail.gameDiceId, baccaratDetail.id, baccaratDetail.transaction, baccaratDetail.mainTransaction, baccaratDetail.status == StatusBaccaratDetail.bet ? `${StatusBaccaratDetail.bet}:${date + countDown}` : baccaratDetail.status, baccaratDetail.status >= StatusBaccaratDetail.check && baccaratDetail.totalRed);
    await baccaratDetail.save();

    // Auto update and create new dice transaction
    // const timeDelay = this.getTimeDelayQueueUpdateStatus(baccaratDetail.status);
    // if (timeDelay) {
    //   if (baccaratDetail.status == StatusBaccaratDetail.end) {
    //     const createDto: CreateGamebaccaratDetailDto = {
    //       dateId: +formatDateToId(),
    //       gameDiceId: baccaratDetail.gameDiceId,
    //       mainTransaction: baccaratDetail.mainTransaction + 1,
    //       transaction: baccaratDetail.transaction,
    //       totalRed: null,
    //     };
    //     const newBaccaratDetail = await this.create(createDto);
    //     // this.bullQueueService.addToQueueAutoUpdateStatusDice({ baccaratDetailId: newbaccaratDetail.id }, 5);
    //   } else {
    //     // this.bullQueueService.addToQueueAutoUpdateStatusDice({ baccaratDetailId: baccaratDetail.id }, timeDelay);
    //   }
    // }

    return baccaratDetail;
  }

  async updateDataBetAndReward(id: number, totalBet: number, totalReward: number) {
    return this.baccaratDetailRepository.findByIdAndUpdate(id, { totalBet, totalReward });
  }

  async remove(id: number) {
    const diceById = await this.baccaratDetailRepository.findOneById(id);
    if (diceById && diceById.status !== StatusBaccarat.prepare) throw Error(messageResponse.baccaratDetail.transactionIsRunning);
    const softDelete = await this.baccaratDetailRepository.softDelete(id);
    if (!softDelete) throw Error(messageResponse.system.badRequest);
    return softDelete;
  }
}
