import { IsString, IsNotEmpty, IsDateString, IsIn } from 'class-validator';
import { BannerStyle, BANNER_STYLES } from '@shared/types/banner';

export class CreateBannerDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsIn(BANNER_STYLES)
  style: BannerStyle;
}
