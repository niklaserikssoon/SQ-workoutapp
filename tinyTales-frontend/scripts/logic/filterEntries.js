// Filtrerar Memory-objekt. Det finns ingen separat typ-kolumn i backend –
// "Bilder" = har minst en Media, "Minnen" = inga bifogade Media (rena
// textminnen), "Milstolpar" = isFavorite. "Alla" är ofiltrerat.
export function filterEntries(memories, filterKey) {
  switch (filterKey) {
    case 'bilder':
      return memories.filter((memory) => (memory.media?.length ?? 0) > 0);
    case 'minnen':
      return memories.filter((memory) => (memory.media?.length ?? 0) === 0);
    case 'milstolpar':
      return memories.filter((memory) => memory.isFavorite);
    default:
      return memories;
  }
}
