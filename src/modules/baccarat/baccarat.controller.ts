import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { BaccaratService } from './baccarat.service';
import { CreateBaccaratDto } from './dto/create-baccarat.dto';
import { UpdateBaccaratDto } from './dto/update-baccarat.dto';
import { ApiOperationCustom, BaseFilter } from 'src/custom-decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Baccarat')
@Controller('baccarat')
export class BaccaratController {
  constructor(private readonly baccaratService: BaccaratService) {}

  @Post()
  @ApiOperationCustom('Dice', 'POST')
  create(@Body() dto: CreateBaccaratDto) {
    return this.baccaratService.create(dto);
  }

  @Get()
  @BaseFilter()
  @ApiOperationCustom('Dice', 'get')
  findAll(@Req() req: any, @Query('sort') sort: string, @Query('typeSort') typeSort: string) {
    return this.baccaratService.findAll(req['pagination'], sort, typeSort);
  }

  @Get(':id')
  @ApiOperationCustom('Dice', 'get', true, true)
  findOne(@Param('id') id: string) {
    return this.baccaratService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperationCustom('Dice', 'patch')
  update(@Param('id') id: string, @Body() dto: UpdateBaccaratDto) {
    return this.baccaratService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperationCustom('Dice', 'delete')
  remove(@Param('id') id: string) {
    return this.baccaratService.remove(+id);
  }
}
