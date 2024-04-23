import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, Req } from '@nestjs/common';
import { HistoryPlayService } from './history-play.service';
import { CreateHistoryPlayDto } from './dto/create-history-play.dto';
import { UpdateHistoryPlayDto } from './dto/update-history-play.dto';
import { ApiTags } from '@nestjs/swagger';
import { ApiOperationCustom } from 'src/custom-decorator';

@ApiTags('History Play')
@Controller('history-play')
export class HistoryPlayController {
  constructor(private readonly historyPlayService: HistoryPlayService) {}

  @Post()
  @ApiOperationCustom('Play dice', 'post')
  async create(@Req() req: any, @Body() dto: CreateHistoryPlayDto) {
    try {
      const user = req['user'];
      dto.userId = user?.id;
      return await this.historyPlayService.create(dto);
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  findAll() {
    return this.historyPlayService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.historyPlayService.remove(+id);
  }
}
