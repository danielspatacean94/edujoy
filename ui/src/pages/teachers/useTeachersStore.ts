import { createCollectionStore } from '@/store/create-collection-store'
import { teachersService } from '@/services/teachers.service'

export const createTeachersStore = () =>
  createCollectionStore(teachersService.list)
