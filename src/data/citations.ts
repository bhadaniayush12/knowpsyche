// Verified publisher/PubMed identifiers. Evidence and limitations: audit-reports/trust-and-structure.md.
const citations = [
  {
    "title": "The breakdown of vigilance during prolonged visual search",
    "url": "https://doi.org/10.1080/17470214808416738"
  },
  {
    "title": "A wandering mind is an unhappy mind",
    "url": "https://doi.org/10.1126/science.1192439"
  },
  {
    "title": "Brief and rare mental \"breaks\" keep you focused: Deactivation and reactivation of task goals preempt vigilance decrements",
    "url": "https://doi.org/10.1016/j.cognition.2010.12.007"
  },
  {
    "title": "Why is it so hard to do my work? The challenge of attention residue when switching between work tasks",
    "url": "https://doi.org/10.1016/j.obhdp.2009.04.002"
  },
  {
    "title": "A model of the go/no-go task",
    "url": "https://doi.org/10.1037/0096-3445.136.3.389"
  },
  {
    "title": "The attentional cost of receiving a cell phone notification",
    "url": "https://doi.org/10.1037/xhp0000100"
  },
  {
    "title": "Twenty years of haunting eidetic imagery: where's the ghost?",
    "url": "https://doi.org/10.1017/S0140525X00064542"
  },
  {
    "title": "The capacity of visual working memory for features and conjunctions",
    "url": "https://doi.org/10.1038/36846"
  },
  {
    "title": "Exceptional memory",
    "url": "https://pubmed.ncbi.nlm.nih.gov/7181217/"
  },
  {
    "title": "Routes to remembering: the brains behind superior memory",
    "url": "https://doi.org/10.1038/nn988"
  },
  {
    "title": "Eyewitness testimony",
    "url": "https://doi.org/10.1146/annurev.psych.54.101601.145028"
  },
  {
    "title": "The magical number seven, plus or minus two: Some limits on our capacity for processing information",
    "url": "https://doi.org/10.1037/h0043158"
  },
  {
    "title": "The magical number 4 in short-term memory: a reconsideration of mental storage capacity",
    "url": "https://doi.org/10.1017/S0140525X01003922"
  },
  {
    "title": "Working memory",
    "url": "https://doi.org/10.1016/S0079-7421(08)60452-1"
  },
  {
    "title": "Studies of interference in serial verbal reactions",
    "url": "https://doi.org/10.1037/h0054651"
  },
  {
    "title": "Half a century of research on the Stroop effect: An integrative review",
    "url": "https://doi.org/10.1037/0033-2909.109.2.163"
  },
  {
    "title": "Working-memory capacity and the control of attention: The contributions of goal neglect, response competition, and task set to Stroop interference",
    "url": "https://doi.org/10.1037/0096-3445.132.1.47"
  },
  {
    "title": "Factors influencing the latency of simple reaction time",
    "url": "https://doi.org/10.3389/fnhum.2015.00131"
  },
  {
    "title": "A comparative study of visual and auditory reaction times on the basis of gender and physical activity levels of medical first year students",
    "url": "https://doi.org/10.4103/2229-516X.157168"
  },
  {
    "title": "On the speed of mental processes",
    "url": "https://doi.org/10.1016/0001-6918(69)90065-1"
  },
  {
    "title": "On the rate of gain of information",
    "url": "https://doi.org/10.1080/17470215208416600"
  },
  {
    "title": "Stimulus information as a determinant of reaction time",
    "url": "https://doi.org/10.1037/h0056940"
  },
  {
    "title": "Emotional intelligence",
    "url": "https://doi.org/10.2190/DUGG-P24E-52WK-6CDG"
  },
  {
    "title": "The ability model of emotional intelligence: Principles and updates",
    "url": "https://doi.org/10.1177/1754073916639667"
  },
  {
    "title": "The Enneagram: A systematic review of the literature and directions for future research",
    "url": "https://doi.org/10.1002/jclp.23097"
  },
  {
    "title": "The fallacy of personal validation: A classroom demonstration of gullibility",
    "url": "https://doi.org/10.1037/h0059240"
  },
  {
    "title": "Estimating the reproducibility of psychological science",
    "url": "https://doi.org/10.1126/science.aac4716"
  },
  {
    "title": "Rethinking rumination",
    "url": "https://doi.org/10.1111/j.1745-6924.2008.00088.x"
  },
  {
    "title": "The effects of bedtime writing on difficulty falling asleep: A polysomnographic study comparing to-do lists and completed activity lists",
    "url": "https://doi.org/10.1037/xge0000374"
  },
  {
    "title": "Stimulus control applications to the treatment of worry",
    "url": "https://doi.org/10.1016/0005-7967(83)90206-1"
  }
] as const;

export function citationUrl(text: string): string | undefined {
  const normalized = text.replace(/\*/g, "").toLowerCase();
  return citations.find((entry) => normalized.includes(entry.title.toLowerCase()))?.url;
}
