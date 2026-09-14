import { describe, expect, it, jest } from '@jest/globals'
import { renderToStaticMarkup } from 'react-dom/server'
import { GroupForm } from './GroupForm'
import { ChildForm } from '../children/ChildForm'
import { TeacherForm } from '../teachers/TeacherForm'
import { KindergartenForm } from '../kindergartens/KindergartenForm'

jest.mock('@/services/api', () => ({ apiClient: {} }))
const callbacks = { onClose: () => {}, onSaved: () => {} }
const gardens = [{ id: 'garden', name: 'Grădiniță', location: 'București' }]

describe('Dedicated forms', () => {
  it('renders group fields without child or teacher fields', () => {
    const html = renderToStaticMarkup(
      <GroupForm {...callbacks} kindergartens={gardens} admin />,
    )
    expect(html).toContain('group-name')
    expect(html).toContain('Grădiniță')
    expect(html).not.toContain('child-genre')
    expect(html).not.toContain('teacher-email')
    expect(html).not.toContain('child-age')
  })

  it('does not offer a kindergarten selector to teachers managing groups', () => {
    const html = renderToStaticMarkup(
      <GroupForm {...callbacks} kindergartens={[]} admin={false} />,
    )
    expect(html).not.toContain('<select')
    expect(html).toContain('grădinița care îți este atribuită')
  })

  it('renders child genre and only groups in the selected kindergarten', () => {
    const html = renderToStaticMarkup(
      <ChildForm
        {...callbacks}
        admin
        kindergartens={gardens}
        child={{
          id: 'child',
          name: 'Ana',
          age: 4,
          genre: 'female',
          kindergartenId: 'garden',
          groupId: 'group',
          photoKey: null,
        }}
        groups={[
          {
            id: 'group',
            name: 'Fluturași',
            kindergartenId: 'garden',
            childrenCount: 1,
          },
          {
            id: 'other',
            name: 'Altă grupă',
            kindergartenId: 'elsewhere',
            childrenCount: 0,
          },
        ]}
      />,
    )
    expect(html).toContain('Fetiță')
    expect(html).toContain('Băiețel')
    expect(html).toContain('Fluturași')
    expect(html).not.toContain('Altă grupă')
  })

  it('asks for credentials only when creating a teacher', () => {
    const create = renderToStaticMarkup(
      <TeacherForm {...callbacks} kindergartens={gardens} />,
    )
    const edit = renderToStaticMarkup(
      <TeacherForm
        {...callbacks}
        kindergartens={gardens}
        teacher={{
          id: 'teacher',
          fullName: 'Maria',
          email: 'maria@example.com',
          kindergartenId: 'garden',
        }}
      />,
    )
    expect(create).toContain('teacher-email')
    expect(edit).not.toContain('teacher-email')
    expect(edit).not.toContain('Parolă temporară')
  })

  it('renders kindergarten address without assignment fields', () => {
    const html = renderToStaticMarkup(<KindergartenForm {...callbacks} />)
    expect(html).toContain('kindergarten-location')
    expect(html).not.toContain('<select')
  })
})
