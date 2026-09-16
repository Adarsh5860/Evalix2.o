const assert = require('assert');
const { extractVerbs } = require('../utils/verbExtractor');

async function runTests() {
  console.log('Running verbExtractor contextual POS tests...');

  // Test 1: User specification sentence
  const text1 = 'I go on vacation every summer and program my machine.';
  const result1 = await extractVerbs(text1);
  const words1 = result1.map(v => v.word);

  console.log('Test 1 output:', result1);
  assert(words1.includes('go'), 'Should include "go"');
  assert(words1.includes('program'), 'Should include "program"');
  assert(!words1.includes('vacation'), 'Should NOT include "vacation"');
  assert(!words1.includes('summer'), 'Should NOT include "summer"');
  assert(!words1.includes('machine'), 'Should NOT include "machine"');

  // Test 2: Academic & Bloom\'s Taxonomy verbs
  const text2 = 'Students will design, evaluate, and analyze software architecture. This course covers machine learning during the summer session.';
  const result2 = await extractVerbs(text2);
  const words2 = result2.map(v => v.word);

  console.log('Test 2 output:', result2);
  assert(words2.includes('design'), 'Should include "design"');
  assert(words2.includes('evaluate'), 'Should include "evaluate"');
  assert(words2.includes('analyze'), 'Should include "analyze"');
  assert(words2.includes('cover'), 'Should include "cover"');
  assert(!words2.includes('course'), 'Should NOT include "course"');
  assert(!words2.includes('machine'), 'Should NOT include "machine"');
  assert(!words2.includes('summer'), 'Should NOT include "summer"');

  console.log('✅ All verbExtractor contextual POS tests passed successfully!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
