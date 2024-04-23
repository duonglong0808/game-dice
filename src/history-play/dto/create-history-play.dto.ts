import { ApiProperty } from '@nestjs/swagger';
import { TypeAnswerDice } from 'src/constants';

export class CreateHistoryPlayDto {
  @ApiProperty({ name: 'transaction', description: 'Phiên', type: Number })
  transaction: number;

  @ApiProperty({ name: 'diceDetailId', description: 'Id phiên live', type: Number })
  diceDetailId: number;

  @ApiProperty({ name: 'answer', description: 'Đáp án người dùng chọn', type: Number, example: TypeAnswerDice.p1 })
  answer: number;

  @ApiProperty({ name: 'userId', description: 'Id người chơi', type: Number })
  userId: number;

  @ApiProperty({ name: 'point', description: 'Số điểm đặt', type: Number })
  point: number;
}
