/**
 * 🚀 AI RECRUITMENT BOT - SHEET BUILDER
 * Builds dedicated Google Sheets schema for Job Description Analysis,
 * Google X-Ray Candidate Sourcing, and AI Fit Evaluation.
 */
function createRecruitmentSystem() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const schema = {
    '📖 Setup_Guide': {
      color: '#0F172A', // Dark Slate
      headers: ['Section / Step', 'Instructions & Workflow Rules', 'Important Notes'],
      sampleData: [
        ['1. Add Job Description', 'Paste raw JD in "🎯 JDs_Analysis" under Raw_JD column. Set Status to PENDING.', 'Leave other columns blank; recruiter.mjs will populate them automatically.'],
        ['2. Run AI Engine', 'Execute `node recruiter.mjs` on your server/terminal.', 'Groq AI simplifies JD, extracts keywords, and generates X-Ray & Boolean queries.'],
        ['3. Candidate Sourcing', 'The bot runs Google X-Ray search to discover candidate profiles matching the role.', 'Discovered profiles are evaluated by Groq AI and pushed to "👥 Candidate_Pool".'],
        ['4. Review & Outreach', 'Check "👥 Candidate_Pool" for Match Score %, Evaluation Logic, and Personalized LinkedIn Connection Notes.', 'Use the tailored notes for instant outreach on LinkedIn!']
      ]
    },
    '🎯 JDs_Analysis': {
      color: '#7C3AED', // Deep Purple
      headers: [
        'JD_ID', 'Role_Title', 'Raw_JD', 'Simplified_JD', 'Keywords', 
        'Key_Skills', 'Dos_And_Donts', 'Screening_Questions', 
        'XRay_Query', 'Boolean_String', 'Status', 'Processed_Time'
      ],
      sampleData: [
        [
          'JD_101', 
          'Senior Full Stack Developer', 
          'We are looking for a Senior Node.js & React developer with 4+ years of experience in Bengaluru...', 
          'Core Full Stack engineering role leading microservices and React interfaces for high-scale applications.', 
          'Node.js, React, TypeScript, PostgreSQL, AWS', 
          'Node.js, React, TypeScript, Express, PostgreSQL', 
          'DO: 4+ yrs experience, Strong Node.js | DONT: Freshers, Pure frontend devs', 
          '1. How do you optimize Node.js event loop under heavy traffic?\n2. Describe your experience with React state management.\n3. How do you design PostgreSQL indexes?', 
          'site:linkedin.com/in/ "Full Stack Developer" "Node.js" "React" "Bengaluru"', 
          '("Full Stack" OR "Backend Developer") AND ("Node.js" OR "TypeScript") AND ("Bengaluru")', 
          'PROCESSED', 
          new Date().toLocaleString()
        ]
      ]
    },
    '👥 Candidate_Pool': {
      color: '#059669', // Emerald Green
      headers: [
        'JD_ID', 'Candidate_Name', 'Headline', 'Company', 'Location', 
        'Profile_URL', 'Match_Score', 'Match_Status', 'Evaluation_Logic', 
        'Key_Skill_Gaps', 'Personalized_LinkedIn_Note', 'Outreach_Status', 'Processed_Time'
      ],
      sampleData: [
        [
          'JD_101', 
          'Rohan Sharma', 
          'Senior Full Stack Engineer @ TechCorp | Node.js, React, AWS, Microservices', 
          'TechCorp', 
          'Bengaluru, India', 
          'https://www.linkedin.com/in/sample-profile', 
          '85%', 
          'HIGH_MATCH', 
          'Strong 5+ years background in Node.js, React, and microservices matching all required JD skills.', 
          'None identified', 
          'Hi Rohan, noticed your strong Node.js & React work at TechCorp. We are expanding our engineering team for Senior Full Stack roles in Bengaluru. Would love to connect!', 
          'READY_FOR_OUTREACH', 
          new Date().toLocaleString()
        ]
      ]
    },
    '⚙️ Settings': {
      color: '#4B5563', // Steel Gray
      headers: ['Setting_Key', 'Setting_Value', 'Description'],
      sampleData: [
        ['groq_model', 'qwen/qwen3.6-27b', 'Groq AI model for JD analysis & candidate evaluation'],
        ['max_xray_candidates_per_jd', '10', 'Number of X-Ray candidate profiles to search per JD'],
        ['min_match_score_threshold', '60%', 'Minimum match score to include candidates in outreach pool'],
        ['default_location_filter', 'Bengaluru, India', 'Default target location for X-Ray search queries']
      ]
    }
  };

  Object.keys(schema).forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    } else {
      sheet.clear();
    }

    const { headers, sampleData, color } = schema[sheetName];

    // Set Header Formatting
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    headerRange.setFontWeight('bold');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setBackground(color);
    headerRange.setHorizontalAlignment('center');

    // Add Sample Data
    if (sampleData.length > 0) {
      sheet.getRange(2, 1, sampleData.length, sampleData[0].length).setValues(sampleData);
    }

    sheet.setFrozenRows(1);
    for (let c = 1; c <= headers.length; c++) {
      sheet.autoResizeColumn(c);
    }
  });

  // Remove default unused Sheet1
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  ss.getSheetByName('🎯 JDs_Analysis').activate();
  SpreadsheetApp.getUi().alert('✅ AI Recruitment Sheet created! Tabs: Setup_Guide, JDs_Analysis, Candidate_Pool, Settings.');
}

/**
 * Adds custom Apps Script menu for 1-click sheet setup
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('⚡ Recruitment AI')
    .addItem('🛠️ Rebuild / Reset Recruitment Sheets', 'createRecruitmentSystem')
    .addToUi();
}
