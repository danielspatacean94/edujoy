import 'reflect-metadata';
import { describe, it, expect } from '@jest/globals';
import { validate } from 'class-validator';
import { SaveChildDto } from './child.dto';
import { attendanceAnnouncement } from '@shared/types/child';

describe('Child genre', () => {
  it.each(['male', 'female'])('accepts %s', async genre => {
    const dto = Object.assign(new SaveChildDto(), { name: 'Ana', age: 4, groupId: '111111111111111111111111', genre });
    expect(await validate(dto)).toHaveLength(0);
  });

  it.each([undefined, null, '', 'other'])('rejects missing or invalid genre %s', async genre => {
    const dto = Object.assign(new SaveChildDto(), { name: 'Ana', age: 4, groupId: '111111111111111111111111', genre });
    expect((await validate(dto)).some(error => error.property === 'genre')).toBe(true);
  });

  it('uses the selected genre in attendance speech', () => {
    expect(attendanceAnnouncement('Ana', 'PRESENT', 'female')).toBe('Ana, prezentă');
    expect(attendanceAnnouncement('Ion', 'PRESENT', 'male')).toBe('Ion, prezent');
    expect(attendanceAnnouncement('Alex', 'PRESENT', null)).toBe('Alex, prezent');
  });
});
