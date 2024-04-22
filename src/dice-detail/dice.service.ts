import { Inject, Injectable } from '@nestjs/common';
import { CreateGameDiceDetailDto } from './dto/create-dice-detail.dto';
import { UpdateGameDiceDetailDto } from './dto/update-dice-detail.dto';
import { DiceDetailRepositoryInterface } from './interface/dice.interface';
import { messageResponse } from 'src/constants';
import { Pagination } from 'src/middlewares';

@Injectable()
export class DiceDetailService {
  constructor(
    @Inject('DiceDetailRepositoryInterface')
    private readonly gameDiceRepository: DiceDetailRepositoryInterface,
  ) {}

  create(dto: CreateGameDiceDetailDto) {
    return this.gameDiceRepository.create(dto);
  }

  findAll(pagination: Pagination, sort?: string, typeSort?: string) {
    return this.gameDiceRepository.findAll({}, { sort, typeSort, ...pagination, projection: ['id', 'name', 'type', 'nameAuthor', 'avtAuthor', 'nationalAuthor', 'idLive'] });
  }

  findOne(id: number) {
    return this.gameDiceRepository.findOneById(id, ['id', 'name', 'type', 'nameAuthor', 'avtAuthor', 'nationalAuthor', 'idLive']);
  }

  async update(id: number, dto: UpdateGameDiceDetailDto) {
    const update = await this.gameDiceRepository.findByIdAndUpdate(id, dto);
    if (!update) throw Error(messageResponse.system.badRequest);
    return update;
  }

  async remove(id: number) {
    const softDelete = await this.gameDiceRepository.softDelete(id);
    if (!softDelete) throw Error(messageResponse.system.badRequest);
    return softDelete;
  }
}
