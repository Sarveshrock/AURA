/** DEMO DATA — sample entries; always verify sources. */
export interface Paper {
  id: string; title: string; source: 'arXiv' | 'IEEE' | 'Nature' | 'ACM'; year: number; field: string; openAccess: boolean;
  summary: string; tags: string[]; keyPoints: string[];
}

export const mockPapers: Paper[] = [
  { id: 'r1', title: 'Agentic AI Systems: A Survey and Future Directions', source: 'arXiv', year: 2024, field: 'Computer Science', openAccess: true,
    summary: 'A comprehensive survey of agentic AI systems, architectures, applications and open challenges.', tags: ['AI Agents', 'LLM', 'Survey', 'GenAI'],
    keyPoints: ['Taxonomy of planning, memory and tool-use components', 'Evaluation gaps for long-horizon tasks', 'Safety: permissioning and human-in-the-loop'] },
  { id: 'r2', title: 'RAG in Production: Best Practices and Challenges', source: 'IEEE', year: 2024, field: 'Computer Science', openAccess: true,
    summary: 'Discusses real-world deployment challenges for Retrieval-Augmented Generation systems.', tags: ['RAG', 'LLM', 'Production', 'Data Engineering'],
    keyPoints: ['Chunking and hybrid retrieval trade-offs', 'Evaluation with groundedness metrics', 'Latency and cost budgets'] },
  { id: 'r3', title: 'Multimodal Foundation Models for Real-World Applications', source: 'Nature', year: 2024, field: 'Computer Science', openAccess: false,
    summary: 'Explores multimodal AI models and their applications across healthcare, robotics and education.', tags: ['Multimodal', 'Foundation Models', 'AI', 'Healthcare AI', 'Robotics'],
    keyPoints: ['Vision-language pretraining at scale', 'Clinical imaging case studies', 'Robotic manipulation transfer'] },
  { id: 'r4', title: 'Adversarial Robustness of LLM-based Security Tools', source: 'ACM', year: 2023, field: 'Computer Science', openAccess: true,
    summary: 'Evaluates prompt-injection and jailbreak resilience of LLM security assistants.', tags: ['Cyber Security', 'LLM'],
    keyPoints: ['Prompt injection taxonomy', 'Tool-use sandboxing', 'Red-team benchmarks'] },
  { id: 'r5', title: 'Machine Learning for Climate Downscaling', source: 'Nature', year: 2022, field: 'Earth Science', openAccess: true,
    summary: 'Deep learning approaches for high-resolution regional climate projections.', tags: ['Climate Change', 'Machine Learning'],
    keyPoints: ['Super-resolution networks', 'Uncertainty quantification', 'Regional bias correction'] },
  { id: 'r6', title: 'Lakehouse Architectures for Streaming Analytics', source: 'IEEE', year: 2021, field: 'Computer Science', openAccess: false,
    summary: 'Design patterns for Delta/Iceberg lakehouses serving real-time analytics.', tags: ['Data Engineering'],
    keyPoints: ['Medallion architecture', 'Exactly-once streaming', 'Cost-aware compaction'] },
];

export interface ResearchProject { id: string; name: string; papers: number; updated: string; tone: 'violet' | 'blue' | 'teal' | 'magenta' | 'cyan' }
export const mockProjects: ResearchProject[] = [
  { id: 'rp1', name: 'Agentic AI Review', papers: 12, updated: 'Updated 2 days ago', tone: 'violet' },
  { id: 'rp2', name: 'SecureAIExam', papers: 8, updated: 'Updated 5 days ago', tone: 'blue' },
  { id: 'rp3', name: 'Databricks Data Pipeline', papers: 15, updated: 'Updated 1 week ago', tone: 'teal' },
  { id: 'rp4', name: 'Thesis Ideas', papers: 6, updated: 'Updated 1 week ago', tone: 'magenta' },
];
