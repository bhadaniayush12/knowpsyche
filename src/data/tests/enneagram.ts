// Copy from docs/content/part-1.md, "Test 2 — Enneagram". Word for word.
// Lines marked "drafted" were missing from the content doc and approved in the build plan.
import type { Faq, Source } from '../shared';

export type TypeNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const page = {
  // Drafted: em dash removed.
  title: 'Free Enneagram Test: All 9 Scores, No Email Needed',
  description:
    'Find your Enneagram type in about 8 minutes. 45 questions, every score shown free, plus your wing and what your type means in plain English.',
  h1: 'Free Enneagram test',
  intro:
    // Drafted: em dash removed.
    "Rate how true each statement is for you. Go with your first instinct. Think about how you usually are, not how you'd like to be.",
  crumb: 'Enneagram',
  // Drafted.
  eyebrow: 'Test / 02 · Personality · 8 min',
  metaLine: 'About 8 minutes · 45 statements · Saved only if you choose',
};

/** Answer scale, values 1–5. */
export const scale = ['Not like me', 'A little', 'Somewhat', 'Mostly', 'Very much like me'];

/** Shown once this many statements are answered. */
export const milestones: { at: number; text: string }[] = [
  { at: 15, text: 'A third done. Your answers are starting to form a pattern.' },
  { at: 30, text: 'Two thirds done. Your top types are taking shape.' },
  // Drafted: em dash removed.
  { at: 40, text: 'Almost there, 5 to go.' },
];

/** The 45 statements, in the order shown. `type` is hidden from users and used only for scoring. */
export const statements: { text: string; type: TypeNumber }[] = [
  { text: "I notice mistakes quickly, even when others don't.", type: 1 },
  { text: 'I often know what people need before they ask.', type: 2 },
  { text: 'I set goals and push hard to reach them.', type: 3 },
  { text: 'I often feel different from the people around me.', type: 4 },
  { text: 'I need plenty of time alone to recharge.', type: 5 },
  { text: 'I often think about what could go wrong.', type: 6 },
  { text: 'I love having lots of options and new experiences.', type: 7 },
  { text: 'I say what I think, even if it causes conflict.', type: 8 },
  { text: 'I go along with others to keep the peace.', type: 9 },
  { text: "I feel uneasy when things aren't done the right way.", type: 1 },
  { text: "I feel good about myself when I'm helping someone.", type: 2 },
  { text: 'I care about how successful I look to others.', type: 3 },
  { text: "I'm drawn to deep feelings, even sad ones.", type: 4 },
  { text: 'I like to fully understand something before I act.', type: 5 },
  { text: 'Loyalty and trust matter enormously to me.', type: 6 },
  { text: 'I get bored easily with routine.', type: 7 },
  { text: "I don't like being controlled by others.", type: 8 },
  { text: 'I find it hard to know what I want when others have strong opinions.', type: 9 },
  { text: 'I hold myself to high standards and feel bad when I fall short.', type: 1 },
  { text: 'I find it easier to give support than to ask for it.', type: 2 },
  { text: 'I adjust how I come across to impress different people.', type: 3 },
  { text: 'Expressing who I really am is very important to me.', type: 4 },
  { text: 'I protect my time and energy rather than overcommit.', type: 5 },
  { text: 'I like having a backup plan.', type: 6 },
  { text: 'When something hurts, I prefer to focus on the bright side.', type: 7 },
  { text: 'I naturally take charge when no one else does.', type: 8 },
  { text: 'I avoid conflict whenever I can.', type: 9 },
  { text: 'I often think about how things could be improved.', type: 1 },
  { text: "I sometimes say yes to people even when I'm already stretched.", type: 2 },
  { text: "I feel restless when I'm not making progress.", type: 3 },
  { text: 'I sometimes feel something is missing that others seem to have.', type: 4 },
  { text: "I'd rather observe a situation than jump into it.", type: 5 },
  { text: 'I sometimes doubt my decisions and look for reassurance.', type: 6 },
  { text: "I'm usually planning the next fun thing.", type: 7 },
  { text: 'I stand up for people who are treated unfairly.', type: 8 },
  { text: 'People often find me calm and easy to be around.', type: 9 },
  { text: "It's hard for me to relax until a job is done properly.", type: 1 },
  { text: 'Being appreciated by people I care about matters a lot to me.', type: 2 },
  { text: 'I measure my worth by what I achieve.', type: 3 },
  { text: "I'd rather be authentic than fit in.", type: 4 },
  { text: 'I enjoy diving deep into topics that interest me.', type: 5 },
  { text: "I'm quick to notice when someone might not be trustworthy.", type: 6 },
  { text: 'I find it hard to stay with one thing for long.', type: 7 },
  { text: "Showing vulnerability doesn't come easily to me.", type: 8 },
  { text: 'I put off important things by doing small, easy tasks.', type: 9 },
];

export interface EnneagramType {
  n: TypeNumber;
  name: string;
  desire: string;
  fear: string;
  strengths: string;
  stress: string;
  tip: string;
  /** "At your best you're …" — the strengths column, lower-cased for the template (Type 1 reworded, approved). */
  best: string;
  /** Core drive sentence. Drafted. */
  drive: string;
  /** Strength that over-fires (tone rule). Drafted, except Type 6 (content doc). */
  overfire: string;
}

export const types: EnneagramType[] = [
  {
    n: 1, name: 'The Ethical Architect', desire: 'To be good and do things right', fear: 'Being flawed or wrong',
    strengths: 'Fair, reliable, high standards', stress: 'Harsh self-criticism', tip: 'Notice one thing that\'s "good enough" today',
    best: 'fair, reliable and you hold high standards',
    // Drafted: removed comparison wording.
    drive: 'You want to do things right, and being wrong or flawed matters a lot to you.',
    overfire: 'Your eye for what could be better keeps your standards high. Under stress, it can turn on you as harsh self-criticism.',
  },
  {
    n: 2, name: 'The Intuitive Caregiver', desire: 'To be loved and needed', fear: 'Being unwanted',
    strengths: 'Warm, generous, tuned in to others', stress: 'Overgiving, then resentment', tip: 'Ask for one small favour this week',
    best: 'warm, generous, tuned in to others',
    drive: 'You want to be loved and needed, so you put a lot into the people around you.',
    overfire: "You notice what people need and step in to help. Under stress, you can give too much, then feel resentful when it isn't returned.",
  },
  {
    n: 3, name: 'The Driven Achiever', desire: 'To be valuable and admired', fear: 'Being worthless',
    strengths: 'Driven, efficient, inspiring', stress: 'Tying worth to results', tip: 'Do one thing just for enjoyment',
    best: 'driven, efficient, inspiring',
    drive: 'You want to be valuable and admired, and you work hard to show it.',
    overfire: "Your drive gets things done and inspires others. Under stress, you can start to feel you're only worth what you achieve.",
  },
  {
    n: 4, name: 'The Authentic Depth-Seeker', desire: 'To be truly themselves', fear: 'Having no identity',
    strengths: 'Creative, honest, emotionally deep', stress: 'Comparing and withdrawing', tip: 'List three things you already have that matter',
    best: 'creative, honest, emotionally deep',
    drive: 'You want to be truly yourself, and you look for what makes you different.',
    overfire: "You feel things deeply and notice what's real. Under stress, that can turn into comparing yourself with others and pulling back.",
  },
  {
    n: 5, name: 'The Analytical Observer', desire: 'To be capable and understand', fear: 'Being overwhelmed or useless',
    strengths: 'Curious, calm, insightful', stress: 'Pulling away from people', tip: 'Share one idea before it feels finished',
    best: 'curious, calm, insightful',
    drive: 'You want to understand how things work, so you can feel capable on your own.',
    overfire: 'Your calm, curious mind sees what others miss. Under stress, you can pull away from people to protect your energy.',
  },
  {
    n: 6, name: 'The Vigilant Guardian', desire: 'To feel safe and supported', fear: 'Being without support',
    strengths: 'Loyal, prepared, protective', stress: 'Worry and second-guessing', tip: 'Write the worry down, then the likeliest outcome',
    best: 'loyal, prepared, protective',
    drive: 'You want to feel safe and supported, so you plan for what could go wrong.',
    overfire: 'Your mind is good at spotting risks to protect the people you care about. Under stress, that alarm can go off too often.',
  },
  {
    n: 7, name: 'The Visionary Explorer', desire: 'To be free and satisfied', fear: 'Being trapped or deprived',
    strengths: 'Optimistic, adventurous, quick', stress: 'Avoiding hard feelings', tip: 'Stay with one task for 25 minutes',
    best: 'optimistic, adventurous, quick',
    drive: 'You want freedom and new experiences, and you hate feeling boxed in.',
    overfire: "Your optimism keeps you moving and open to new ideas. Under stress, it can help you skip over feelings you'd rather not face.",
  },
  {
    n: 8, name: 'The Assertive Protector', desire: 'To be strong and in control', fear: 'Being controlled or harmed',
    strengths: 'Direct, protective, decisive', stress: 'Overpowering others', tip: 'Ask a question before giving your view',
    best: 'direct, protective, decisive',
    drive: 'You want to be strong and in control of your own life.',
    overfire: "You're direct and quick to protect people. Under stress, that strength can overpower the people around you.",
  },
  {
    n: 9, name: 'The Harmonious Mediator', desire: 'To keep peace, inside and out', fear: 'Conflict and disconnection',
    strengths: 'Easygoing, accepting, patient', stress: 'Going numb, putting things off', tip: 'Say one preference out loud today',
    best: 'easygoing, accepting, patient',
    drive: 'You want peace, inside and out, and you work to keep things calm.',
    overfire: 'Your calm helps the people around you relax. Under stress, keeping the peace can turn into going numb and putting things off.',
  },
];

/** How each type and wing mix. Drafted, except 4w5 (content doc). */
export const wingLines: Record<string, string> = {
  '1w9': 'You hold high standards, and you prefer to work toward them quietly and calmly.',
  '1w2': 'You hold high standards, and you put them to work helping the people around you.',
  '2w1': 'You care for people, and you also care about doing right by them.',
  '2w3': 'You care for people, and you enjoy being seen as someone who gets things done.',
  '3w2': 'You work hard to succeed, and you like bringing people along with you.',
  '3w4': 'You work hard to succeed, and you want that success to feel true to who you are.',
  '4w3': 'You feel things deeply, and you like turning that into something others can see.',
  '4w5': 'You feel things deeply, and you often step back into your thoughts to make sense of them.',
  '5w4': 'You love to understand things, and you bring a personal, creative angle to what you learn.',
  '5w6': 'You love to understand things, and you use what you learn to stay prepared.',
  '6w5': 'You look out for risks, and you like to think things through on your own first.',
  '6w7': 'You look out for risks, and you balance that with warmth and a sense of fun.',
  '7w6': 'You chase new experiences, and you like sharing them with people you trust.',
  '7w8': 'You chase new experiences, and you go after what you want with energy.',
  '8w7': "You're strong and direct, and you bring plenty of energy and boldness.",
  '8w9': "You're strong and direct, but you also have a steady, calm side.",
  '9w8': 'You keep the peace, and you can stand your ground when it really matters.',
  '9w1': "You keep the peace, and you have a quiet sense of what's right.",
};

export const result = {
  change: 'Results can shift with mood and life stage. Come back in a few months and compare.',
  // Drafted.
  evenMeaning: 'Three or more types scored within a point of each other, so no single type stands out this time.',
  evenTip:
    // Drafted: em dash removed.
    'Read your top three descriptions above. The one that feels most true about your motives, not just your behaviour, is usually your type.',
  // Next test (name, link, time) comes from nextAfter() in data/home.ts, in doc order.
  // Drafted: part-1.md has no next-test line for the Enneagram.
  nextLine: 'You know what drives you. Now see how much you remember from a quick look.',
  learn: { href: '/method/', label: 'How we build our tests →' },
};

// ---------- Drafted after the 45-statement build (Enneagram review, 13 Oct). Not in part-1.md. ----------

/**
 * Tie-break round: when 2 or 3 types are within a point, people choose between the types' motives.
 * Each line is a first-person version of that type's core desire, core fear and stress reaction.
 */
export const tieBreakLines: Record<TypeNumber, { desire: string; fear: string; stress: string }> = {
  1: { desire: 'Doing things the right way', fear: 'Getting something wrong', stress: 'I get harder on myself' },
  2: { desire: 'Being needed by the people I love', fear: 'Not being wanted', stress: 'I give more, then feel taken for granted' },
  3: { desire: 'Being seen as successful', fear: "Feeling like I'm worth nothing", stress: 'I push harder to prove myself' },
  4: { desire: 'Being true to who I really am', fear: 'Losing my sense of who I am', stress: 'I compare myself with others and pull back' },
  5: { desire: 'Understanding how things work', fear: 'Being out of my depth', stress: 'I go quiet and need space' },
  6: { desire: 'Feeling safe and backed up', fear: 'Being left without support', stress: 'I worry and second-guess' },
  7: { desire: 'Being free to try new things', fear: 'Feeling trapped or missing out', stress: "I keep busy so I don't dwell on it" },
  8: { desire: 'Being strong and in charge of my life', fear: 'Being controlled by someone else', stress: 'I get forceful and take over' },
  9: { desire: 'Keeping things calm and peaceful', fear: 'Conflict with people I care about', stress: 'I switch off and put things off' },
};

export const tieBreak = {
  intro: 'Your top types are close. A few quick choices will help tell them apart.',
  prompts: {
    desire: 'Which matters more to you?',
    fear: 'Which would worry you more?',
    stress: 'When you’re stressed, which sounds more like you?',
  },
  same: 'About the same',
  skip: 'Skip and see my result',
};

export const ui = {
  whyTitle: 'Why this type?',
  whyIntro: 'You rated these statements highest:',
  clearLead: (gap: number, next: number) => `Clear lead: ${gap} points ahead of Type ${next}.`,
  closeCall: (gap: number, next: number) => `Close call: ${gap} points ahead of Type ${next}, so read both.`,
  settled: (next: number) => `Close call: settled by the tie-break. Type ${next} came a close second, so read both.`,
  runnerUp: (n: number) => `Also read: Type ${n}`,
  showAll: 'Show all 9 scores',
  showTop: 'Show top 3 only',
  nineTypes: 'The nine types',
  copyScores: 'Copy my scores',
  leaveWarning: 'Your answers will be lost if you leave this page.',
  timeLeft: (min: number) => (min <= 1 ? 'under a minute left' : `about ${min} min left`),
};

export const faqs: Faq[] = [
  // Drafted: em dash removed.
  { q: 'What is the Enneagram?', a: 'A model that describes nine patterns of motivation: what drives people, what they fear and how they react under stress.' },
  // Drafted: em dash removed.
  { q: 'What does "Enneagram" mean?', a: 'It comes from Greek: ennea means nine, and gramma means something drawn, so it names a nine-pointed figure.' },
  { q: 'What are the 9 Enneagram types?', a: '1 Ethical Architect, 2 Intuitive Caregiver, 3 Driven Achiever, 4 Authentic Depth-Seeker, 5 Analytical Observer, 6 Vigilant Guardian, 7 Visionary Explorer, 8 Assertive Protector, 9 Harmonious Mediator.' },
  // Drafted: em dash removed.
  { q: 'How do I find my Enneagram type?', a: 'Take the test above, then read your top two or three type descriptions. The one that feels most true about your motives, not just your behaviour, is usually your type.' },
  { q: 'What is an Enneagram number?', a: 'Simply your type, from 1 to 9. "I\'m a 6" means Type 6.' },
  // Drafted: em dash removed.
  { q: 'What is a wing?', a: "One of the two types next to yours on the circle, which adds flavour to your main type. It's written like 4w5." },
  { q: 'Is the Enneagram scientific?', a: "Research on it is limited and mixed. It's best used for self-reflection, not as a fixed label." },
  { q: 'Can my type change?', a: 'Many people find their result shifts a little with mood and life stage. Retake it in a few months and compare.' },
  { q: 'Do I need to sign up?', a: 'No. Every score is shown free, and your answers never leave your device.' },
];

export const sources: Source[] = [
  { before: 'Hook, J. N., et al. (2021). The Enneagram: A systematic review of the literature and directions for future research. ', title: 'Journal of Clinical Psychology', after: '.' },
];
