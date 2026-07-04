import { initSimplePage } from './simplePage.js';
import { child } from '../data/demoData.js';

initSimplePage({
  activePage: 'gallery',
  title: 'Galleri',
  subtitle: `Alla minnen med bild av ${child.name}, samlade på ett ställe.`,
  matchesFilter: 'bilder',
});
