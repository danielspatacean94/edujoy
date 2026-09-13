import { IsString, IsNotEmpty, IsDateString, IsOptional, IsIn } from 'class-validator';
import { BannerStyle, BANNER_STYLES } from '@shared/types/banner';

export class UpdateBannerDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  message?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsIn(BANNER_STYLES)
  style?: BannerStyle;
}
