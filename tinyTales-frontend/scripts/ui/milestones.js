import { initSimplePage } from './simplePage.js';
import { child } from '../data/demoData.js';

initSimplePage({
  activePage: 'milestones',
  title: 'Milstolpar',
  subtitle: `${child.name}s viktiga framsteg, ett efter ett.`,
  matchesFilter: 'milstolpar',
});
