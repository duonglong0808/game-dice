import { ApiProperty } from '@nestjs/swagger';

export class CreateBaccaratDetailDto {
  @ApiProperty({ name: 'mainTransaction', type: Number, description: 'phiên ở trang chính' })
  mainTransaction: number;

  @ApiProperty({ name: 'transaction', type: Number, description: 'phiên ở trang chính' })
  transaction?: number;

  @ApiProperty({ name: 'dateId', type: Number, description: 'Id duy nhất của ngày' })
  dateId: number;

  @ApiProperty({ name: 'gameBaccaratId', type: Number, description: 'id game' })
  gameBaccaratId: number;
}
