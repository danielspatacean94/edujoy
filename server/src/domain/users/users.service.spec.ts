import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoRepository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { KindergartensService } from '../kindergartens/kindergartens.service';
describe('Teacher assignments', () => {
  const repo = { findOne: jest.fn<() => Promise<Partial<User>>>(), save: jest.fn() };
  const gardens = { requireActive: jest.fn<() => Promise<object>>() };
  const service = new UsersService(repo as unknown as MongoRepository<User>, {} as ConfigService, gardens as unknown as KindergartensService);
  beforeEach(() => { jest.resetAllMocks(); });
  it('requires a kindergarten when creating a teacher', async () => {
    await expect(service.create({ email: 't@example.com', fullName: 'Teacher', password: 'temporary123', role: 'teacher' })).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.save).not.toHaveBeenCalled();
  });
  it('checks the destination when reassigning a teacher', async () => {
    repo.findOne.mockResolvedValue({ role: 'teacher', kindergartenId: '111111111111111111111111' });
    gardens.requireActive.mockRejectedValue(new BadRequestException('Grădinița nu a fost găsită.'));
    await expect(service.update('222222222222222222222222', { kindergartenId: '333333333333333333333333' })).rejects.toThrow('Grădinița nu a fost găsită.');
    expect(repo.save).not.toHaveBeenCalled();
  });
  it('excludes deleted users from session lookup', async () => {
    await service.findRawById('222222222222222222222222');
    expect(repo.findOne).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ deletedAt: null }) }));
  });
});
