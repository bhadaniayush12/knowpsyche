# DESIGN.md — Human-Centered UI/UX & Web Design System

> **Purpose:** This document converts the supplied UI/UX/web-design transcript into an actionable design specification for a designer, Figma workflow, or coding AI.
>
> **Source:** `Pasted text(20260919-175203).txt`
>
> **Rule:** Treat this file as the design decision framework. Do not jump directly into decoration. Design decisions should be tied to user needs, content, hierarchy, usability, context, and the intended product goal.

---

## 1. Core Design Philosophy

### 1.1 Design is problem solving, not decoration

A visually attractive interface is not enough.

The design must:

- solve a real user problem
- make the user's journey easier
- make important information easy to find
- reduce unnecessary complexity
- communicate the right message visually
- feel familiar enough to be understandable
- remain usable across devices and abilities
- provide clear feedback for user actions
- be testable and improvable

A beautiful interface that makes the user struggle is still a design failure.

### 1.2 Think like a designer

For every meaningful design decision, ask:

> **Why is this here?**

Then ask:

> **What problem does this solve?**

And:

> **What message does this visual choice communicate?**

Do not change something simply because another designer, website, trend, or AI generated it.

The transcript repeatedly emphasizes observing existing products, understanding why patterns work, and making deliberate design decisions rather than blindly copying them.

### 1.3 User first

Design should begin with understanding the user and the context in which the product will be used.

Use this mental model:

```text
USER NEED
   ↓
PROBLEM
   ↓
GOAL
   ↓
STRUCTURE
   ↓
WIREFRAME
   ↓
VISUAL DESIGN
   ↓
PROTOTYPE
   ↓
TEST
   ↓
ITERATE
   ↓
DELIVER
```

Do not reverse this into:

```text
Pretty UI
↓
Find a reason for it
```

---

# 2. UI vs UX

## UI

UI means **User Interface**.

It deals with the visible and interactive presentation of the product:

- typography
- colors
- layout
- grids
- imagery
- iconography
- buttons
- forms
- interactions
- visual hierarchy
- accessibility considerations

UI should make the interface visually clear, understandable, attractive, and usable.

## UX

UX means **User Experience**.

It is concerned with what happens when a user actually uses the product:

- Can the user find what they need?
- Is the journey understandable?
- Are the actions obvious?
- Is the product useful?
- Is anything unnecessarily difficult?
- Does the product respond clearly?
- Can different users use it?
- Are there errors or confusing moments?
- Does the overall flow feel smooth?

## UI + UX

They work together.

Think of it as:

```text
UX = shapes the journey
UI = enriches and communicates the journey
```

A strong product needs both.

---

# 3. Professional Design Process

Use the following process for serious product/web design.

## Step 1 — Understand

Before designing:

- understand the client/product requirement
- understand the problem
- define project goals
- understand user needs
- identify constraints
- understand the context of use
- identify what success means

Create a brief that acts as the project's compass.

### Required questions

```text
Why are we building this?
Who is it for?
What problem are we solving?
What is the user trying to accomplish?
What does the business/product need?
What are the constraints?
How will we know the design succeeded?
```

---

## Step 2 — Explore

Research before designing.

Inspect:

- competitors
- similar products
- current design conventions
- industry patterns
- visual references
- existing client/product material
- relevant design trends

The purpose is not to copy.

The purpose is to understand:

```text
What works?
Why does it work?
What conventions do users already know?
What is common in the category?
Where can our design be distinct?
```

### Competitive differentiation

Do not create a design that is so similar to competitors that users could confuse the brands/products.

Use competitor references to understand the category while still creating a distinctive visual language.

---

# 4. Information Architecture

Before high-fidelity UI, structure the information.

A website/product should have:

```text
Product
├── Pages
│   ├── Sections
│   │   ├── Content
│   │   └── Actions
│   └── Navigation
└── User journeys
```

Think of a page as a sequence of meaningful sections.

Every section should have a job.

### Common website structures from the transcript

- navigation
- hero
- content sections
- product/service sections
- supporting information
- testimonials or proof where relevant
- call to action
- contact
- footer

The exact structure must be determined by the product's goals and content, not by a generic template.

---

# 5. User Journey

The design should guide the user through a clear journey.

Do not make users repeatedly search for the next action.

A strong journey should make it obvious:

```text
Where am I?
What can I do?
What is important?
What should I do next?
What happened after I acted?
```

Every important interaction should have an understandable response.

---

# 6. Wireframes

## Wireframes are blueprints

Wireframes should focus on:

- structure
- content
- layout
- hierarchy
- navigation
- user flow
- placement of major elements

Do **not** spend early wireframing time obsessing over:

- colors
- decorative effects
- final imagery
- visual polish

A wireframe should be intentionally simple.

### Low-fidelity principle

```text
Structure first
Aesthetics later
```

The transcript compares this to creating a building plan before the finished building.

### Wireframe review

Before moving to high fidelity, verify:

- Is the content complete?
- Is the structure logical?
- Is the navigation understandable?
- Is anything missing?
- Is the primary action obvious?
- Does the sequence make sense?
- Can the user reach the intended goal?

---

# 7. High-Fidelity Design

Once the structure is stable, introduce visual communication.

High-fidelity design adds:

- typography
- color
- imagery
- iconography
- spacing
- hierarchy
- components
- interaction states
- brand identity

The goal is not merely to make the wireframe prettier.

The visual system should communicate the right story and reinforce the content.

---

# 8. Visual Communication

Every visual choice sends a message.

Ask:

> **What message does this choice send?**

### Color communicates

Color can communicate:

- emphasis
- status
- mood
- trust
- energy
- difference
- hierarchy

Do not choose colors only because they look attractive.

### Typography communicates

Typography can make a product feel:

- technical
- premium
- editorial
- friendly
- serious
- modern
- trustworthy

### Imagery communicates

Photography, illustrations, 3D assets, icons, and graphics should reinforce the story.

Do not add decorative imagery simply because there is empty space.

---

# 9. Visual Inspiration

Collect references deliberately.

Possible sources mentioned in the transcript include:

- Behance
- Pinterest
- Dribbble
- web-design award/reference sites
- existing competitor websites
- client-provided references

### Inspiration workflow

```text
Brief
↓
Extract project keywords
↓
Search multiple reference sources
↓
Collect relevant examples
↓
Compare visual patterns
↓
Identify recurring patterns
↓
Identify opportunities for differentiation
↓
Build the visual direction
```

Create an **Inspiration** section/page in the design file.

References should be organized rather than dumped randomly.

---

# 10. UI Design Principles

## 10.1 Simplicity

Keep the interface easy to understand and use.

Avoid unnecessary:

- controls
- decoration
- choices
- text
- visual noise
- complexity

Simplicity does not mean removing useful functionality.

It means removing unnecessary complexity.

### Example principle

When the product has one primary job, make that job visually obvious.

---

## 10.2 Consistency

Use consistent:

- typography
- spacing
- buttons
- colors
- shapes
- navigation
- interaction patterns
- component behavior

Users learn patterns.

Once a pattern is learned, changing it unnecessarily creates confusion.

Consistency should exist across the product, not only inside individual screens.

---

## 10.3 Visual hierarchy

Not everything should have equal visual weight.

Create a clear order of importance:

```text
Primary
↓
Secondary
↓
Supporting
↓
Low priority
```

Hierarchy can be created using:

- size
- weight
- placement
- contrast
- spacing
- color
- grouping

### Critical rule

> **When everything is emphasized, nothing is emphasized.**

The most important information should be the easiest thing to notice.

---

## 10.4 Feedback and responsiveness

Users need to know what happened after an action.

Examples:

- loading state
- success state
- error state
- selected state
- hover state
- pressed state
- progress state
- confirmation
- inline validation

The transcript uses messaging and system responses as examples of feedback.

### Rule

Never leave the user wondering:

> "Did my action work?"

---

## 10.5 Accessibility

Accessibility is part of design, not an afterthought.

Design for users with different abilities.

Consider:

- readable text
- sufficient contrast
- keyboard navigation
- visible focus
- screen-reader compatibility
- meaningful labels
- alternative ways to interact
- appropriately sized controls
- captions/transcripts where relevant
- clear status communication

Do not depend only on color to communicate meaning.

---

## 10.6 Clarity

Make content:

- readable
- understandable
- properly spaced
- visually structured
- easy to scan

Avoid dense walls of text unless the content genuinely requires them.

Use:

- headings
- subheadings
- paragraphs
- lists
- emphasis
- whitespace
- clear grouping

---

## 10.7 User control

Users should have appropriate control over the interaction.

Where relevant, give users control over:

- pause/play
- speed
- volume
- navigation
- dismissal
- customization
- undo/recovery
- display preferences

Do not force unnecessary interaction.

---

## 10.8 Error prevention and recovery

Design should reduce the chance of mistakes.

When errors happen:

1. explain what went wrong
2. make the problem understandable
3. show how to fix it
4. preserve user input when possible
5. avoid dead ends

A good error experience is not just:

```text
Error.
```

It should answer:

```text
What happened?
Why?
What should I do now?
```

---

# 11. UX Laws & Behavioral Principles

Use these as design lenses, not as rigid formulas.

## 11.1 Aesthetic-Usability Effect

Users may perceive visually pleasing designs as easier to use.

Important implication:

Visual polish affects perception.

But attractive visuals must never be used as a substitute for actual usability.

---

## 11.2 Doherty Threshold

The transcript presents fast system feedback as important to maintaining attention and reducing the perception of waiting.

### Design implication

Provide feedback quickly.

When processing takes time:

- show loading
- show progress where meaningful
- communicate that the system is working
- avoid unexplained waiting

Motion may be used to communicate activity, but it should have a purpose.

---

## 11.3 Fitts's Law

The time required to reach a target depends partly on distance and target size.

### Design implication

Important interactive controls should be:

- sufficiently large
- easy to reach
- visually obvious
- separated enough from competing targets

Especially consider touch interfaces.

Primary actions should not be tiny targets.

---

## 11.4 Serial Position Effect

People tend to remember first and last items more readily than middle items.

### Design implication

Important content/actions can benefit from strategic placement at the beginning or end of a sequence.

Do not assume every item in a list deserves equal placement priority.

---

## 11.5 Hick's Law

More choices generally increase decision complexity.

### Design implication

When decision speed matters:

- reduce unnecessary choices
- group choices
- use progressive disclosure
- highlight meaningful/recommended paths where appropriate
- break complex tasks into smaller steps

Do not overwhelm users with every option at once.

---

## 11.6 Jakob's Law

Users spend much of their time on other products.

They bring expectations from familiar products.

### Design implication

Use familiar patterns when they improve comprehension.

Examples of familiar patterns include:

- common navigation placement
- recognizable icons
- familiar form behavior
- common interaction conventions

Do not reinvent familiar interactions without a strong reason.

---

## 11.7 Miller's Law

The transcript teaches the common idea that users can only keep a limited number of items in working memory at once.

### Design implication

Avoid overwhelming users.

Break large information sets into:

- smaller groups
- sections
- steps
- categories
- progressive disclosure

Do not interpret this as a hard rule that every screen must contain a fixed number of items.

---

## 11.8 Pareto Principle

The transcript presents the 80/20 concept: a relatively small portion of causes can contribute disproportionately to results.

### Design implication

Identify the user's highest-value tasks and put disproportionate design attention on them.

Prioritize:

```text
What users need most
over
What users might theoretically use someday
```

---

## 11.9 Law of Proximity

Objects placed close together tend to be perceived as related.

### Design implication

Use spacing to communicate relationships.

```text
Related → closer
Unrelated → farther apart
```

Spacing is information architecture.

Do not use identical spacing everywhere if relationships differ.

---

## 11.10 Law of Similarity

Elements that look alike are perceived as related.

Use consistent:

- color
- shape
- size
- typography
- component treatment

### Important distinction

Links and buttons should look sufficiently different from normal text so users understand what is interactive.

---

## 11.11 Tesler's Law / Conservation of Complexity

Some complexity cannot be removed from a system.

The design goal is to absorb as much complexity as possible before it reaches the user.

### Design implication

Handle system complexity through:

- defaults
- automation
- sensible grouping
- progressive disclosure
- intelligent detection
- clear guidance
- useful tooltips
- reduced unnecessary fields

Do not make users solve problems that the product can solve for them.

---

# 12. Common Design Principles from the Transcript

The transcript also emphasizes:

## Contrast

Differences attract attention.

Use contrast to distinguish:

- primary vs secondary actions
- headings vs body text
- selected vs unselected
- important vs supporting content
- interactive vs non-interactive elements

---

## Repetition

Repeat visual patterns to create familiarity.

Use repetition for:

- branding
- components
- spacing
- typography
- recurring content structures

---

## Alignment

Elements should have a visual relationship.

Use grids and alignment to create:

- structure
- order
- clarity
- visual rhythm

Avoid arbitrary placement.

---

## White space

Empty space is not wasted space.

Use whitespace to:

- separate groups
- improve readability
- establish hierarchy
- reduce cognitive load
- create visual focus

Do not fill every empty area.

---

## Balance

Distribute visual weight intentionally.

A layout should feel stable and deliberate rather than accidentally weighted toward one area.

---

## Hierarchy

Determine what the user should notice:

```text
1. Most important
2. Supporting
3. Secondary
4. Detail
```

Hierarchy should be visible through size, placement, contrast, spacing, and typography.

---

# 13. Grid System

Grid is the structural foundation of layout.

## Why use grids?

Grids help:

- organize content
- maintain alignment
- create clean layouts
- establish consistency
- prevent arbitrary positioning
- create responsive structures

### Grid anatomy

```text
Margin | Column | Gutter | Column | Gutter | Column | Margin
```

### Terms

**Margin:** outer space between the layout edge and content.

**Column:** vertical structural area.

**Gutter:** space between columns.

**Row:** horizontal structural area.

---

## Grid types

### Manuscript grid

Useful for text-heavy layouts/documents.

### Column grid

Useful for organizing content into columns.

### Baseline grid

Useful for consistent typographic alignment.

### Modular grid

Combines rows and columns into a structured matrix.

### Hierarchical grid

Uses flexible visual structure based on content importance.

---

## Grid rule

Do not use a grid just because the grid is available.

Choose a grid that fits:

- content
- device
- hierarchy
- interaction
- page type

---

# 14. Responsive Design

A design must work across:

- desktop
- tablet
- mobile

Responsive design is not simply shrinking the desktop design.

The layout may need to change structurally.

### Responsive principle

```text
Desktop
→ multiple columns / larger composition

Tablet
→ tighter layout / adjusted hierarchy

Mobile
→ simplified single-column structure where appropriate
```

### Test

For every important screen ask:

- What happens when the viewport becomes narrower?
- Do text blocks remain readable?
- Do controls remain reachable?
- Does hierarchy remain clear?
- Does anything collide?
- Does content become unnecessarily wide?
- Does navigation still work?
- Is there horizontal scrolling?

---

## Content width

The transcript demonstrates the use of a maximum-width container for wide screens.

Use a centered content container when unrestricted stretching would make text difficult to read.

Conceptually:

```text
Viewport
┌─────────────────────────────────────────┐
│                                         │
│     ┌─────────────────────────────┐     │
│     │        MAX CONTENT          │     │
│     │          WIDTH              │     │
│     └─────────────────────────────┘     │
│                                         │
└─────────────────────────────────────────┘
```

The exact width should be chosen according to the product and content.

---

# 15. Touch Targets

Important interactive targets should be easy to select.

Consider:

- adequate size
- adequate spacing between adjacent targets
- reachability
- finger/touch interaction
- visual clarity

Primary CTAs should receive enough visual and physical area to be comfortably used.

---

# 16. Typography

Typography is a design tool, not merely a text setting.

Choose type based on the message the product needs to communicate.

### Questions to ask

```text
What does this font communicate?
Is it readable?
Does it work at the intended sizes?
Does it support the content?
Does it create the intended personality?
Does it work across devices?
```

---

## Heading vs body typography

The transcript demonstrates that a distinctive typeface may work well for headings but become difficult to read at small body sizes.

Therefore:

- headings may carry stronger personality
- body text should prioritize readability
- small text should not use overly delicate letterforms
- line-height must support readability
- font weight should establish hierarchy

A font should be evaluated in the actual sizes at which it will be used.

---

## Font exploration process

Compare several options rather than choosing the first acceptable font.

Possible workflow:

```text
Reference collection
↓
Identify desired personality
↓
Test multiple typefaces
↓
Compare heading use
↓
Compare body use
↓
Check readability
↓
Choose final pairing
```

Free fonts and paid fonts are both viable options; selection should depend on the design need and licensing.

---

# 17. Color System

Color should be deliberate and systematic.

## Color theory

The transcript covers:

- primary colors
- secondary colors
- tertiary colors
- warm colors
- cool colors
- complementary colors
- analogous colors
- triadic colors
- square color schemes
- monochromatic schemes
- hue
- tint
- tone
- shade
- additive RGB
- subtractive CMYK

Use these concepts when constructing palettes.

---

## Palette selection

A useful process:

```text
Reference images
↓
Extract recurring visual colors
↓
Identify primary brand direction
↓
Create supporting colors
↓
Check contrast
↓
Test hierarchy
↓
Create reusable color styles/tokens
```

Do not choose every color independently.

Create a reusable system.

---

## Avoid over-coloring

A recurring theme in the transcript is that excessive color can create visual noise.

Use color intentionally for:

- emphasis
- brand
- status
- hierarchy
- interaction
- differentiation

Do not color everything merely to make it "interesting."

---

# 18. Components

Components are reusable interface building blocks.

Examples:

- button
- navigation
- card
- input
- form field
- status message
- accordion
- modal
- tab
- breadcrumb
- icon
- CTA

Build components once and reuse them.

---

## Component principle

A repeated element should not be independently redrawn on every screen.

Instead:

```text
Component
    ↓
Variants
    ↓
Instances
    ↓
Consistent product
```

---

# 19. Variants and States

A component should be designed for meaningful states.

Common states:

```text
Default
Hover
Focus
Pressed
Disabled
Loading
Success
Error
Selected
Expanded
Collapsed
```

Do not design only the happy path.

---

## State consistency

For example, a button should not behave differently on every page unless there is a clear reason.

Component state should communicate consistently throughout the system.

---

# 20. Design Tokens / Variables

The transcript demonstrates reusable variables for:

- colors
- numbers
- text
- spacing
- modes/themes

Use variables/tokens so that global changes can be made centrally.

### Principle

```text
One source of truth
        ↓
Many components
        ↓
Many screens
```

Instead of manually editing 100 screens, update the underlying token/component.

This makes the design system scalable and maintainable.

---

# 21. Auto Layout

Use Auto Layout for responsive component behavior and reusable structures.

Auto Layout is especially useful for:

- buttons
- cards
- nav items
- lists
- content blocks
- repeated patterns
- responsive groups

### Principle

Prefer relationships over manual pixel positioning when content needs to adapt.

Think:

```text
Content
+ Padding
+ Gap
+ Alignment
→ Component
```

rather than manually placing every element.

---

# 22. Shadows, Borders & Effects

Effects should support hierarchy and interaction.

Use:

- border
- subtle shadow
- blur
- background treatment

when they communicate structure or depth.

Do not add effects merely because the UI feels empty.

### Shadow principle

A restrained shadow can communicate elevation.

An excessive shadow can make the interface noisy.

---

# 23. Interaction & Motion

Motion should communicate:

- feedback
- loading
- state change
- hierarchy
- continuity
- progress

Examples from the transcript:

- loading animation
- progress indicator
- transition between screens
- button state changes

Avoid motion that distracts from the core task.

### Motion rule

> Motion should explain something, not merely decorate something.

---

# 24. Prototyping

A prototype is an interactive model used to test the intended experience before full implementation.

## Prototype levels

### Low fidelity

Rough structure, often:

- sketch
- basic blocks
- basic navigation

### Medium fidelity

More structured and clickable:

- screens connected
- user flow testable
- interaction logic clearer

### High fidelity

Closer to the final product:

- real typography
- real imagery
- real colors
- real component behavior
- realistic navigation

---

## Prototype purpose

Use prototypes to answer:

- Does the flow work?
- Does clicking go to the right place?
- Is the action discoverable?
- Does the interaction feel understandable?
- Are users getting lost?
- Are transitions logical?

---

# 25. Usability Testing

Do not assume the design works because the designer understands it.

Test it.

### Evaluation process

```text
1. Identify target product
2. Define evaluation questions
3. Choose research/testing methods
4. Collect observations/data
5. Analyze findings
6. Identify problems
7. Iterate
```

Possible methods mentioned in the transcript include:

- surveys
- interviews
- observation
- session recordings
- 5-second tests
- card sorting
- first-click testing
- remote/unmoderated testing

---

# 26. Qualitative vs Quantitative Evidence

Use both where appropriate.

### Qualitative

Helps understand:

- why something is confusing
- how users feel
- what users struggle with
- user reasoning
- pain points

### Quantitative

Helps measure:

- frequency
- conversion
- task completion
- performance
- comparative results

Neither replaces the other.

---

# 27. A/B Testing

Use A/B testing to compare design alternatives when the product has enough traffic and the question can be measured.

Example structure:

```text
Variation A → group 1
Variation B → group 2
        ↓
Compare defined outcome
```

Do not run an A/B test merely because two visual variations exist.

First define:

```text
What are we testing?
Why?
What outcome matters?
How will we measure it?
```

---

# 28. Information Architecture & Cognitive Load

Good information architecture helps users understand:

- where they are
- what exists
- how things are grouped
- where to go next
- how to find information

### IA rules

- group related content
- use understandable labels
- keep navigation predictable
- use meaningful categories
- do not bury important information
- avoid unnecessary nesting
- use search when the content set is large
- reduce cognitive load through structure

---

# 29. Search UX

Search is not just an input field.

The transcript highlights details in search suggestions such as:

- clear distinction between entered text and suggestions
- visual hierarchy
- relevant result ordering
- text + metadata
- imagery where useful
- predictable suggestion behavior

### Search design should answer

```text
What did I type?
What are you suggesting?
Why is this result here?
What happens if I select it?
```

Search suggestions should have a consistent visual pattern.

---

# 30. Progressive Disclosure

Do not expose every possible option immediately.

Reveal complexity when it becomes relevant.

Example:

```text
Primary action
↓
Basic options
↓
Advanced options
```

This helps keep the initial interface understandable without removing functionality.

---

# 31. Familiar Patterns

Users already know many interface conventions.

Use familiar patterns for:

- navigation
- buttons
- forms
- search
- breadcrumbs
- accordions
- dialogs
- common icons

A familiar pattern reduces the amount of learning required.

Innovation should happen where it provides real value.

---

# 32. Visual Hierarchy Through Content

Content itself should influence layout.

Before designing, classify information:

```text
PRIMARY
SECONDARY
SUPPORTING
DETAIL
```

Then reflect this through:

- typography
- spacing
- position
- contrast
- component size

Do not give every sentence, card, or feature the same visual weight.

---

# 33. Design System vs Style Guide

## Design System

For larger/complex products.

Should define reusable:

- colors
- typography
- spacing
- grids
- components
- variants
- patterns
- states
- interaction rules
- tokens/variables

The transcript emphasizes that a design-system change can propagate across many screens.

## Style Guide

For simpler projects.

Can define:

- branding
- colors
- typography
- buttons
- visual rules
- key components

The goal is consistency.

---

# 34. Brand & Visual Identity

Brand identity should emerge from the product's intended message.

Start with:

```text
Product character
↓
Reference collection
↓
Color direction
↓
Typography direction
↓
Logo/mark direction
↓
Imagery direction
↓
Component language
```

Do not create a random logo, font, color palette, and imagery independently.

They should belong to the same visual story.

---

# 35. Imagery Strategy

The transcript outlines three broad asset approaches.

## Custom assets

- professional photography
- custom illustration
- custom 3D
- custom visual work

## Ready-made assets

- stock photography
- stock illustration
- free assets
- icons

## AI-generated assets

Can be used as another production method where appropriate.

Regardless of source, imagery should serve the product story.

---

# 36. Website Structure & Content

For content-rich websites, organize pages and sections around user goals.

Common page-level building blocks include:

```text
Navigation
Hero
Core information
Supporting sections
Proof / context
CTA
Contact
Footer
```

The exact order should be determined from the strategy and user journey.

---

# 37. Content + Design Relationship

Design should not treat content as an afterthought.

Design around the actual content as early as possible.

Content affects:

- layout
- hierarchy
- spacing
- image requirements
- page length
- component selection
- responsive behavior

Avoid designing beautiful placeholders that collapse when real content is inserted.

---

# 38. Mobile-First Awareness

Do not finish desktop and "make it responsive" at the end.

Consider mobile constraints during design.

Check:

- text size
- line length
- touch targets
- navigation
- stacked layouts
- image cropping
- spacing
- scrolling
- content priority

A design can look excellent on desktop and still fail in a real mobile context.

---

# 39. Accessibility Checklist

Before handoff, verify:

### Visual

- readable text
- appropriate contrast
- hierarchy is understandable
- status is not communicated by color alone

### Interaction

- controls are reachable
- touch targets have enough space
- focus state is visible
- keyboard navigation is possible
- interactive elements have clear labels

### Content

- images have meaningful alternatives where needed
- headings are logically structured
- error messages are understandable
- instructions are clear

### Responsive

- no accidental horizontal overflow
- content remains readable
- controls remain usable
- hierarchy survives smaller screens

---

# 40. Before / After Design Decision Test

For any important change, record:

```text
CHANGE:
What changed?

REASON:
Why?

USER BENEFIT:
How does this help the user?

BUSINESS/PRODUCT BENEFIT:
How does this support the product goal?

TRADE-OFF:
What did we give up?

VALIDATION:
How can we test whether this decision works?
```

This prevents arbitrary design changes.

---

# 41. AI Design Guardrails

When an AI generates UI, the AI must behave like a designer, not a template generator.

## AI MUST

- start from product goals
- reason about user needs
- establish information hierarchy
- use reusable components
- use a coherent visual language
- maintain consistency
- design all relevant states
- consider accessibility
- consider responsive behavior
- preserve content hierarchy
- avoid unnecessary decoration
- explain major design decisions
- iterate based on evidence

## AI MUST NOT

- generate generic template layouts without understanding the product
- randomly change colors
- use excessive gradients
- add decorative elements without purpose
- use giant empty hero sections without content justification
- overuse rounded cards
- make every element look equally important
- introduce unnecessary animations
- invent functionality
- hide important actions
- rely on color alone for meaning
- ignore mobile
- treat accessibility as optional
- copy competitors blindly
- change a design merely because a trend exists

---

# 42. Anti-AI-Slop Rules

The final product should feel designed by a thoughtful human.

Avoid the visual symptoms of generic AI-generated websites:

- repetitive card grids everywhere
- excessive pill-shaped controls
- huge rounded containers for everything
- gradients used as decoration
- glassmorphism without functional reason
- neon accents without product justification
- random blobs
- meaningless floating shapes
- excessive shadows
- fake testimonials
- fake statistics
- generic AI illustrations
- stock imagery that has no relationship to the story
- arbitrary icon choices
- inconsistent spacing
- too many font styles
- every section having a different visual concept

### Desired feeling

```text
Calm
Clear
Intentional
Useful
Human
Precise
Professional
```

---

# 43. Human Touch

A human-designed product should show evidence of decisions.

Examples:

- carefully chosen hierarchy
- considered spacing
- meaningful grouping
- deliberate typography
- consistent component behavior
- thoughtful empty states
- useful error states
- subtle interaction feedback
- responsive adaptations
- content-aware layouts

The goal is not to make the website look "fancy."

The goal is to make the design feel **intentional**.

---

# 44. Figma Workflow

Recommended project structure:

```text
01 — Strategy
02 — Information Architecture
03 — Wireframes
04 — Design System
05 — High Fidelity Screens
06 — Components & Variants
07 — Responsive
08 — Prototype
09 — Testing / Iterations
10 — Handoff
```

Maintain organized layers, meaningful names, reusable components, and centralized variables/styles.

Use components instead of repeated manual design.

Use variables/tokens for values that are likely to change globally.

---

# 45. Handoff Principles

A design is not complete when the screenshot looks good.

A usable handoff should make implementation understandable.

Document:

- component behavior
- states
- typography
- spacing
- responsive behavior
- interaction behavior
- animations
- edge cases
- accessibility requirements
- content rules
- reusable patterns

Developer handoff should remove ambiguity.

---

# 46. Final Design QA

Before implementation or launch:

### Strategy

- Does the design solve the intended problem?
- Is the primary user goal obvious?

### Structure

- Is the information architecture logical?
- Are sections in the right order?
- Is navigation understandable?

### UI

- Is hierarchy clear?
- Is the typography readable?
- Are colors intentional?
- Are components consistent?
- Is spacing deliberate?

### UX

- Are primary actions obvious?
- Is feedback present?
- Are errors recoverable?
- Are choices manageable?
- Are familiar patterns used where useful?

### Responsive

- Desktop checked
- Tablet checked
- Mobile checked
- No layout breakage
- No unnecessary horizontal scroll

### Accessibility

- Contrast checked
- Focus visible
- Keyboard path considered
- Touch targets appropriate
- Status does not depend only on color
- Text remains readable

### Testing

- Prototype tested
- User feedback collected
- Findings analyzed
- Necessary iterations completed

---

# 47. Design Decision Hierarchy

When design decisions conflict, prioritize approximately in this order:

```text
1. User need
2. Product goal
3. Usability
4. Clarity
5. Accessibility
6. Information hierarchy
7. Consistency
8. Responsive behavior
9. Visual personality
10. Decorative polish
```

Do not sacrifice usability for decoration.

---

# 48. The Design Mantra

Use this throughout the project:

> **Understand first. Structure second. Design third. Test fourth. Refine continuously.**

And for individual UI decisions:

> **Do not ask only "Does this look good?"  
> Ask "Does this help the user understand, decide, navigate, and act?"**

---

# 49. Compact AI Instruction

When this `DESIGN.md` is supplied to an AI coding/design agent, interpret it as follows:

```text
You are not decorating a template.

You are designing a real product.

Start with the user's goal.
Understand the content.
Create clear information architecture.
Establish hierarchy.
Wireframe before polishing.
Use a coherent design system.
Use familiar interaction patterns where useful.
Make important actions easy to reach.
Provide feedback for actions.
Design errors and empty states.
Make the design accessible.
Make responsive behavior intentional.
Reuse components and tokens.
Test the journey.
Iterate based on evidence.
Avoid generic AI aesthetics.

Every major visual decision should have a reason.
Every major interaction should have a user benefit.
Every major layout choice should support hierarchy, clarity, or usability.
```

---

## Source Note

This file is a **design-oriented conversion of the supplied transcript**, not a verbatim copy. The transcript contains teaching, commentary, Figma demonstrations, software-specific actions, examples, and promotional sections; this document retains the parts useful as a reusable UI/UX/web-design specification and converts them into actionable rules.

Source file: `Pasted text(20260919-175203).txt`

