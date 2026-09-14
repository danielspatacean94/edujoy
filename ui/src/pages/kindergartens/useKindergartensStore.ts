import { createCollectionStore } from '@/store/create-collection-store'
import { kindergartensService } from '@/services/kindergartens.service'

export const createKindergartensStore = () =>
  createCollectionStore(kindergartensService.list)
