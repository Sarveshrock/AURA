/** SAMPLE TESTIMONIALS (demo content) */
export interface Testimonial { id: string; quote: string; name: string; role: string; avatar: string; tone: 'blue' | 'teal' | 'magenta' | 'violet' }
export const mockTestimonials: Testimonial[] = [
  { id: 'q1', quote: 'AURA completely changed how I manage my daily tasks. It feels like having a personal assistant!', name: 'Priya S.', role: 'Student, Pune', avatar: '/aura/p/t1.jpg', tone: 'blue' },
  { id: 'q2', quote: 'I save hours every week with automated bookings and smart reminders. AURA just gets me.', name: 'Rahul M.', role: 'Software Engineer', avatar: '/aura/p/t2.jpg', tone: 'teal' },
  { id: 'q3', quote: 'From travel planning to wellness tracking, AURA keeps everything in one place. Love the clean UI!', name: 'Aditi K.', role: 'Product Manager', avatar: '/aura/p/t3.jpg', tone: 'magenta' },
  { id: 'q4', quote: 'The AI agents are incredible. It helps me stay organized and make better decisions every day.', name: 'Karan V.', role: 'Entrepreneur', avatar: '/aura/p/t4.jpg', tone: 'violet' },
];

export interface Faq { q: string; a: string }
export const mockFaqs: Faq[] = [
  { q: 'What is AURA?', a: 'AURA (Autonomous User Reasoning Assistant) is a personal AI co-pilot. It understands your situation, consults specialized agents, explains trade-offs, and acts only with your authorization.' },
  { q: 'Is my data safe?', a: 'Yes. Data is protected with row-level security, scoped integration tokens and audit logs. Agents only see the context their role needs, and you can export or delete your data anytime.' },
  { q: 'Which apps can AURA connect to?', a: 'Google Calendar, Gmail, Drive, Maps, MakeMyTrip, IRCTC, Uber, Ola, Swiggy, Zomato, Amazon, Flipkart, Slack, Notion and more — through official APIs, deep links and authorized handoffs.' },
  { q: 'Is there a free plan?', a: 'Yes. The Free plan includes basic AI chat, one personal assistant agent, simple task automation and up to 3 connected apps.' },
  { q: 'Can I upgrade later?', a: 'Anytime. Upgrade or downgrade from Plans & Pricing — your data, agents and settings carry over.' },
  { q: 'How is AURA different from other AI tools?', a: 'Most assistants execute single commands. AURA reasons across your calendar, budget, tasks and preferences, coordinates multiple agents, shows options with trade-offs, and asks before consequential actions.' },
];
