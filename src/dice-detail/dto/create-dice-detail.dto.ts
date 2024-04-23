import { ApiProperty } from '@nestjs/swagger';
import { TypeGameDice } from 'src/constants';

export class CreateGameDiceDetailDto {
  @ApiProperty({ name: 'transaction', type: Number, description: 'phiên' })
  transaction: number;

  @ApiProperty({ name: 'totalRed', type: Number, description: 'Số lượng đỏ' })
  totalRed: number;

  @ApiProperty({ name: 'gameDiceId', type: Number, description: 'id game' })
  gameDiceId: number;
}
