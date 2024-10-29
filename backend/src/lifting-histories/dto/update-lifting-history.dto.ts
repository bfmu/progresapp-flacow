import { PartialType } from '@nestjs/mapped-types';
import { RequestCreateLiftingHistoryDto } from './create-lifting-history.dto';

export class UpdateLiftingHistoryDto extends PartialType(RequestCreateLiftingHistoryDto) {}
