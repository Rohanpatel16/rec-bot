import { generateGroqJson } from './groqClient.js';

const SYSTEM_PROMPT = `You are an expert technical recruiter and sourcing strategist.
Your task is to analyze Job Descriptions (JDs) and produce high-precision sourcing queries, candidate screening criteria, and simplified breakdowns in structured JSON format.`;

/**
 * Analyze raw Job Description text and extract structured recruitment insights.
 * @param {string} rawJd - Raw text of the Job Description
 * @param {string} [customTitle=''] - Optional role title override
 * @returns {Promise<object>} Structured JD Analysis
 */
export async function analyzeJobDescription(rawJd, customTitle = '') {
  if (!rawJd || rawJd.trim().length === 0) {
    throw new Error('Job description text cannot be empty.');
  }

  const userPrompt = `Analyze the following Job Description and return a JSON object with EXACTLY this structure:
{
  "role_title": "Clean concise job title",
  "simplified_jd": "3-4 sentence plain-English summary of what this role does and why it exists.",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "key_skills": {
    "required": ["skill1", "skill2"],
    "preferred": ["skill3", "skill4"]
  },
  "dos_and_donts": {
    "dos": ["Must have 3+ years experience in X", "Must be located in Y or open to relocation"],
    "donts": ["Do not select candidates with only frontend experience", "Do not accept candidates without hands-on Z"]
  },
  "screening_questions": [
    "Question 1 to assess core skill",
    "Question 2 to evaluate problem solving",
    "Question 3 to test domain fit"
  ],
  "xray_search_query": "site:linkedin.com/in/ \\"Job Title\\" \\"PrimarySkill1\\" \\"PrimarySkill2\\" \\"LocationOrRemote\\"",
  "boolean_search_string": "(\\"Title 1\\" OR \\"Title 2\\") AND (\\"Skill 1\\" OR \\"Skill 2\\") AND (\\"Location\\")"
}

Requirements:
- Ensure the X-Ray query uses site:linkedin.com/in/ format with clean quotes and targeted keywords.
- Keep boolean_search_string formatted for standard search engines and LinkedIn search bar.
- Be precise and realistic.

Job Title Hint: ${customTitle || 'Infer from text'}
Raw Job Description:
"""
${rawJd}
"""`;

  const analysis = await generateGroqJson(userPrompt, SYSTEM_PROMPT);
  return analysis;
}

/**
 * Test function for JD Analyzer
 */
export async function testJdAnalysis() {
  const sampleJd = `
    We are looking for a Senior Full Stack Engineer (Node.js & React) based in Bengaluru or Remote India.
    Requirements:
    - 4+ years of professional software engineering experience.
    - Deep expertise in Node.js, Express, TypeScript, and React.js.
    - Hands-on experience with PostgreSQL, Redis, and RESTful APIs.
    - Experience in AWS deployment (S3, EC2, CloudWatch) is a major plus.
    - Strong problem-solving mindset and ability to lead sprint planning.
    Responsibilities:
    - Build scalable microservices and user interfaces.
    - Write clean, unit-tested code.
  `;

  console.log('🧪 Testing JD Analyzer with sample JD...');
  const result = await analyzeJobDescription(sampleJd, 'Senior Full Stack Engineer');
  console.log('✅ JD Analysis Result:\n', JSON.stringify(result, null, 2));
  return result;
}
