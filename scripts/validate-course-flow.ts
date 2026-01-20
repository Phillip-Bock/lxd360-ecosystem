#!/usr/bin/env tsx
import * as readline from 'node:readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

interface ValidationResult {
  step: string;
  status: 'pass' | 'fail' | 'warning' | 'skip';
  notes?: string;
}

const results: ValidationResult[] = [];

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function recordResult(
  step: string,
  status: 'pass' | 'fail' | 'warning' | 'skip',
  notes?: string,
) {
  results.push({ step, status, notes });

  const emoji = {
    pass: '✅',
    fail: '❌',
    warning: '⚠️',
    skip: '⏭️',
  }[status];

  console.log(`${emoji} ${step}${notes ? `: ${notes}` : ''}`);
}

async function runValidation() {
  console.log(`\n${'='.repeat(80)}`);
  console.log('LXP360 COURSE AUTHORING & PUBLISHING FLOW VALIDATION');
  console.log('='.repeat(80));
  console.log('\nThis script will guide you through manual testing of the complete flow.');
  console.log('Answer each question based on what you observe in the application.\n');

  const baseUrl = await prompt('Enter the application URL (default: http://localhost:3000): ');
  const appUrl = baseUrl || 'http://localhost:3000';

  console.log(`\nTesting against: ${appUrl}\n`);
  console.log('='.repeat(80));

  // Step 1: Create Course
  console.log('\n📝 STEP 1: CREATE NEW COURSE IN INSPIRE STUDIO');
  console.log('1. Navigate to INSPIRE Studio');
  console.log('2. Click "Create Course" or similar button');
  console.log('3. Fill in course details:');
  console.log('   - Title: "E2E Test Course"');
  console.log('   - Description: "Test course for validation"');
  console.log('4. Submit the form\n');

  const step1 = await prompt('Did the course create successfully? (y/n/w for warning): ');
  if (step1.toLowerCase() === 'y') {
    await recordResult('Create new course in INSPIRE Studio', 'pass');
  } else if (step1.toLowerCase() === 'w') {
    const note = await prompt('What warning/issue did you encounter? ');
    await recordResult('Create new course in INSPIRE Studio', 'warning', note);
  } else {
    const note = await prompt('What error did you encounter? ');
    await recordResult('Create new course in INSPIRE Studio', 'fail', note);
  }

  // Step 2: Add Modules
  console.log('\n📚 STEP 2: ADD MODULES TO COURSE');
  console.log('1. In the course editor, find "Add Module" button');
  console.log('2. Create a module with:');
  console.log('   - Title: "Introduction"');
  console.log('   - Description: "Getting started"');
  console.log('3. Save the module\n');

  const step2 = await prompt('Were you able to add modules? (y/n/w): ');
  if (step2.toLowerCase() === 'y') {
    await recordResult('Add modules to course', 'pass');
  } else if (step2.toLowerCase() === 'w') {
    const note = await prompt('What issue? ');
    await recordResult('Add modules to course', 'warning', note);
  } else {
    const note = await prompt('What blocker? ');
    await recordResult('Add modules to course', 'fail', note);
  }

  // Step 3: Add Lessons
  console.log('\n📖 STEP 3: ADD LESSONS TO MODULE');
  console.log('1. Within the module, click "Add Lesson"');
  console.log('2. Create a lesson:');
  console.log('   - Title: "First Lesson"');
  console.log('   - Content: Basic text content');
  console.log('3. Save the lesson\n');

  const step3 = await prompt('Were you able to add lessons to modules? (y/n/w): ');
  if (step3.toLowerCase() === 'y') {
    await recordResult('Add lessons to module', 'pass');
  } else if (step3.toLowerCase() === 'w') {
    const note = await prompt('What issue? ');
    await recordResult('Add lessons to module', 'warning', note);
  } else {
    const note = await prompt('What blocker? ');
    await recordResult('Add lessons to module', 'fail', note);
  }

  // Step 4: Add Content Blocks
  console.log('\n🎨 STEP 4: ADD CONTENT BLOCKS TO LESSON');
  console.log('Try adding the following content block types:');

  const blockTypes = [
    'Text Block',
    'Video Block',
    'Image Block',
    'Interactive Block',
    '3D Model Block',
    'Assessment/Quiz Block',
  ];

  for (const blockType of blockTypes) {
    const answer = await prompt(`  - ${blockType}: Can you add it? (y/n/s for skip): `);
    if (answer.toLowerCase() === 'y') {
      await recordResult(`Add ${blockType}`, 'pass');
    } else if (answer.toLowerCase() === 's') {
      await recordResult(`Add ${blockType}`, 'skip', 'Skipped by user');
    } else {
      const note = await prompt('    What issue? ');
      await recordResult(`Add ${blockType}`, 'fail', note);
    }
  }

  // Step 5: Add Assessment
  console.log('\n📝 STEP 5: ADD ASSESSMENT TO COURSE');
  console.log('1. Navigate to assessments section');
  console.log('2. Create a quiz/assessment');
  console.log('3. Add questions (multiple choice, true/false, etc.)\n');

  const step5 = await prompt('Were you able to add assessments? (y/n/w): ');
  if (step5.toLowerCase() === 'y') {
    await recordResult('Add assessments to course', 'pass');
  } else if (step5.toLowerCase() === 'w') {
    const note = await prompt('What issue? ');
    await recordResult('Add assessments to course', 'warning', note);
  } else {
    const note = await prompt('What blocker? ');
    await recordResult('Add assessments to course', 'fail', note);
  }

  // Step 6: Preview Course
  console.log('\n👁️  STEP 6: PREVIEW COURSE');
  console.log('1. Click "Preview" button in course editor');
  console.log('2. Verify all content displays correctly');
  console.log('3. Test navigation between lessons\n');

  const step6 = await prompt('Is the preview feature working? (y/n/w): ');
  if (step6.toLowerCase() === 'y') {
    await recordResult('Preview course', 'pass');
  } else if (step6.toLowerCase() === 'w') {
    const note = await prompt('What issue? ');
    await recordResult('Preview course', 'warning', note);
  } else {
    const note = await prompt('What blocker? ');
    await recordResult('Preview course', 'fail', note);
  }

  // Step 7: Publish Course
  console.log('\n🚀 STEP 7: PUBLISH COURSE TO LXP360');
  console.log('1. Click "Publish" button');
  console.log('2. Confirm publication');
  console.log('3. Verify status changes to "Published"\n');

  const step7 = await prompt('Were you able to publish the course? (y/n/w): ');
  if (step7.toLowerCase() === 'y') {
    await recordResult('Publish course to LXP360', 'pass');
  } else if (step7.toLowerCase() === 'w') {
    const note = await prompt('What issue? ');
    await recordResult('Publish course to LXP360', 'warning', note);
  } else {
    const note = await prompt('What blocker? ');
    await recordResult('Publish course to LXP360', 'fail', note);
    console.log('\n⚠️  Cannot continue without published course. Skipping remaining steps.');
    await generateReport();
    return;
  }

  // Step 8: Verify in Learner View
  console.log('\n👤 STEP 8: VERIFY COURSE IN LEARNER VIEW');
  console.log('1. Switch to learner role or use different browser/incognito');
  console.log('2. Navigate to course catalog');
  console.log('3. Search for your test course');
  console.log('4. Verify it appears in results\n');

  const step8 = await prompt('Is the course visible to learners? (y/n/w): ');
  if (step8.toLowerCase() === 'y') {
    await recordResult('Verify course appears in learner view', 'pass');
  } else if (step8.toLowerCase() === 'w') {
    const note = await prompt('What issue? ');
    await recordResult('Verify course appears in learner view', 'warning', note);
  } else {
    const note = await prompt('What blocker? ');
    await recordResult('Verify course appears in learner view', 'fail', note);
  }

  // Step 9: Enroll User
  console.log('\n✍️  STEP 9: ENROLL TEST USER');
  console.log('1. As a learner, click on the course');
  console.log('2. Click "Enroll" or "Start Learning"');
  console.log('3. Verify enrollment confirmation\n');

  const step9 = await prompt('Were you able to enroll? (y/n/w): ');
  if (step9.toLowerCase() === 'y') {
    await recordResult('Enroll test user', 'pass');
  } else if (step9.toLowerCase() === 'w') {
    const note = await prompt('What issue? ');
    await recordResult('Enroll test user', 'warning', note);
  } else {
    const note = await prompt('What blocker? ');
    await recordResult('Enroll test user', 'fail', note);
  }

  // Step 10: Complete Course
  console.log('\n🎯 STEP 10: COMPLETE COURSE AS LEARNER');
  console.log('1. Navigate through lessons');
  console.log('2. View different content blocks');
  console.log('3. Complete assessments');
  console.log('4. Mark lessons as complete');
  console.log('5. Reach 100% completion\n');

  const step10 = await prompt('Were you able to complete the course? (y/n/w): ');
  if (step10.toLowerCase() === 'y') {
    await recordResult('Complete course as learner', 'pass');
  } else if (step10.toLowerCase() === 'w') {
    const note = await prompt('What issue? ');
    await recordResult('Complete course as learner', 'warning', note);
  } else {
    const note = await prompt('What blocker? ');
    await recordResult('Complete course as learner', 'fail', note);
  }

  // Step 11: xAPI Tracking
  console.log('\n📊 STEP 11: VERIFY xAPI/LRS TRACKING');
  console.log('1. Navigate to analytics/reports dashboard');
  console.log('2. Look for learner progress data');
  console.log('3. Verify xAPI statements are being recorded');
  console.log('4. Check for completion tracking\n');

  const step11 = await prompt('Is xAPI tracking working correctly? (y/n/w): ');
  if (step11.toLowerCase() === 'y') {
    await recordResult('Verify xAPI/LRS tracking', 'pass');
  } else if (step11.toLowerCase() === 'w') {
    const note = await prompt('What issue? ');
    await recordResult('Verify xAPI/LRS tracking', 'warning', note);
  } else {
    const note = await prompt('What blocker? ');
    await recordResult('Verify xAPI/LRS tracking', 'fail', note);
  }

  // Step 12: Certificate
  console.log('\n🎓 STEP 12: VERIFY CERTIFICATE GENERATION');
  console.log('1. After course completion, look for certificate');
  console.log('2. Click "View Certificate" or similar');
  console.log('3. Verify certificate displays correctly');
  console.log('4. Test download/share functionality\n');

  const step12 = await prompt('Is certificate generation working? (y/n/w): ');
  if (step12.toLowerCase() === 'y') {
    await recordResult('Verify certificate generation', 'pass');
  } else if (step12.toLowerCase() === 'w') {
    const note = await prompt('What issue? ');
    await recordResult('Verify certificate generation', 'warning', note);
  } else {
    const note = await prompt('What blocker? ');
    await recordResult('Verify certificate generation', 'fail', note);
  }

  await generateReport();
}

async function generateReport() {
  console.log(`\n${'='.repeat(80)}`);
  console.log('VALIDATION REPORT');
  console.log('='.repeat(80));

  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const warnings = results.filter((r) => r.status === 'warning').length;
  const skipped = results.filter((r) => r.status === 'skip').length;

  console.log(`\nSummary:`);
  console.log(`  ✅ Passed:   ${passed}`);
  console.log(`  ❌ Failed:   ${failed}`);
  console.log(`  ⚠️  Warnings: ${warnings}`);
  console.log(`  ⏭️  Skipped:  ${skipped}`);
  console.log(`  📊 Total:    ${results.length}`);

  console.log(`\n${'-'.repeat(80)}`);
  console.log('Detailed Results:');
  console.log('-'.repeat(80));

  for (const result of results) {
    const emoji = {
      pass: '✅',
      fail: '❌',
      warning: '⚠️',
      skip: '⏭️',
    }[result.status];

    console.log(`${emoji} ${result.step}`);
    if (result.notes) {
      console.log(`   → ${result.notes}`);
    }
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log('BLOCKERS & ISSUES');
  console.log('='.repeat(80));

  const blockers = results.filter((r) => r.status === 'fail');
  if (blockers.length > 0) {
    console.log('\n❌ Critical Blockers:');
    blockers.forEach((b, i) => {
      console.log(`${i + 1}. ${b.step}`);
      if (b.notes) console.log(`   → ${b.notes}`);
    });
  } else {
    console.log('\n✅ No critical blockers found!');
  }

  const issues = results.filter((r) => r.status === 'warning');
  if (issues.length > 0) {
    console.log('\n⚠️  Warnings/Issues:');
    issues.forEach((w, i) => {
      console.log(`${i + 1}. ${w.step}`);
      if (w.notes) console.log(`   → ${w.notes}`);
    });
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log('RECOMMENDATIONS');
  console.log('='.repeat(80));

  if (failed > 0) {
    console.log('\n🔴 CRITICAL: Address all failed items before production release');
    console.log('   - These represent broken functionality in the core flow');
    console.log('   - Each blocker prevents users from completing the workflow');
  }

  if (warnings > 0) {
    console.log('\n🟡 IMPORTANT: Review and address warnings');
    console.log('   - These may impact user experience');
    console.log('   - Consider UX improvements for better usability');
  }

  const totalTested = results.length - skipped;
  if (passed === totalTested && warnings === 0) {
    console.log('\n🎉 EXCELLENT: All tested features are working perfectly!');
    console.log('   - The complete course authoring flow is functional');
    console.log('   - Ready for further testing and refinement');
  } else if (passed === totalTested && warnings > 0) {
    console.log('\n✅ GOOD: All tests passed, but there are some warnings');
    console.log('   - Core functionality is working');
    console.log('   - Review warnings for potential improvements');
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`Report generated: ${new Date().toISOString()}`);
  console.log(`${'='.repeat(80)}\n`);

  rl.close();
}

// Run the validation
runValidation().catch((error) => {
  console.error('Error during validation:', error);
  rl.close();
  process.exit(1);
});
