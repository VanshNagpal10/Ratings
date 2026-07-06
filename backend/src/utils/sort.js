// Builds a safe `ORDER BY` clause from a whitelist, preventing SQL injection on
// user-supplied sort fields.
export function buildOrderBy(sortBy, order, allowed, fallback) {
  const column = allowed[sortBy] || allowed[fallback];
  const dir = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return `ORDER BY ${column} ${dir}`;
}
