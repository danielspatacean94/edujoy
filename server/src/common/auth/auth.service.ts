import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../../domain/users/users.service';
import { LoginDto } from './dto/login.dto';
import { AuthenticatedUser, JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly logger: Logger,
  ) {}

  async login(dto: LoginDto) {
    this.logger.log(`Login user ${dto.email}`, this.constructor.name);
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (!user.password) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };

    const access_token = this.jwtService.sign(payload);

    this.logger.log(`Login user ${dto.email} OK`, this.constructor.name);

    return { access_token };
  }

  async logout(user: AuthenticatedUser): Promise<void> {
    this.logger.log(`Logout user ${user.email}`, this.constructor.name);
  }
}
