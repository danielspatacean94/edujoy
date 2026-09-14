import { createCollectionStore } from '@/store/create-collection-store'
import { childrenService } from '@/services/children.service'

export const createChildrenStore = () =>
  createCollectionStore(childrenService.list)
