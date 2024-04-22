import { ApiProperty } from '@nestjs/swagger';
import { TypeGameDice } from 'src/constants';

export class CreateGameDiceDetailDto {
  @ApiProperty({ name: 'type', description: 'Type of dice', example: TypeGameDice.Blockchain })
  type: string;

  @ApiProperty({ name: 'name', description: 'Name of dice', example: 'Dice 1' })
  name: string;

  @ApiProperty({ name: 'nameAuthor', description: 'người đang live', example: 'Dice 1' })
  nameAuthor: string;

  @ApiProperty({ name: 'avtAuthor', description: 'ảnh người live', example: 'Dice 1' })
  avtAuthor: string;

  @ApiProperty({ name: 'idLive', description: 'id live ', example: 'okgd' })
  idLive: string;

  @ApiProperty({ name: 'nationalAuthor', description: 'id live ', example: 'okgd' })
  nationalAuthor: string;
}
