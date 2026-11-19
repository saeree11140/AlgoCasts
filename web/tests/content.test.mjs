import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const content = new URL('../public/content/', import.meta.url);
const manifest = JSON.parse(fs.readFileSync(new URL('manifest.json', content)));
test('all source categories imported without losing files', () => {
  assert.equal(manifest.problems.filter(p=>p.source==='AlgoCasts').length, 28);
  assert.equal(manifest.problems.filter(p=>p.source==='LeetCode').length, 8);
  assert.equal(manifest.problems.filter(p=>p.source==='HackerRank').length, 3);
  assert.equal(manifest.problems.length, 46);
  assert.equal(manifest.competencies.length, 27);
  assert.ok(manifest.diagrams.length > 100);
  for (const d of manifest.diagrams) {
    const svg = fs.readFileSync(new URL(d.path, content),'utf8');
    assert.match(svg, /<svg/);
    assert.doesNotMatch(svg, /<script|<foreignObject|onload=/);
  }
});
test('problem details contain genuine tests and clean starter separate from solution', () => {
  for (const p of manifest.problems) {
    const d = JSON.parse(fs.readFileSync(new URL(`problems/${p.id}.json`, content)));
    assert.notEqual(d.starter, d.solution);
    assert.match(d.starter, /TODO/);
    assert.ok(d.modules['./test']);
  }
});

test('Container lesson is complete and available from competency navigation', () => {
  const topic = manifest.competencies.find(item => item.id === 'container');
  assert.ok(topic, 'Container must appear in the competency manifest');
  assert.equal(topic.title, 'Container');
  assert.equal(topic.path, 'documents/container.html');
  assert.ok(topic.sections.includes('ระดับ Beginner'));
  assert.ok(topic.sections.includes('ระดับ Intermediate'));
  const html = fs.readFileSync(new URL(topic.path, content), 'utf8');
  const source = fs.readFileSync(new URL('../../competency/Container/container-review.html', import.meta.url), 'utf8');
  assert.equal(html, source, 'Preserve all original lesson and quiz content');
});

for (const [id, title, source, firstSection, sectionCount] of [
  ['coding-skill', 'Coding Skill', 'Coding Skill/coding-skill-review.html', 'Coding ในหน้านี้ครอบคลุมอะไรบ้าง', 8],
  ['cloud', 'Cloud', 'Cloud/cloud-skill-review.html', 'Cloud models, service types และประโยชน์ที่ข้อสอบชอบถาม', 15],
  ['ci-cd', 'CI/CD', 'CICD/ci-cd-review.html', 'ระดับ Beginner', 6],
  ['application-security', 'Application Security', 'Application Security/application-security-review.html', 'ระดับ Beginner', 7],
  ['ai-prompt-engineering', 'AI & Prompt Engineering', 'AI & Prompt engineer/ai-prompt-engineering-review.html', 'ระดับ Beginner', 8],
  ['mock-exam', 'Mock Exam ข้อสอบจำลองข้อเขียน', 'Mock Exam/mock-exam-q55-q57-v2.html', 'รู้จักหน้าจอสอบจริงก่อนเริ่ม', 4],
  ['mock-exam-intermediate', 'Mock Exam ชุดกลาง (Intermediate)', 'Mock Exam Keng Wee/dev-practice (Intermediate).html', 'Microservices', 17],
  ['mock-exam-advance', 'Mock Exam ชุดยาก (Advance)', 'Mock Exam Keng Wee/dev-practice (advance).html', 'Microservices', 17],
  ['mock-exam-sql-coding', 'Mock Exam SQL Coding 10 ข้อ', 'Mock Exam Keng Wee/sql-coding-10.html', 'เริ่มฝึก', 12],
  ['mock-exam-prompt-engineering', 'Mock Exam Prompt Engineering 10 ข้อ', 'Mock Exam Keng Wee/prompt-engineering-10.html', 'วิธีใช้', 13],
  ['mock-exam-kk', 'Mock Exam ชุดเก็ง 2026 (Intermediate + Advance)', 'Mock Exam Keng KK/exam-choice.html', 'Microservices', 17],
  ['mock-exam-thitima-architecture', 'Mock Exam ชุดซ้อม · Software Design & Architecture', 'Mock Exam Thitima/architecture 1.html', 'Microservices', 3],
  ['mock-exam-thitima-engineering', 'Mock Exam ชุดซ้อม · Software Engineering & Development', 'Mock Exam Thitima/engineering 1.html', 'Git', 6],
  ['mock-exam-thitima-infrastructure', 'Mock Exam ชุดซ้อม · Infrastructure & DevOps', 'Mock Exam Thitima/infrastructure 1.html', 'Container', 3],
  ['mock-exam-thitima-security', 'Mock Exam ชุดซ้อม · Security', 'Mock Exam Thitima/security 1.html', 'Application Security', 6],
  ['mock-exam-thitima-problem-solving', 'Mock Exam ชุดซ้อม · Problem Solving & AI', 'Mock Exam Thitima/problem-solving 1.html', 'Program Coding', 3],
  ['mock-exam-anchanat', 'Mock Exam คลังข้อสอบ 600 ข้อ (L1–L3)', 'Mock Exam Anchanat/developer-competency-600.html', 'Microservices', 17],
]) {
  test(`${title} lesson is complete and available from competency navigation`, () => {
    const topic = manifest.competencies.find(item => item.id === id);
    assert.ok(topic, `${title} must appear in the competency manifest`);
    assert.equal(topic.title, title);
    assert.equal(topic.path, `documents/${id}.html`);
    assert.equal(topic.sections[0], firstSection);
    assert.equal(topic.sections.length, sectionCount);
    const html = fs.readFileSync(new URL(topic.path, content), 'utf8');
    const original = fs.readFileSync(new URL(`../../competency/${source}`, import.meta.url), 'utf8');
    assert.equal(html, original, 'Preserve all original lesson and quiz content');
  });
}

test('Coding Skill worker permissions stay confined to an opaque document sandbox', () => {
  const config = fs.readFileSync(new URL('../deploy/nginx.conf', import.meta.url), 'utf8');
  const block = config.match(/location = \/content\/documents\/coding-skill\.html\s*\{([\s\S]*?)\n\s*\}/)?.[1];
  assert.ok(block, 'Coding Lab needs a dedicated document policy');
  const policy = block.match(/Content-Security-Policy \"([^\"]+)\"/)?.[1];
  assert.ok(policy);
  assert.match(policy, /worker-src blob:/);
  assert.match(policy, /script-src[^;]*'unsafe-eval'/);
  assert.match(policy, /(?:^|;)\s*sandbox allow-scripts/);
  assert.doesNotMatch(policy, /allow-same-origin/);
  assert.match(policy, /connect-src 'none'/);
});

test('Sorting diagrams follow draw.io layering and keep free text readable', () => {
  const svg = id => fs.readFileSync(new URL(`diagrams/${id}.svg`, content), 'utf8');
  const labels = id => [...svg(id).matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)].map(m => m[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
  // "10" sits under the "If the incoming array..." box in the source; its label must stay hidden.
  assert.ok(!labels('10-04').includes('10'));
  for (const id of ['10-05', '10-06']) {
    assert.ok(labels(id).some(text => text.includes('mergeSort')), `${id} keeps "mergeSort" whole`);
    for (const size of svg(id).matchAll(/data-kind="text"[^>]*font-size="([\d.]+)"/g)) assert.ok(Number(size[1]) >= 11);
  }
  assert.match(svg('03-01'), /O\(n²\)/);
  assert.doesNotMatch(svg('03-01'), /&lt;sup/);
});

test('Searching guide has diagrams, Thai notes, a lab and links to every searching problem', async () => {
  assert.equal(manifest.diagramGroups['11'], 'Searching');
  const diagrams = manifest.diagrams.filter(d => d.group === '11');
  assert.equal(diagrams.length, 12);
  const source = fs.readFileSync(new URL('../src/guide-content.ts', import.meta.url), 'utf8');
  for (const d of diagrams) assert.match(source, new RegExp(`'${d.id}': \\{ title:`), `${d.id} needs a Thai note`);
  assert.match(fs.readFileSync(new URL('../src/labs/index.ts', import.meta.url), 'utf8'), /'11': searchingLab/);
  const searching = manifest.problems.filter(p => p.category === 'Searching');
  assert.equal(searching.length, 14);
  for (const p of searching) {
    const detail = JSON.parse(fs.readFileSync(new URL(`problems/${p.id}.json`, content)));
    assert.equal(detail.guideGroup, '11', p.id);
    assert.match(source, new RegExp(`'${p.id}'`), `${p.id} is listed in the Searching guide`);
  }
});

test('Anchanat 600-question bank keeps every question answerable', () => {
  const html = fs.readFileSync(new URL('documents/mock-exam-anchanat.html', content), 'utf8');
  const bank = JSON.parse(html.match(/<script type="application\/json" id="question-bank">([\s\S]*?)<\/script>/)[1]);
  const questions = bank.competencies.flatMap(c => c.questions);
  assert.equal(questions.length, 600);
  assert.equal(new Set(questions.map(q => q.id)).size, 600);
  for (const q of questions) {
    assert.equal(q.choices.length, 4, q.id);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4, q.id);
    assert.ok([1, 2, 3].includes(q.level), q.id);
    assert.ok(q.explanation && !/เฉลยข้อ\s*[A-D]/.test(q.explanation), `${q.id} explanation must not name a choice letter (choices are shuffled)`);
  }
});
