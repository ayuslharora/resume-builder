export function normalizeTimestamp(createdAt) {
  if (!createdAt) return 0;
  return createdAt.seconds ? createdAt.seconds * 1000 : Number(createdAt);
}

export function buildDailySeries(views, days) {
  const now = new Date();
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dateStr = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    // Use local YYYY-MM-DD so views near midnight don't land in the wrong bucket
    const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const count = views.filter(v => {
      const ms = normalizeTimestamp(v.createdAt);
      if (!ms || isNaN(ms)) return false;
      const vd = new Date(ms);
      const vKey = `${vd.getFullYear()}-${String(vd.getMonth() + 1).padStart(2, "0")}-${String(vd.getDate()).padStart(2, "0")}`;
      return vKey === dayKey;
    }).length;
    result.push({ label: dateStr, count });
  }
  return result;
}
