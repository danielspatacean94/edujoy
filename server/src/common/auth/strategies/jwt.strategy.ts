import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtPayload, AuthenticatedUser } from '../../interfaces/jwt-payload.interface';
import { UsersService } from '../../../domain/users/users.service';

const cookieExtractor = (req: Request): string | null => {
  return req?.cookies?.access_token ?? null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.usersService.findRawById(payload.sub);

    if (!user) throw new UnauthorizedException();

    if (user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException('Sesiunea a expirat. Autentifică-te din nou.');
    }

    return {
      userId: user._id.toString(),
      email: user.email,
      fullName: user.fullName ?? null,
      role: user.role,
      kindergartenId: user.kindergartenId ?? null,
    };
  }
}
