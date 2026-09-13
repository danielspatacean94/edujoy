from pathlib import Path
def edit(path,old,new):
 p=Path(path);s=p.read_text(encoding='utf-8');assert old in s,(path,old);p.write_text(s.replace(old,new),encoding='utf-8')
edit('server/src/domain/children/children.controller.ts','import { SaveChildDto }','import { SaveChildDto, ChildQueryDto }')
edit('server/src/domain/children/children.controller.ts','query: PaginationQueryDto','query: ChildQueryDto')
edit('server/src/domain/children/children.service.ts','const scope = await this.groups.scope(user, query.kindergartenId);','const scope = query.kindergartenId ? await this.groups.scope(user, query.kindergartenId) : await this.scope(user);')
edit('server/src/common/database/database.module.ts',"import { Module }", "import { Group } from '../../domain/groups/entities/group.entity';\nimport { Module }")
edit('server/src/common/database/database.module.ts','Kindergarten, Child]', 'Kindergarten, Child, Group]')
edit('server/src/app.module.ts',"import { ChildrenModule }", "import { GroupsModule } from './domain/groups/groups.module';\nimport { ChildrenModule }")
edit('server/src/app.module.ts','    ChildrenModule,','    ChildrenModule,\n    GroupsModule,')
edit('server/src/domain/kindergartens/kindergartens.module.ts',"import { Module }", "import { Group } from '../groups/entities/group.entity';\nimport { Module }")
edit('server/src/domain/kindergartens/kindergartens.module.ts','Kindergarten, User, Child]', 'Kindergarten, User, Child, Group]')
edit('server/src/domain/kindergartens/kindergartens.service.ts',"import { Injectable", "import { Group } from '../groups/entities/group.entity';\nimport { Injectable")
edit('server/src/domain/kindergartens/kindergartens.service.ts','private readonly children: MongoRepository<Child>)','private readonly children: MongoRepository<Child>,\n    @InjectRepository(Group) private readonly groups: MongoRepository<Group>)')
edit('server/src/domain/kindergartens/kindergartens.service.ts','const [teachers, children]', 'const [teachers, children, groups]')
edit('server/src/domain/kindergartens/kindergartens.service.ts','this.children.count({ where: { kindergartenId: id, deletedAt: null } }),','this.children.count({ where: { kindergartenId: id, deletedAt: null } }),\n      this.groups.count({ where: { kindergartenId: id, deletedAt: null } }),')
edit('server/src/domain/kindergartens/kindergartens.service.ts','if (teachers || children)', 'if (teachers || children || groups)')
edit('server/src/domain/kindergartens/kindergartens.service.ts','Mută sau șterge educatorii și copiii înainte de a șterge această grădiniță.', 'Mută sau șterge grupele, educatorii și copiii înainte de a șterge această grădiniță.')
edit('server/src/common/dto/validation-messages.ts',"location: 'Adresă'", "groupId: 'Grupă', location: 'Adresă'")
edit('ui/src/services/edujoy.service.ts',"'kindergartens' | 'teachers' | 'children'", "'kindergartens' | 'teachers' | 'children' | 'groups'")
edit('ui/src/services/edujoy.service.ts','kindergartenId?: string | null;', 'groupId?: string | null; kindergartenId?: string | null;')
edit('ui/src/services/edujoy.service.ts','kindergartenId?: string;', 'groupId?: string; kindergartenId?: string;')
edit('ui/src/services/edujoy.service.ts','limit = 12) =>', 'limit = 12, filters: { kindergartenId?: string; groupId?: string } = {}) =>')
edit('ui/src/services/edujoy.service.ts','{ page, limit, search }','{ page, limit, search, ...filters }')
edit('ui/src/services/edujoy.service.ts','  async kindergartens() {', '''  async groups() {
    const rows: RecordItem[] = []
    let page = 1, pages = 1
    do {
      const { data } = await this.list('groups', page, '', 1000)
      rows.push(...data.data); pages = data.totalPages; page++
    } while (page <= pages)
    return rows
  },
  async kindergartens() {''')
edit('ui/src/pages/people/useDirectoryStore.ts','search: string) => Promise<void>', 'search: string, filters?: { kindergartenId?: string; groupId?: string }) => Promise<void>')
edit('ui/src/pages/people/useDirectoryStore.ts','async (resource, page, search)', 'async (resource, page, search, filters)')
edit('ui/src/pages/people/useDirectoryStore.ts','edujoyService.list(resource, page, search)', 'edujoyService.list(resource, page, search, 12, filters)')
edit('ui/src/router/AppRouter.tsx','<Route path="/children"', '<Route path="/groups" element={<DirectoryPage key="groups" resource="groups" />} />\n          <Route path="/children"')
edit('ui/src/components/layout/Sidebar.tsx',"{ label: 'Copii',", "{ label: 'Grupe', path: '/groups', Icon: Users },\n  { label: 'Copii',")
edit('ui/src/components/layout/Header.tsx',"children: 'Copii',", "children: 'Copii', groups: 'Grupe',")
edit('ui/src/pages/admin/history/HistoryPage.tsx',"Child: 'Copil',", "Child: 'Copil',\n  Group: 'Grupă',")
edit('ui/src/pages/admin/history/HistoryPage.tsx',"kindergartenId: 'Grădiniță',", "kindergartenId: 'Grădiniță', groupId: 'Grupă',")
edit('ui/src/pages/dashboard/DashboardPage.tsx',"    { title: 'Copii',", "    { title: 'Grupe', text: 'Organizează grupele grădiniței și descoperă copiii din fiecare grupă.', path: '/groups', Icon: GraduationCap, color: 'butter' },\n    { title: 'Copii',")
edit('ui/src/pages/dashboard/DashboardPage.tsx','md:grid-cols-3','sm:grid-cols-2 xl:grid-cols-4')
