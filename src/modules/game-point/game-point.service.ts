import { Inject, Injectable } from '@nestjs/common';
import { GamePointRepositoryInterface } from './interface/game-point.interface';
import { GamePointModel } from 'src/model';
import { RedisService } from '../cache/redis.service';

@Injectable()
export class GamePointService {
  constructor(
    @Inject('GamePointRepositoryInterface')
    private readonly gamePointRepository: GamePointRepositoryInterface,
    private readonly cacheService: RedisService,
  ) {}

  async findOneBySlugAndSaveRedis(slug: string): Promise<GamePointModel> {
    const key = `game-point:${slug}`;
    const dataRedis = await this.cacheService.get(key);
    if (!dataRedis) {
      const res = await this.gamePointRepository.findOneByCondition({ slug });
      await this.cacheService.set(key, JSON.stringify(res));
      // await this.cacheService.set(key, res.toJSON());
      return res;
    }
    return JSON.parse(dataRedis);
  }
}
