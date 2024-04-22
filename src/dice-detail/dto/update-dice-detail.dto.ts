import { PartialType } from '@nestjs/swagger';
import { CreateGameDiceDetailDto } from './create-dice-detail.dto';

export class UpdateGameDiceDetailDto extends PartialType(CreateGameDiceDetailDto) {}
