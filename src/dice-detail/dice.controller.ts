import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { DiceDetailService } from './dice.service';
import { CreateGameDiceDetailDto } from './dto/create-dice-detail.dto';
import { UpdateGameDiceDetailDto } from './dto/update-dice-detail.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiOperationCustom, BaseFilter } from 'src/custom-decorator';

@ApiTags('Dice Detail')
@Controller('dice-detail')
export class DiceDetailController {
  constructor(private readonly diceDetailService: DiceDetailService) {}

  @Post()
  @ApiOperationCustom('Dice Detail', 'POST')
  create(@Body() dto: CreateGameDiceDetailDto) {
    return this.diceDetailService.create(dto);
  }

  @Get()
  @BaseFilter()
  @ApiOperationCustom('Dice Detail', 'get')
  findAll(@Req() req: any, @Query('sort') sort: string, @Query('typeSort') typeSort: string) {
    return this.diceDetailService.findAll(req['pagination'], sort, typeSort);
  }

  @Get(':id')
  @ApiOperationCustom('Dice Detail', 'get', true, true)
  findOne(@Param('id') id: string) {
    return this.diceDetailService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperationCustom('Dice Detail', 'patch')
  update(@Param('id') id: string, @Body() dto: UpdateGameDiceDetailDto) {
    return this.diceDetailService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperationCustom('Dice Detail', 'delete')
  remove(@Param('id') id: string) {
    return this.diceDetailService.remove(+id);
  }
}
