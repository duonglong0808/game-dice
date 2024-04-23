import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { DataJobAddPointToUser } from 'src/constants';

@Injectable()
export class UserPointService {
  constructor(private sequelize: Sequelize) {}

  async deductPointByUser(userId: number, gamePointId: number, pointsToDeduct: number): Promise<boolean> {
    try {
      const [result, tag]: any = await this.sequelize.query(`CALL deduct_money_by_user_game(:userIdDeduct, :gamePointIdDeduct, :pointsToDeduct);`, {
        replacements: { userIdDeduct: userId, gamePointIdDeduct: gamePointId, pointsToDeduct: pointsToDeduct },
        type: 'RAW',
      });

      // Nếu kết quả trả về 'success', trả về true, ngược lại trả về false
      return result?.result === 'success';
    } catch (error) {
      console.log('🚀 ~ UserPointService ~ deductPointByUser ~ error:', error);
      // Nếu có lỗi xảy ra, trả về false
      return false;
    }
  }

  async addPointToUser(dto: DataJobAddPointToUser) {
    try {
      const [result, tag]: any = await this.sequelize.query(`CALL add_money_by_user_game(:p_userId, :p_gamePointId, :p_points);`, {
        replacements: { p_userId: dto.userId, p_gamePointId: dto.gamePointId, p_points: dto.points },
        type: 'RAW',
      });

      // Nếu kết quả trả về 'success', trả về true, ngược lại trả về false
      return result?.result === 'success';
    } catch (error) {
      console.log('🚀 ~ UserPointService ~ deductPointByUser ~ error:', error);
      // Nếu có lỗi xảy ra, trả về false
      return false;
    }
  }
}
