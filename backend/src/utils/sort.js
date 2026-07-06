
export function buildOrderBy(sortBy, order, allowed, fallback) {
  const column = allowed[sortBy] || allowed[fallback];
  const dir = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return `ORDER BY ${column} ${dir}`;
}
