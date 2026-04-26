export interface SubjectInfo {
  name: string;
  color: string;
  bg: string;
  description: string;
  image: string;
}

export const SUBJECT_INFO: Record<string, SubjectInfo> = {
  'Hisabati':          { name: 'Hisabati',          color: '#be185d', bg: '#fdf2f8', description: 'Mathematics — Hesabu, Algebra, Jiometri',      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=75' },
  'Sayansi':           { name: 'Sayansi',            color: '#1d4ed8', bg: '#eff6ff', description: 'Science — General science for primary school',   image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&q=75' },
  'Kiingereza':        { name: 'Kiingereza',         color: '#6d28d9', bg: '#f5f3ff', description: 'English Language and Literature',                image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=75' },
  'Kiswahili':         { name: 'Kiswahili',          color: '#065f46', bg: '#ecfdf5', description: 'Kiswahili Language and Literature',              image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=75' },
  'Historia':          { name: 'Historia',           color: '#92400e', bg: '#fffbeb', description: 'History of Tanzania and the World',              image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&q=75' },
  'Jiografia':         { name: 'Jiografia',          color: '#064e3b', bg: '#ecfdf5', description: 'Geography of Tanzania and the World',            image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=75' },
  'Uraia na Maadili':  { name: 'Uraia na Maadili',  color: '#1e3a8a', bg: '#eff6ff', description: 'Civics, Ethics and Culture',                     image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=75' },
  'Biologia':          { name: 'Biologia',           color: '#166534', bg: '#f0fdf4', description: 'Biology — Form I to Form IV',                   image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&q=75' },
  'Kemia':             { name: 'Kemia',              color: '#581c87', bg: '#faf5ff', description: 'Chemistry — Form I to Form IV',                 image: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=400&q=75' },
  'Fizikia':           { name: 'Fizikia',            color: '#c2410c', bg: '#fff7ed', description: 'Physics — Form I to Form IV',                   image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&q=75' },
  'Sanaa':             { name: 'Sanaa',              color: '#9d174d', bg: '#fdf2f8', description: 'Art and Craft',                                  image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=75' },
  'Muziki':            { name: 'Muziki',             color: '#4c1d95', bg: '#f5f3ff', description: 'Music, Songs and Instruments',                   image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&q=75' },
  'Kompyuta':          { name: 'Kompyuta',           color: '#0c4a6e', bg: '#f0f9ff', description: 'Computer Studies and Technology',                image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=75' },
  'Dini ya Kiislamu':  { name: 'Dini ya Kiislamu',  color: '#14532d', bg: '#f0fdf4', description: 'Islamic Religious Education',                    image: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=400&q=75' },
  'Elimu ya Dini':     { name: 'Elimu ya Dini',     color: '#1e40af', bg: '#eff6ff', description: 'Christian Religious Education',                  image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&q=75' },
  'Hadithi za Watoto': { name: 'Hadithi za Watoto', color: '#9d174d', bg: '#fdf2f8', description: 'Children Stories',                               image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=75' },
  'Nyimbo za Watoto':  { name: 'Nyimbo za Watoto',  color: '#b45309', bg: '#fffbeb', description: 'Children Songs and Nursery Rhymes',              image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=75' },
  'Michezo':           { name: 'Michezo',            color: '#166534', bg: '#f0fdf4', description: 'Sports and Physical Education',                  image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&q=75' },
};

export const CLASSES = [
  'Chekechea',
  'Darasa la 1', 'Darasa la 2', 'Darasa la 3', 'Darasa la 4',
  'Darasa la 5', 'Darasa la 6', 'Darasa la 7',
  'Form I', 'Form II', 'Form III', 'Form IV',
  'Zote',
];
