type ShareContent = {
  title: string;
  markdown: string;
};

const JOB_CONTENT: Record<string, ShareContent> = {
   "data-research-intern": { title: "Data Research Intern", markdown: `**Role Intro**

Are you someone who loves digging into details, spotting patterns, and building smart systems from scratch? Join us as a Data Research & Management Intern and help lay the groundwork for something big. At Brickfi, we're revolutionising real estate using AI. This is not your average internship. You'll be at the intersection of research, operations, and product thinking talking to real builders, mapping markets, preparing datasets, and shaping how future users experience clean, reliable property insights.



**Basic Details**

Paid internship with stipend upto 10k.
The initial internship duration will be 3 months with optional extension.
Has to be located in Bangalore and will be required to work with the team 1-2 days in office.


**Your core responsibilities**

- Research as well do offline reach out out to real estate builders, agents, or developers to collect detailed property information.
- Draft and maintain standard operating procedures (SOPs) including AI based workflows for data collection and validation.
- Research micro markets including real estate drivers like industrial areas, roads, transit, commercial infra etc.
- Collaborate with the internal team to suggest feature ideas or improvements to tools that support data workflows.
Stay updated on ongoing and upcoming real estate projects in target markets.


**Apply at Link Below**

https://forms.gle/gNaDNm1MXakpo7YU9
` }
};

const DOCUMENT_CONTENT: Record<string, ShareContent> = {
  // example: "privacy-policy": { title: "Privacy Policy", markdown: "..." }
};

export function getShareContent(
  type: "job" | "document",
  id: string
): ShareContent | null {
  const map = type === "job" ? JOB_CONTENT : DOCUMENT_CONTENT;
  return map[id] ?? null;
}
