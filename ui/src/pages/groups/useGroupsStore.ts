import { createCollectionStore } from '@/store/create-collection-store'
import { groupsService } from '@/services/groups.service'

export const createGroupsStore = () => createCollectionStore(groupsService.list)
