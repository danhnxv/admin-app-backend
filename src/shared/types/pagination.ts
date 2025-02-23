import { appEnvs } from '@configs/index';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { OrderQuery } from './order';

export type PaginationQuery = {
  page?: number;
  pageSize?: number;
  order?: OrderQuery<unknown>;
};

export type PaginationResponse<T> = {
  nodes: T[];
  total: number;
  page: number;
  pageSize: number;
};

export class PaginationQueryParams implements PaginationQuery {
  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  pageSize?: number = appEnvs.DEFAULT_PAGINATION_PAGE_SIZE ?? 20;

  @ApiPropertyOptional()
  @IsOptional()
  order?: OrderQuery<unknown>;
}

export class PaginationResponseDto<T> implements PaginationResponse<T> {
  @ApiProperty()
  nodes: T[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;
}
