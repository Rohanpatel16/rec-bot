import { generateGroqJson } from './groqClient.js';

const SYSTEM_PROMPT = `You are an elite AI technical recruiter.
Your job is to evaluate candidate profiles against Job Descriptions with rigorous logic, provide an accurate match score (0-100%), detail matching skills and gaps, and craft concise, highly personalized LinkedIn connection notes (<300 characters).`;

/**
 * Evaluate a single candidate profile against an analyzed Job Description.
 * @param {object} candidate - Candidate object { name, headline, company, location, snippet, profileUrl }
 * @param {object} jdAnalysis - Parsed JD object from analyzeJobDescription
 * @returns {Promise<object>} Detailed candidate evaluation
 */
export async function evaluateCandidate(candidate, jdAnalysis) {
  if (!candidate || !jdAnalysis) {
    throw new Error('Both candidate and jdAnalysis objects are required.');
  }

  const prompt = `Evaluate the candidate profile against the Job Description and return a JSON object with EXACTLY this structure:
{
  "match_score": 85,
  "match_status": "HIGH_MATCH",
  "evaluation_logic": "Concise 2-sentence explanation of why candidate scores high/medium/low.",
  "matched_skills": ["Node.js", "React", "PostgreSQL"],
  "skill_gaps_or_flags": ["No explicit AWS experience mentioned in headline"],
  "personalized_linkedin_note": "Hi Rohan, noticed your strong Node.js & React work at TechCorp. We are expanding our engineering team for Senior Full Stack roles in Bengaluru. Would love to connect!"
}

Rules:
- "match_status" MUST be one of: "HIGH_MATCH" (score >= 80), "MEDIUM_MATCH" (score 60-79), "LOW_MATCH" (score < 60).
- "personalized_linkedin_note" MUST be under 290 characters, friendly, professional, referencing candidate's specific background or current company.
- Evaluate strictly against the provided Do's & Don'ts and Key Skills.

Job Title: ${jdAnalysis.role_title}
Key Skills Required: ${JSON.stringify(jdAnalysis.key_skills?.required || [])}
Do's and Don'ts: ${JSON.stringify(jdAnalysis.dos_and_donts || {})}

Candidate Name: ${candidate.name}
Headline / Role: ${candidate.headline}
Company: ${candidate.company}
Location: ${candidate.location}
Bio / Snippet: ${candidate.snippet}`;

  const evaluation = await generateGroqJson(prompt, SYSTEM_PROMPT);
  
  // Ensure score is a number
  evaluation.match_score = Number(evaluation.match_score) || 0;
  if (evaluation.match_score >= 80) evaluation.match_status = 'HIGH_MATCH';
  else if (evaluation.match_score >= 60) evaluation.match_status = 'MEDIUM_MATCH';
  else evaluation.match_status = 'LOW_MATCH';

  return evaluation;
}

/**
 * Test function for Candidate Evaluator
 */
export async function testCandidateEvaluation() {
  const sampleCandidate = {
    name: 'Rohan Sharma',
    headline: 'Senior Full Stack Engineer @ TechCorp | Node.js, React, AWS, Microservices',
    company: 'TechCorp',
    location: 'Bengaluru, India',
    snippet: '5+ years building high-throughput microservices using Node.js, TypeScript, PostgreSQL, and React.',
    profileUrl: 'https://www.linkedin.com/in/rohan-sharma-tech',
  };

  const sampleJdAnalysis = {
    role_title: 'Senior Full Stack Developer',
    key_skills: {
      required: ['Node.js', 'React', 'TypeScript', 'PostgreSQL'],
      preferred: ['AWS'],
    },
    dos_and_donts: {
      dos: ['Must have 4+ years experience', 'Must know Node.js and React'],
      donts: ['Do not accept freshers'],
    },
  };

  console.log('🧪 Testing Candidate Evaluator...');
  const result = await evaluateCandidate(sampleCandidate, sampleJdAnalysis);
  console.log('✅ Candidate Evaluation Result:\n', JSON.stringify(result, null, 2));
  return result;
}
