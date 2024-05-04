import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateGameDiceDetailDto } from './create-dice-detail.dto';

export class UpdateGameDiceDetailDto extends PartialType(CreateGameDiceDetailDto) {}

export class UpdateStatusDiceDetailDto {
  @ApiProperty({ name: 'totalRed', type: Number, description: 'Số lượng đỏ' })
  totalRed: number;
}
