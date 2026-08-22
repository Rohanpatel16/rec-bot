import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

/**
 * Obtain Google Sheets v4 API instance using Service Account Credentials
 */
export async function getSheetsInstance() {
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!credentialsJson) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON in environment variables.');
  }

  const credentials = JSON.parse(credentialsJson);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

/**
 * Fetch all unanalyzed rows from "🎯 JDs_Analysis" sheet tab
 */
export async function getPendingJds() {
  if (!SPREADSHEET_ID) {
    console.warn('⚠️ SPREADSHEET_ID is not configured.');
    return [];
  }

  const sheets = await getSheetsInstance();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "'🎯 JDs_Analysis'!A:Z",
  });

  const [headers, ...rows] = res.data.values || [];
  if (!headers || rows.length === 0) return [];

  const col = Object.fromEntries(headers.map((h, i) => [h.trim(), i]));

  const pendingList = [];
  rows.forEach((row, idx) => {
    const jdId = row[col['JD_ID']] || `JD_${idx + 1}`;
    const roleTitle = row[col['Role_Title']] || '';
    const rawJd = row[col['Raw_JD']] || '';
    const status = (row[col['Status']] || '').trim().toUpperCase();

    if (rawJd && status !== 'PROCESSED' && status !== 'COMPLETED') {
      pendingList.push({
        rowIndex: idx,
        rowNum: idx + 2,
        jdId,
        roleTitle,
        rawJd,
      });
    }
  });

  return pendingList;
}

/**
 * Update JD row in "🎯 JDs_Analysis" with analyzed insights
 */
export async function updateJdAnalysisRow(rowNum, jdId, roleTitle, rawJd, analysis) {
  if (!SPREADSHEET_ID) return;

  const sheets = await getSheetsInstance();
  const nowTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const values = [
    [
      jdId,
      roleTitle || analysis.role_title,
      rawJd,
      analysis.simplified_jd,
      (analysis.keywords || []).join(', '),
      (analysis.key_skills?.required || []).join(', '),
      (analysis.dos_and_donts?.dos || []).join(' | '),
      (analysis.screening_questions || []).join('\n'),
      analysis.xray_search_query,
      analysis.boolean_search_string,
      'PROCESSED',
      nowTime,
    ],
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `'🎯 JDs_Analysis'!A${rowNum}:L${rowNum}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });

  console.log(`✅ Updated Sheet "🎯 JDs_Analysis" row ${rowNum} for ${jdId}`);
}

/**
 * Append evaluated candidates to "👥 Candidate_Pool" sheet tab
 */
export async function appendCandidateEvaluations(jdId, candidateResults) {
  if (!SPREADSHEET_ID || !candidateResults || candidateResults.length === 0) return;

  const sheets = await getSheetsInstance();
  const nowTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const rowsToAppend = candidateResults.map(({ candidate, evaluation }) => [
    jdId,
    candidate.name,
    candidate.headline,
    candidate.company,
    candidate.location,
    candidate.profileUrl,
    `${evaluation.match_score}%`,
    evaluation.match_status,
    evaluation.evaluation_logic,
    (evaluation.skill_gaps_or_flags || []).join(', '),
    evaluation.personalized_linkedin_note,
    'READY_FOR_OUTREACH',
    nowTime,
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "'👥 Candidate_Pool'!A:M",
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: rowsToAppend },
  });

  console.log(`🚀 Appended ${rowsToAppend.length} evaluated candidates to "👥 Candidate_Pool" tab.`);
}
