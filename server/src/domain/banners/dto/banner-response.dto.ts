import { BannerStyle } from '@shared/types/banner';

export class BannerResponseDto {
  id: string;
  message: string;
  startDate: Date;
  endDate: Date;
  style: BannerStyle;
  createdAt: Date;
  updatedAt: Date;
}
