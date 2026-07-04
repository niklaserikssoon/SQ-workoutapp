// Statisk platshållardata för design-prototypen.
// Fältnamnen är medvetet valda för att matcha backend-entiteterna 1:1
// (se TinyTales.Models i backend-projektet) så att det här bara blir
// utbytt mot riktiga API-anrop, inte omskrivet. Se README.md.

export const child = {
  id: 'elsa',
  familyId: 'family-1',
  name: 'Elsa',
  birthDate: '2024-03-12',
  profileImageEmoji: '👶', // ersätter ProfileImageUrl tills riktiga foton finns
};

// "Idag" i demo-datans värld – låst till senaste demo-posten så att
// ålder/grupperingar alltid stämmer, oavsett vilket datum appen faktiskt öppnas.
export const today = '2024-11-20';

// Motsvarar FamilyMember (User + Family + Role). Role: 'Parent' | 'Guardian' | 'Viewer'.
export const familyMembers = [
  { id: 'fm1', displayName: 'Anna', role: 'Parent', initials: 'A' },
  { id: 'fm2', displayName: 'Johan', role: 'Parent', initials: 'J' },
  { id: 'fm3', displayName: 'Sten (morfar)', role: 'Viewer', initials: 'S' },
];

// Motsvarar FamilyInvite (Email + Token + ExpiresAt + Accepted:false).
export const pendingInvites = [{ id: 'inv1', email: 'mormor.karin@example.com', expiresAt: '2024-11-27' }];

// Motsvarar Memory, med en inbäddad `media`-lista (Media: Url/Type/Caption).
// Ingen separat milstolpe- eller tillväxt-entitet finns i backend – en
// milstolpe är bara ett Memory med isFavorite = true.
export const memories = [
  {
    id: 'mem1',
    title: 'Första gången på stranden!',
    description: '',
    memoryDate: '2024-11-20',
    isFavorite: false,
    location: 'Stranden',
    media: [{ type: 'Image', emoji: '🏖️', caption: null }],
  },
  {
    id: 'mem2',
    title: 'Älskar spaghetti',
    description: '',
    memoryDate: '2024-11-18',
    isFavorite: false,
    location: null,
    media: [{ type: 'Image', emoji: '🍝', caption: null }],
  },
  {
    id: 'mem3',
    title: 'Första tanden!',
    description: 'Elsa fick sin första tand idag 🎉',
    memoryDate: '2024-11-15',
    isFavorite: true,
    location: null,
    media: [],
  },
  {
    id: 'mem4',
    title: 'Så stort leende!',
    description: '',
    memoryDate: '2024-11-05',
    isFavorite: false,
    location: null,
    media: [{ type: 'Image', emoji: '😄', caption: null }],
  },
  {
    id: 'mem5',
    title: 'Sitter själv som en liten stjärna',
    description: 'Ett stolt ögonblick på golvet med gosedjuren.',
    memoryDate: '2024-11-01',
    isFavorite: false,
    location: null,
    media: [{ type: 'Image', emoji: '🧸', caption: null }],
  },
  {
    id: 'mem6',
    title: 'Sitter själv',
    description: 'Idag satt Elsa själv helt utan stöd!',
    memoryDate: '2024-10-28',
    isFavorite: true,
    location: null,
    media: [],
  },
  {
    id: 'mem7',
    title: 'Mysig höstdag',
    description: '',
    memoryDate: '2024-10-12',
    isFavorite: false,
    location: 'Parken',
    media: [{ type: 'Image', emoji: '🍂', caption: null }],
  },
  {
    id: 'mem8',
    title: 'Första svängen!',
    description: '',
    memoryDate: '2024-10-03',
    isFavorite: false,
    location: null,
    media: [{ type: 'Image', emoji: '🍁', caption: null }],
  },
  {
    id: 'mem9',
    title: 'Elsa är nu 68 cm lång',
    description: 'Liten men växer så det knakar ❤️',
    memoryDate: '2024-10-10',
    isFavorite: false,
    location: null,
    media: [],
  },
];
