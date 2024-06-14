import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BaccaratDetailService } from './baccarat-detail.service';
import { CreateBaccaratDetailDto } from './dto/create-baccarat-detail.dto';
import { UpdateBaccaratDetailDto } from './dto/update-baccarat-detail.dto';

@Controller('baccarat-detail')
export class BaccaratDetailController {
  constructor(private readonly baccaratDetailService: BaccaratDetailService) {}

  @Post()
  create(@Body() createBaccaratDetailDto: CreateBaccaratDetailDto) {
    return this.baccaratDetailService.create(createBaccaratDetailDto);
  }

  @Get()
  findAll() {
    return this.baccaratDetailService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.baccaratDetailService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBaccaratDetailDto: UpdateBaccaratDetailDto) {
    return this.baccaratDetailService.update(+id, updateBaccaratDetailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.baccaratDetailService.remove(+id);
  }
}
