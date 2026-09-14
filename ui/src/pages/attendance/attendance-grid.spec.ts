import { describe, expect, it } from '@jest/globals'
import { fitAttendanceGrid } from './attendance-grid'

describe('Viewport attendance grid', () => {
  it.each([12, 24, 30, 40])('fits %i children in portrait and landscape tablet space', count => {
    for (const [width, height] of [[736, 780], [992, 520]]) {
      const grid = fitAttendanceGrid(count, width, height)
      expect(grid.columns * grid.rows).toBeGreaterThanOrEqual(count)
      expect(grid.cardHeight).toBeGreaterThan(0)
      expect(grid.cardHeight * grid.rows + (grid.rows - 1) * 10).toBeCloseTo(height)
    }
  })

  it('uses more columns after rotating into landscape', () => {
    expect(fitAttendanceGrid(30, 992, 520).columns).toBeGreaterThan(fitAttendanceGrid(30, 736, 780).columns)
  })
})
