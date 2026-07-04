import { initSimplePage } from './simplePage.js';
import { child } from '../data/demoData.js';

initSimplePage({
  activePage: 'memories',
  title: 'Minnen',
  subtitle: `Stunder värda att minnas från ${child.name}s vardag, utan bild.`,
  matchesFilter: 'minnen',
});
