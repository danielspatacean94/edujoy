export function fitAttendanceGrid(count: number, width: number, height: number, gap = 10) {
  const total = Math.max(1, count)
  let best = { columns: 1, rows: total, cardHeight: 0, score: -Infinity }
  for (let columns = 1; columns <= total; columns++) {
    const rows = Math.ceil(total / columns)
    const cardWidth = (width - gap * (columns - 1)) / columns
    const cardHeight = (height - gap * (rows - 1)) / rows
    // Prefer large photo cards with a near-square shape, not narrow strips.
    const score = Math.min(cardWidth, cardHeight * 1.1)
    if (score > best.score) best = { columns, rows, cardHeight, score }
  }
  return best
}
