/** DEMO DATA */
export type MemoryType = 'Note' | 'Link' | 'File' | 'Image' | 'Video' | 'Voice' | 'Idea' | 'Document' | 'Travel';
export type MemoryCategory = 'Work / Career' | 'Personal' | 'Ideas' | 'Projects' | 'Travel' | 'Finance' | 'Health & Wellness' | 'Learning' | 'Others';

export interface Memory {
  id: string; title: string; body: string; type: MemoryType; category: MemoryCategory; when: string;
  favorite: boolean; deleted?: boolean; image?: string; bullets?: string[]; checks?: string[];
}

export const mockMemories: Memory[] = [
  { id: 'mm1', title: 'Hackathon Idea - Teacher Trainer Platform', body: 'Centralized platform for teachers and trainers to connect after training. 3 roles: Teacher, Trainer, Admin.', type: 'Idea', category: 'Ideas', when: 'Today, 10:24 AM', favorite: true },
  { id: 'mm2', title: 'ContractLens UI Design', body: 'Dashboard layout screenshots for the contract review tool.', type: 'Image', category: 'Projects', when: 'Today, 09:15 AM', favorite: true, image: '/aura/p/mem-ui.jpg' },
  { id: 'mm3', title: 'Important PDF Research Paper', body: 'SecureAIExam - Final Draft.pdf', type: 'Document', category: 'Learning', when: 'Yesterday, 08:40 PM', favorite: true },
  { id: 'mm4', title: 'Goa Trip Plan', body: 'Oct 24 - Oct 28, 2025. Flights, hotel, itinerary, places to visit.', type: 'Travel', category: 'Travel', when: 'Oct 12, 2025', favorite: true, image: '/aura/p/mem-goa.jpg' },
  { id: 'mm5', title: 'Finance Goals 2025', body: 'Yearly money goals', type: 'Note', category: 'Finance', when: 'Oct 11, 2025', favorite: true, checks: ['Save ₹5,000/month', 'Invest in SIP', 'Buy a laptop (Q4)'] },
  { id: 'mm6', title: 'Project Ideas List', body: 'Side projects to explore', type: 'Note', category: 'Work / Career', when: 'Oct 10, 2025', favorite: true, bullets: ['AI phone assistant app', 'Roomify', 'Placement risk modeling', 'Shram-AI compliance'] },
  { id: 'mm7', title: 'Government Hackathons', body: 'https://innovateindia.mygov.in — list of upcoming challenges', type: 'Link', category: 'Work / Career', when: 'Oct 10, 2025', favorite: false },
  { id: 'mm8', title: 'Standup voice note', body: 'Blockers: API quota, design review moved to Thursday.', type: 'Voice', category: 'Work / Career', when: 'Oct 9, 2025', favorite: false },
];

export const categoryCounts: Record<MemoryCategory, number> = {
  'Work / Career': 124, Personal: 86, Ideas: 47, Projects: 68, Travel: 32, Finance: 28, 'Health & Wellness': 21, Learning: 45, Others: 18,
};
