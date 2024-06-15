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

  getTimeDelayQueueUpdateStatus(status: number) {
    switch (status) {
      case StatusBaccarat.prepare:
        return false;
      case StatusBaccarat.bet:
        return 14;
      case StatusBaccarat.waitOpen:
        return 2;
      case StatusBaccarat.check:
        return 5;
      case StatusBaccarat.end:
        return 1;
      default:
        return false;
    }
  }

  async updateStatus(id: number, dto?: UpdateStatusBaccaratDetailDto) {
    const baccaratDetail = await this.baccaratDetailRepository.findOneById(id, ['id', 'transaction', 'mainTransaction', 'gameBaccaratId', 'status', 'pokerPlayer', 'pokerBanker']);
    if (!baccaratDetail) throw new Error(messageResponse.system.idInvalid);
    const key = `${process.env.APP_NAME}:baccarat-detail:${baccaratDetail.gameBaccaratId}:${baccaratDetail.id}:${baccaratDetail.transaction}`;
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
        const totalPointPlayer = dto.pokerPlayer.reduce((pre, player) => (pre += pointPoker[player.split('_')[1].slice(1)]), 0) % 10;
        const totalPointBanker = dto.pokerBanker.reduce((pre, player) => (pre += pointPoker[player.split('_')[1].slice(1)]), 0) % 10;

        // Kiểm tra điều kiện rút bài của Player
        const playerNeedsCard = dto.pokerPlayer.length == 2 && totalPointPlayer <= 5;

        // Kiểm tra điều kiện rút bài của Banker
        const bankerNeedsCard = dto.pokerBanker.length == 2 && (totalPointBanker <= 2 || (totalPointBanker == 3 && totalPointPlayer !== 8) || (totalPointBanker == 4 && [2, 3, 4, 5, 6, 7].includes(totalPointPlayer)) || (totalPointBanker == 5 && [4, 5, 6, 7].includes(totalPointPlayer)) || (totalPointBanker == 6 && [6, 7].includes(totalPointPlayer)));

        if ((dto.pokerPlayer.length == 3 && dto.pokerBanker.length == 3) || totalPointPlayer >= 9 || totalPointBanker >= 9 || (!playerNeedsCard && !bankerNeedsCard)) {
          baccaratDetail.status = StatusBaccarat.check;
          baccaratDetail.pointBanker = totalPointBanker;
          baccaratDetail.pointPlayer = totalPointPlayer;

          await this.cacheService.set(key, StatusBaccarat.showPoker, 20);
        }
        baccaratDetail.pokerPlayer = JSON.stringify(dto.pokerPlayer);
        baccaratDetail.pokerBanker = JSON.stringify(dto.pokerBanker);
        break;
      case StatusBaccarat.check:
        await this.cacheService.delete(key);
        baccaratDetail.status = StatusBaccarat.end;
        break;

      default:
        throw new Error(messageResponse.baccaratDetail.transactionIsFinished);
        break;
    }
    // await this.sendMessageWsService.updateStatusBaccarat(
    //   //
    //   baccaratDetail.gameBaccaratId,
    //   baccaratDetail.id,
    //   baccaratDetail.transaction,
    //   baccaratDetail.mainTransaction,
    //   baccaratDetail.status == StatusBaccarat.bet ? `${StatusBaccarat.bet}:${date + countDown}` : baccaratDetail.status,
    //   JSON.stringify(dto.pokerPlayer),
    //   JSON.stringify(dto.pokerBanker),
    // );
    await baccaratDetail.save();

    // Auto update and create new dice transaction
    const timeDelay = this.getTimeDelayQueueUpdateStatus(baccaratDetail.status);
    if (timeDelay) {
      if (baccaratDetail.status == StatusBaccarat.end) {
        const createDto: CreateBaccaratDetailDto = {
          dateId: +formatDateToId(),
          gameBaccaratId: baccaratDetail.gameBaccaratId,
          mainTransaction: `${baccaratDetail.mainTransaction.split('-')[0]}-${+baccaratDetail.mainTransaction.split('-')[1] + 1}`,
          transaction: baccaratDetail.transaction,
        };
        const newBaccaratDetail = await this.create(createDto);
      } else {
        this.bullQueueService.addToQueueAutoUpdateStatusBaccarat({ baccaratDetailId: baccaratDetail.id }, timeDelay);
      }
    }

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
