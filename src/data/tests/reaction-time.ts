// Copy from docs/content/part-1.md, "Result bands (visual mode)". Word for word.
export interface ReactionBand {
  /** Upper bound in ms, inclusive. `Infinity` for the last band. */
  max: number;
  badge: string;
  text: string;
}

export const reactionBands: ReactionBand[] = [
  { max: 199, badge: 'Lightning', text: 'Quicker than most people. Great focus — or a very fast screen.' },
  { max: 250, badge: 'Quick', text: 'A little quicker than typical.' },
  { max: 300, badge: 'Steady', text: 'Right where most people land in browser tests.' },
  { max: 400, badge: 'Needs a coffee', text: 'Tiredness, distractions or a laggy device often explain this.' },
  { max: Infinity, badge: 'Running on empty', text: 'Try again on a computer with a mouse, after a short break.' },
];
