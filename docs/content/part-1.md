# KnowPsyche — Test Content: Wave 1 (Part 1)

Oct 13, 2026 · @Dev

## How to use this doc

This is the final content for the first two tests, ready to go straight into the build. Read each section, and comment on anything you want changed.

Every test follows the same structure:

1. **Page copy** — title, Google title and description, and the intro text above the test.
2. **How the test works** — the rules or questions, exactly as users will see them.
3. **Scoring** — how the result is calculated, in the browser.
4. **Result copy** — what users read after finishing: what it means, what can change it, what to try next.
5. **FAQ and sources** — for the page, for Google, and for trust.

Rules we follow everywhere: plain English, no diagnosis, no copied questions, every score shown, no email gate.

## Test 1 — Reaction Time

The flagship test: five tries, average shown, four modes. Target keyword: "reaction time test" (\~57K US searches/month).

### Page copy

| Field | Text |
| --- | --- |
| URL | /reaction-time-test/ |
| Google title (≤60 chars) | Reaction Time Test — Free, 5 Tries, Instant Result |
| Meta description (≤155 chars) | How fast do you react? Click when the screen changes. Get your average in milliseconds, see what's typical, and learn what affects your speed. |
| H1 | Reaction time test |
| Intro | Wait for the box to change, then click as fast as you can. Five tries, then your average. |

### How the test works

**Visual mode (default).** The box starts dark with "Click to start". After a click, it turns red with "Wait for it…". After a random wait of 1.5–4 seconds it turns light teal with "CLICK!". The user clicks, and their time shows in milliseconds.

**Sound mode.** Same flow, but a short beep plays instead of the colour change. The screen stays the same colour, so only the sound counts. Note on page: "Your speakers can add a small delay."

**F1 lights mode.** Five red lights switch on one per second. After a random hold of 0.5–3 seconds, all lights go out. The user clicks the moment they go out.

**Spacebar mode.** Same as visual, but the user presses the spacebar. On phones this mode is hidden.

**Rules in every mode**

- Clicking before the signal = "Too soon!" The try doesn't count; the user simply tries again.
- Any time under 100 ms is treated as a guess, not a reaction, and isn't counted.
- After 5 valid tries, the result appears.

### Scoring

- **Main score** = the average of the 5 valid tries, rounded to the nearest millisecond.
- **Also shown:** fastest try, and the spread (fastest to slowest).
- **Timing** uses the browser's high-precision clock. Nothing is sent to a server.

### Result bands (visual mode)

| Average | Badge | What we say |
| --- | --- | --- |
| Under 200 ms | Lightning | Quicker than most people. Great focus — or a very fast screen. |
| 200–250 ms | Quick | A little quicker than typical. |
| 251–300 ms | Steady | Right where most people land in browser tests. |
| 301–400 ms | Needs a coffee | Tiredness, distractions or a laggy device often explain this. |
| Over 400 ms | Running on empty | Try again on a computer with a mouse, after a short break. |

Sound mode usually comes out a little faster than visual; F1 mode a little slower. Each mode gets a note saying so, rather than separate bands.

### Result copy (the 3 questions)

- **What does it mean?** \[band text from the table\]. Your fastest try was \[X\] ms, and your tries were \[spread\] ms apart.
- **What can change it?** Sleep, alertness, practice and age all play a part. So does your device: screens and mice can add tens of milliseconds before your brain is even involved.
- **What next?** Fast hands are one thing — what about holding back? Try the Attention span test.

### After the result (replay and sharing)

- **Spread challenge:** if the spread is over 60 ms — "Fast, but a bit inconsistent. Can you get all five within 50 ms?" with a Try again button.
- **Share card:** "My reaction time: 247 ms — Quick. Can you beat it?" + knowpsyche.com link. One tap to WhatsApp, Instagram story image, or copy link.
- **Morning vs night:** "Tiredness slows reactions. Test yourself in the morning and again late at night — see the difference."
- **F1 mode hook:** "Can you match a race start?" (no claims about drivers' exact times).

### FAQ

1. **What is reaction time?** The time between noticing a signal and responding to it — here, between the box changing and your click.
2. **What is the average reaction time?** In browser tests, most people average between 200 and 300 ms. Your device adds part of that.
3. **What is a good reaction time?** Under 250 ms is quick; under 200 ms is very fast.
4. **Why is my reaction time so slow?** The usual reasons are tiredness, distraction, a phone touchscreen, or a slow monitor or mouse.
5. **How can I improve my reaction time?** Sleep well, warm up with a few tries, stay focused, and practise. For gaming, a fast mouse and a high-refresh monitor help most.
6. **Does being tired slow your reaction time?** Yes — lack of sleep is one of the most reliable ways to slow down.
7. **Does caffeine help?** Some studies find a small improvement in alertness and reaction time, especially when you're tired.
8. **At what age is reaction time fastest?** For most people, in their late teens and twenties. It slows gradually after that.
9. **What's the difference between a reaction and a reflex?** A reflex (like the knee-jerk) happens automatically without a decision. A reaction needs your brain to notice and decide, so it's slower.
10. **What's the difference between simple and choice reaction time?** Simple = one signal, one response (this test). Choice = several possible signals and responses, which takes longer.
11. **Why don't times under 100 ms count?** Humans can't really react that fast to a signal — it's a lucky guess. Sprint races use the same idea: a start under 0.1 seconds counts as a false start.
12. **Why is sound faster than sight?** Many studies find people react slightly faster to sounds than to lights.
13. **Is this a medical test?** No. It's for curiosity and self-reflection, not a diagnosis.

### Sources

- Woods, D. L., et al. (2015). Factors influencing the latency of simple reaction time. *Frontiers in Human Neuroscience*.
- Jain, A., et al. (2015). A comparative study of visual and auditory reaction times. *International Journal of Applied and Basic Medical Research*.

## Test 2 — Enneagram

45 original statements, about 8 minutes, all 9 scores shown free. Target keyword: "free enneagram test" (\~26K US searches/month). Every statement below was written for KnowPsyche; none are copied from paid tests.

### Page copy

| Field | Text |
| --- | --- |
| URL | /enneagram-test/ |
| Google title (≤60 chars) | Free Enneagram Test — All 9 Scores, No Email Needed |
| Meta description (≤155 chars) | Find your Enneagram type in about 8 minutes. 45 questions, every score shown free, plus your wing and what your type means in plain English. |
| H1 | Free Enneagram test |
| Intro | Rate how true each statement is for you. Go with your first instinct — think about how you usually are, not how you'd like to be. |

### Answer scale

Each statement is rated on 5 buttons: **Not like me (1) · A little (2) · Somewhat (3) · Mostly (4) · Very much like me (5)**. One statement per screen on mobile, five per screen on desktop, with a progress bar.

### During the test (keeping people going)

- **Progress bar with honest milestones:** at 15 — "A third done. Your answers are starting to form a pattern." At 30 — "Two thirds done. Your top types are taking shape." At 40 — "Almost there — 5 to go."
- **Button feedback:** the chosen button fills with a soft pulse, then the next statement slides in.
- **Back button** on every statement, so people can fix a misclick without restarting.

### The 45 statements (in the order shown)

The Type column is hidden from users and used only for scoring.

| # | Statement | Type |
| --- | --- | --- |
| 1 | I notice mistakes quickly, even when others don't. | 1 |
| 2 | I often know what people need before they ask. | 2 |
| 3 | I set goals and push hard to reach them. | 3 |
| 4 | I often feel different from the people around me. | 4 |
| 5 | I need plenty of time alone to recharge. | 5 |
| 6 | I often think about what could go wrong. | 6 |
| 7 | I love having lots of options and new experiences. | 7 |
| 8 | I say what I think, even if it causes conflict. | 8 |
| 9 | I go along with others to keep the peace. | 9 |
| 10 | I feel uneasy when things aren't done the right way. | 1 |
| 11 | I feel good about myself when I'm helping someone. | 2 |
| 12 | I care about how successful I look to others. | 3 |
| 13 | I'm drawn to deep feelings, even sad ones. | 4 |
| 14 | I like to fully understand something before I act. | 5 |
| 15 | Loyalty and trust matter enormously to me. | 6 |
| 16 | I get bored easily with routine. | 7 |
| 17 | I don't like being controlled by others. | 8 |
| 18 | I find it hard to know what I want when others have strong opinions. | 9 |
| 19 | I hold myself to high standards and feel bad when I fall short. | 1 |
| 20 | I find it easier to give support than to ask for it. | 2 |
| 21 | I adjust how I come across to impress different people. | 3 |
| 22 | Expressing who I really am is very important to me. | 4 |
| 23 | I protect my time and energy rather than overcommit. | 5 |
| 24 | I like having a backup plan. | 6 |
| 25 | When something hurts, I prefer to focus on the bright side. | 7 |
| 26 | I naturally take charge when no one else does. | 8 |
| 27 | I avoid conflict whenever I can. | 9 |
| 28 | I often think about how things could be improved. | 1 |
| 29 | I sometimes say yes to people even when I'm already stretched. | 2 |
| 30 | I feel restless when I'm not making progress. | 3 |
| 31 | I sometimes feel something is missing that others seem to have. | 4 |
| 32 | I'd rather observe a situation than jump into it. | 5 |
| 33 | I sometimes doubt my decisions and look for reassurance. | 6 |
| 34 | I'm usually planning the next fun thing. | 7 |
| 35 | I stand up for people who are treated unfairly. | 8 |
| 36 | People often find me calm and easy to be around. | 9 |
| 37 | It's hard for me to relax until a job is done properly. | 1 |
| 38 | Being appreciated by people I care about matters a lot to me. | 2 |
| 39 | I measure my worth by what I achieve. | 3 |
| 40 | I'd rather be authentic than fit in. | 4 |
| 41 | I enjoy diving deep into topics that interest me. | 5 |
| 42 | I'm quick to notice when someone might not be trustworthy. | 6 |
| 43 | I find it hard to stay with one thing for long. | 7 |
| 44 | Showing vulnerability doesn't come easily to me. | 8 |
| 45 | I put off important things by doing small, easy tasks. | 9 |

### Scoring

1. **Type score** = sum of its 5 answers (range 5–25), shown as a percentage: (sum − 5) ÷ 20 × 100.
2. **Main type** = the highest score. If two types tie within 1 point, both are shown as "You may be a 4 or a 9" with both descriptions.
3. **Wing** = the higher-scoring of the two neighbouring types on the circle (Type 1's neighbours are 9 and 2; Type 9's are 8 and 1). Shown as "4w5".
4. **All 9 scores** appear as a bar chart, highest first. Nothing is stored or sent anywhere.

### The 9 type results

| Type | Name | Core desire | Core fear | Strengths | Under stress | Try this |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | The Ethical Architect | To be good and do things right | Being flawed or wrong | Fair, reliable, high standards | Harsh self-criticism | Notice one thing that's "good enough" today |
| 2 | The Intuitive Caregiver | To be loved and needed | Being unwanted | Warm, generous, tuned in to others | Overgiving, then resentment | Ask for one small favour this week |
| 3 | The Driven Achiever | To be valuable and admired | Being worthless | Driven, efficient, inspiring | Tying worth to results | Do one thing just for enjoyment |
| 4 | The Authentic Depth-Seeker | To be truly themselves | Having no identity | Creative, honest, emotionally deep | Comparing and withdrawing | List three things you already have that matter |
| 5 | The Analytical Observer | To be capable and understand | Being overwhelmed or useless | Curious, calm, insightful | Pulling away from people | Share one idea before it feels finished |
| 6 | The Vigilant Guardian | To feel safe and supported | Being without support | Loyal, prepared, protective | Worry and second-guessing | Write the worry down, then the likeliest outcome |
| 7 | The Visionary Explorer | To be free and satisfied | Being trapped or deprived | Optimistic, adventurous, quick | Avoiding hard feelings | Stay with one task for 25 minutes |
| 8 | The Assertive Protector | To be strong and in control | Being controlled or harmed | Direct, protective, decisive | Overpowering others | Ask a question before giving your view |
| 9 | The Harmonious Mediator | To keep peace, inside and out | Conflict and disconnection | Easygoing, accepting, patient | Going numb, putting things off | Say one preference out loud today |

**Tone rule:** every weakness is written as a strength that over-fires. Example for Type 6: "Your mind is good at spotting risks to protect the people you care about. Under stress, that alarm can go off too often."

**Wing line:** one sentence on how the two types mix. Example for 4w5: "You feel things deeply, and you often step back into your thoughts to make sense of them."

**Result copy template:** "You're most likely a **Type \[N\] — \[Name\]** with a \[wing\] wing. \[Core drive sentence\]. At your best you're \[strengths\]. Watch for \[watch-out\]. Try this: \[tip\]." Each type gets its own 600–900 word page later (part of the 27 type and wing pages).

### After the result (sharing and coming back)

- **Share card:** "I'm a 4w5 — The Authentic Depth-Seeker" + one line on the core desire + knowpsyche.com. Sized for WhatsApp and Instagram stories.
- **Compare with a friend (launch v1.1, November):** "Send this to a friend or partner." The link carries your type; when they finish, both see a short card on how your types get along and where they clash. No accounts, nothing stored.
- **Go deeper:** link to the full type page (27 type and wing pages, from 22 Oct).
- **Retake prompt:** "Results can shift with mood and life stage. Come back in a few months and compare."

### FAQ

1. **What is the Enneagram?** A model that describes nine patterns of motivation — what drives people, what they fear and how they react under stress.
2. **What does "Enneagram" mean?** It comes from Greek: *ennea* means nine, and *gramma* means something drawn — a nine-pointed figure.
3. **What are the 9 Enneagram types?** 1 Ethical Architect, 2 Intuitive Caregiver, 3 Driven Achiever, 4 Authentic Depth-Seeker, 5 Analytical Observer, 6 Vigilant Guardian, 7 Visionary Explorer, 8 Assertive Protector, 9 Harmonious Mediator.
4. **How do I find my Enneagram type?** Take the test above, then read your top two or three type descriptions. The one that feels most true about your motives — not just your behaviour — is usually your type.
5. **What is an Enneagram number?** Simply your type, from 1 to 9. "I'm a 6" means Type 6.
6. **What is a wing?** One of the two types next to yours on the circle, which adds flavour to your main type — written like 4w5.
7. **Is the Enneagram scientific?** Research on it is limited and mixed. It's best used for self-reflection, not as a fixed label.
8. **Can my type change?** Many people find their result shifts a little with mood and life stage. Retake it in a few months and compare.
9. **Do I need to sign up?** No. Every score is shown free, and your answers never leave your device.

### Sources

- Hook, J. N., et al. (2021). The Enneagram: A systematic review of the literature and directions for future research. *Journal of Clinical Psychology*.

## Ideas we chose not to use

From the psychology framework, a few ideas would hurt trust or break our rules, so they're out:

| Idea | Why not | What we do instead |
| --- | --- | --- |
| "Top 1% / Top 5%" reaction badges | We don't collect scores, so any percentile would be made up | Fun badges without numbers (Lightning, Quick, Steady) |
| Progress captions like "Detecting your subconscious driver" | A 45-question test can't read the subconscious; it overclaims | Honest captions about progress and patterns |
| "Brain-age test" framing | No real link between this score and brain age | "How fast do you react?" |
| "Science proves ears are faster than eyes" | Studies show a small, average difference, not proof for everyone | "Many studies find…" |
| Results written to make people feel "this site knows me better than I do" | Vague flattering text works on everyone (Barnum effect) — it's a trick, not insight | Specific, honest descriptions with real strengths and real watch-outs |

## What's next

Part 2 covers the remaining five tests in the same format, ready before the build starts on 16 Oct.

| Test | Format | Length |
| --- | --- | --- |
| Photographic memory | Study a grid of shapes, rebuild it; grid grows each level | 2–3 min |
| Number memory | Remember a number shown briefly; one digit longer each round | 1–2 min |
| Attention span | Go/No-Go: click for the target, hold back for the rest | 2–3 min |
| Stroop test | Pick the ink colour, not the word; matching vs clashing rounds | 1 min |
| Emotional intelligence | 30 original self-report statements across 4 areas | 6 min |

**Review checklist for you**

- [x] Statements sound natural to you
- [x] Result bands and type names feel right
- [x] Nothing feels like a diagnosis or a label
- [x] Comment on anything you'd change
