import type { KnowledgeRow } from './types';

export function bestRowsPerPet(rows: KnowledgeRow[], limit: number): Array<{
  pet: KnowledgeRow;
  evidence: KnowledgeRow[];
}> {
  const grouped = new Map<string, KnowledgeRow[]>();
  for (const row of rows) {
    grouped.set(row.id, [...(grouped.get(row.id) ?? []), row]);
  }
  return [...grouped.values()]
    .map((evidence) => ({ pet: evidence[0], evidence: evidence.slice(0, 2) }))
    .sort((left, right) => right.evidence[0].similarity - left.evidence[0].similarity)
    .slice(0, limit);
}