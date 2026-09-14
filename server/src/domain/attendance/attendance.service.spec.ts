import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { AttendanceService } from './attendance.service';
import { Attendance, AttendanceStatus, ChildAttendanceStatus } from './entities/attendance.entity';
import { Child } from '../children/entities/child.entity';
import { Group } from '../groups/entities/group.entity';
import { GroupsService } from '../groups/groups.service';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

describe('Attendance completion', () => {
  const user: AuthenticatedUser = { userId: 'teacher', email: 'teacher@example.com', fullName: null, role: 'teacher' };
  const group = Object.assign(new Group(), { _id: new ObjectId(), name: 'Group' });
  const children = [new Child(), new Child()].map(child => Object.assign(child, { _id: new ObjectId(), groupId: group._id.toString(), deletedAt: null }));
  let record: Attendance;
  let service: AttendanceService;

  beforeEach(() => {
    record = Object.assign(new Attendance(), { _id: new ObjectId(), groupId: group._id.toString(), status: AttendanceStatus.IN_PROGRESS });
    service = new AttendanceService(
      { findOne: jest.fn(async () => record), save: jest.fn(async () => record) } as unknown as MongoRepository<Attendance>,
      { find: jest.fn(async () => children), findOne: jest.fn(async () => children[1]) } as unknown as MongoRepository<Child>,
      {} as MongoRepository<Group>,
      { requireActive: jest.fn(async () => group) } as unknown as GroupsService,
    );
  });

  it('marks only unset children absent when the teacher finishes', async () => {
    record.childStatuses[children[0]._id.toString()] = ChildAttendanceStatus.PRESENT;
    const result = await service.finish(record._id.toString(), user);
    expect(result.children.map(child => child.status)).toEqual(['PRESENT', 'ABSENT']);
    expect(result.checkedCount).toBe(2);
    expect(result.status).toBe(AttendanceStatus.FINISHED);
  });

  it('finishes automatically after the last child is marked present', async () => {
    record.childStatuses[children[0]._id.toString()] = ChildAttendanceStatus.PRESENT;
    const result = await service.setChildStatus(record._id.toString(), children[1]._id.toString(), ChildAttendanceStatus.PRESENT, user);
    expect(result.status).toBe(AttendanceStatus.FINISHED);
    expect(result.finishedAt).toBeInstanceOf(Date);
  });

  it.each([null, ChildAttendanceStatus.ABSENT])('stays open when another child is %s', async status => {
    if (status) record.childStatuses[children[0]._id.toString()] = status;
    const result = await service.setChildStatus(record._id.toString(), children[1]._id.toString(), ChildAttendanceStatus.PRESENT, user);
    expect(result.status).toBe(AttendanceStatus.IN_PROGRESS);
    expect(result.finishedAt).toBeNull();
  });

  it('preserves legacy present entries when finishing', async () => {
    record.checkedChildIds = [children[0]._id.toString()];
    const result = await service.finish(record._id.toString(), user);
    expect(result.children.map(child => child.status)).toEqual(['PRESENT', 'ABSENT']);
  });

  it('includes child genre in attendance responses', async () => {
    children[0].genre = 'female';
    children[1].genre = 'male';
    try {
      const result = await service.findOne(record._id.toString(), user);
      expect(result.children.map(child => child.genre)).toEqual(['female', 'male']);
    } finally {
      children[0].genre = null;
      children[1].genre = null;
    }
  });

  it('shuffles on start and preserves positions through updates and reopening', async () => {
    record.status = AttendanceStatus.PENDING;
    const random = jest.spyOn(Math, 'random').mockReturnValue(0);
    try {
      const started = await service.start(record._id.toString(), user);
      const ids = started.children.map(child => child.id);
      expect(ids).toEqual([...children].reverse().map(child => child._id.toString()));
      const updated = await service.setChildStatus(record._id.toString(), children[1]._id.toString(), ChildAttendanceStatus.PRESENT, user);
      expect(updated.children.map(child => child.id)).toEqual(ids);
      const reopened = await service.start(record._id.toString(), user);
      expect(reopened.children.map(child => child.id)).toEqual(ids);
      expect(random).toHaveBeenCalledTimes(1);

      const now = new Date();
      record.date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      await service.reset(record._id.toString(), user);
      random.mockReturnValue(0.99);
      const restarted = await service.start(record._id.toString(), user);
      expect(restarted.children.map(child => child.id)).toEqual(children.map(child => child._id.toString()));
      expect(random).toHaveBeenCalledTimes(2);
    } finally {
      random.mockRestore();
    }
  });
});
