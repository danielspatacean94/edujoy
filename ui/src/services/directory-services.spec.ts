import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { apiClient } from './api'
import { groupsService } from './groups.service'
import { kindergartensService } from './kindergartens.service'
import { teachersService } from './teachers.service'
import { childrenService } from './children.service'

jest.mock('./api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))
const post = jest.mocked(apiClient.post)
const put = jest.mocked(apiClient.put)
const get = jest.mocked(apiClient.get)

beforeEach(() => {
  jest.resetAllMocks()
  post.mockResolvedValue({ data: { id: 'created' } })
  put.mockResolvedValue({ data: { id: 'updated' } })
})

describe('Dedicated service contracts', () => {
  it('creates a group using only group fields', async () => {
    await groupsService.create({ name: 'Fluturași', kindergartenId: 'garden' })
    expect(post).toHaveBeenCalledWith('/groups', {
      name: 'Fluturași',
      kindergartenId: 'garden',
    })
  })

  it('lets the server assign a teacher-created group to their kindergarten', async () => {
    await groupsService.create({ name: 'Fluturași' })
    expect(post).toHaveBeenCalledWith('/groups', { name: 'Fluturași' })
  })

  it('sends child genre and group assignment to the children endpoint', async () => {
    const input = {
      name: 'Ana',
      age: 4,
      genre: 'female' as const,
      groupId: 'group',
    }
    await childrenService.update('child', input)
    expect(put).toHaveBeenCalledWith('/children/child', input)
  })

  it('creates teacher accounts through users with the teacher role', async () => {
    const input = {
      fullName: 'Maria',
      kindergartenId: 'garden',
      email: 'maria@example.com',
      password: 'temporary123',
    }
    await teachersService.create(input)
    expect(post).toHaveBeenCalledWith('/users', { ...input, role: 'teacher' })
  })

  it('loads all kindergarten lookup pages', async () => {
    get
      .mockResolvedValueOnce({ data: { data: [{ id: 'one' }], totalPages: 2 } })
      .mockResolvedValueOnce({ data: { data: [{ id: 'two' }], totalPages: 2 } })
    expect(await kindergartensService.all()).toEqual([
      { id: 'one' },
      { id: 'two' },
    ])
    expect(get).toHaveBeenLastCalledWith('/kindergartens', {
      params: { page: 2, search: '', limit: 1000 },
    })
  })
})
