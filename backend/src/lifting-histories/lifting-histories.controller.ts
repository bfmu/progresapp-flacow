import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LiftingHistoriesService } from './lifting-histories.service';
import { CreateLiftingHistoryDto, RequestCreateLiftingHistoryDto } from './dto/create-lifting-history.dto';
import { UpdateLiftingHistoryDto } from './dto/update-lifting-history.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ActiveUser } from 'src/common/active-user.decorator';
import { ActiveUserI } from 'src/common/active-user.interface';

@Auth(['user'])
@Controller('lifting-histories')
export class LiftingHistoriesController {
  constructor(
    private readonly liftingHistoriesService: LiftingHistoriesService,
  ) {}

  @Post()
  create(
    @Body() requestCreateLiftingHistoryDto: RequestCreateLiftingHistoryDto,
    @ActiveUser() user: ActiveUserI,
  ) {
    return this.liftingHistoriesService.create(requestCreateLiftingHistoryDto, user);
  }

  @Get()
  findAll(@ActiveUser() user: ActiveUserI) {
    return this.liftingHistoriesService.findAll(user);
  }

  @Get('exercises/:id')
  findForExercise(@Param('id') id: number, @ActiveUser() user: ActiveUserI) {
    return this.liftingHistoriesService.findForExercise(id,user);
  }

  @Get(':id')
  findOne(@Param('id') id: number, @ActiveUser() user: ActiveUserI) {
    return this.liftingHistoriesService.findOne(id,user);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateLiftingHistoryDto: UpdateLiftingHistoryDto,
    @ActiveUser() user: ActiveUserI,
  ) {
    return this.liftingHistoriesService.update(id, updateLiftingHistoryDto,user);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @ActiveUser() user: ActiveUserI) {
    return this.liftingHistoriesService.remove(id,user);
  }
}
