import { UserResponseDto } from './user-response.dto';

export class MeResponseDto extends UserResponseDto {
  passwordExpiresAt: Date | null;
}
