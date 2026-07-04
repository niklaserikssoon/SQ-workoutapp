import { initSimplePage } from './simplePage.js';
import { child } from '../data/demoData.js';

initSimplePage({
  activePage: 'timeline',
  title: 'Tidslinje',
  subtitle: `${child.name}s hela resa, i kronologisk ordning.`,
  matchesFilter: null,
});
