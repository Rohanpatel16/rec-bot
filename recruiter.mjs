import dotenv from 'dotenv';
import { analyzeJobDescription } from './src/jdAnalyzer.js';
import { searchCandidatesXRay } from './src/xraySearcher.js';
import { evaluateCandidate } from './src/candidateEvaluator.js';
import { getPendingJds, updateJdAnalysisRow, appendCandidateEvaluations } from './src/sheetsAdapter.js';

dotenv.config();

/**
 * Process a single Job Description through the complete AI Recruitment Pipeline
 */
export async function processJobDescription(rawJd, roleTitle = 'Software Role', jdId = 'JD_DIRECT') {
  console.log(`\n======================================================`);
  console.log(`🎯 STARTING RECRUITMENT AI PIPELINE FOR: "${roleTitle}"`);
  console.log(`======================================================\n`);

  // Step 1: Groq AI JD Analysis
  console.log('⚡ Step 1: Analyzing Job Description & Extracting Keywords, Do\'s & Don\'ts...');
  const jdAnalysis = await analyzeJobDescription(rawJd, roleTitle);

  console.log(`\n------------------------------------------------------`);
  console.log(`📌 ROLE TITLE: ${jdAnalysis.role_title}`);
  console.log(`------------------------------------------------------`);
  console.log(`📝 SIMPLIFIED SUMMARY:\n${jdAnalysis.simplified_jd}\n`);
  console.log(`🔑 KEYWORDS: ${jdAnalysis.keywords?.join(', ')}`);
  console.log(`✅ KEY SKILLS (Required): ${jdAnalysis.key_skills?.required?.join(', ')}`);
  console.log(`👍 DO'S: ${jdAnalysis.dos_and_donts?.dos?.join(' | ')}`);
  console.log(`👎 DON'TS: ${jdAnalysis.dos_and_donts?.donts?.join(' | ')}`);
  console.log(`❓ SCREENING QUESTIONS:\n - ${jdAnalysis.screening_questions?.join('\n - ')}\n`);
  console.log(`🔎 GOOGLE X-RAY SEARCH QUERY:\n${jdAnalysis.xray_search_query}\n`);
  console.log(`🔗 LINKEDIN BOOLEAN SEARCH STRING:\n${jdAnalysis.boolean_search_string}`);
  console.log(`------------------------------------------------------\n`);

  // Step 2: X-Ray Candidate Discovery
  console.log('⚡ Step 2: Executing Google X-Ray Search for Candidates...');
  const candidates = await searchCandidatesXRay(jdAnalysis.xray_search_query, 5);
  console.log(`Found ${candidates.length} candidate profile matches.\n`);

  // Step 3: Candidate AI Scoring & LinkedIn Note Generation
  console.log('⚡ Step 3: Evaluating Candidates with Groq AI & Drafting Personalized LinkedIn Connection Notes...');
  const evaluatedResults = [];

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    console.log(`\n👥 Evaluating Candidate [${i + 1}/${candidates.length}]: ${candidate.name} (${candidate.company})`);
    
    const evaluation = await evaluateCandidate(candidate, jdAnalysis);
    
    console.log(`   📊 Score: ${evaluation.match_score}% [${evaluation.match_status}]`);
    console.log(`   💡 Logic: ${evaluation.evaluation_logic}`);
    console.log(`   💌 LinkedIn Note: "${evaluation.personalized_linkedin_note}"`);

    evaluatedResults.push({ candidate, evaluation });
  }

  // Step 4: Google Sheets Sync (If SPREADSHEET_ID configured)
  if (process.env.SPREADSHEET_ID) {
    console.log('\n⚡ Step 4: Syncing Insights to Google Sheets...');
    try {
      await appendCandidateEvaluations(jdId, evaluatedResults);
    } catch (err) {
      console.warn(`⚠️ Google Sheets Sync warning: ${err.message}`);
    }
  }

  console.log(`\n✅ RECRUITMENT PIPELINE COMPLETE FOR "${roleTitle}"!`);
  return { jdAnalysis, evaluatedResults };
}

/**
 * Main Engine CLI Entry
 */
async function main() {
  const args = process.argv.slice(2);
  const sampleIndex = args.indexOf('--jd');

  if (sampleIndex !== -1 && args[sampleIndex + 1]) {
    // Run direct CLI JD input
    const rawJd = args[sampleIndex + 1];
    await processJobDescription(rawJd, 'Custom Job');
    return;
  }

  // Otherwise, process pending JDs from Google Sheets if configured
  if (process.env.SPREADSHEET_ID) {
    try {
      const pendingList = await getPendingJds();
      if (pendingList.length === 0) {
        console.log('ℹ️ No pending JDs found in Google Sheets ("🎯 JDs_Analysis"). Running Demo Sample JD...\n');
        await runDemoSample();
        return;
      }

      for (const item of pendingList) {
        const { rowNum, jdId, roleTitle, rawJd } = item;
        const { jdAnalysis, evaluatedResults } = await processJobDescription(rawJd, roleTitle, jdId);
        await updateJdAnalysisRow(rowNum, jdId, roleTitle, rawJd, jdAnalysis);
        await appendCandidateEvaluations(jdId, evaluatedResults);
      }
    } catch (err) {
      console.warn(`⚠️ Google Sheets read error: ${err.message}. Running Demo Sample JD...\n`);
      await runDemoSample();
    }
  } else {
    console.log('💡 SPREADSHEET_ID not set. Running sample demo Job Description...\n');
    await runDemoSample();
  }
}

/**
 * Demo sample JD execution helper
 */
async function runDemoSample() {
  const sampleJd = `
    We are looking for a Senior Node.js & React Developer based in Bengaluru or Remote India.
    Role Overview:
    - 4+ years of professional backend & frontend web development.
    - Deep expertise in Node.js, TypeScript, Express, PostgreSQL, and React.js.
    - Experience designing high-throughput REST APIs and microservices.
    - Cloud deployment experience on AWS (EC2, S3, Docker) is highly preferred.
    - Great communication skills for client interactions.
  `;

  await processJobDescription(sampleJd, 'Senior Node.js & React Developer', 'JD_DEMO_001');
}

// Execute if called directly
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  main().catch(console.error);
}
