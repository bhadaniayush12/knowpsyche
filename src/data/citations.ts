// Verified publisher/PubMed identifiers. Evidence and limitations: audit-reports/trust-and-structure.md.
const citations = [
  {
    "author": "Mackworth",
    "year": "1948",
    "title": "The breakdown of vigilance during prolonged visual search",
    "url": "https://doi.org/10.1080/17470214808416738"
  },
  {
    "author": "Killingsworth",
    "year": "2010",
    "title": "A wandering mind is an unhappy mind",
    "url": "https://doi.org/10.1126/science.1192439"
  },
  {
    "author": "Ariga",
    "year": "2011",
    "title": "Brief and rare mental \"breaks\" keep you focused: Deactivation and reactivation of task goals preempt vigilance decrements",
    "url": "https://doi.org/10.1016/j.cognition.2010.12.007"
  },
  {
    "author": "Leroy",
    "year": "2009",
    "title": "Why is it so hard to do my work? The challenge of attention residue when switching between work tasks",
    "url": "https://doi.org/10.1016/j.obhdp.2009.04.002"
  },
  {
    "author": "Gomez",
    "year": "2007",
    "title": "A model of the go/no-go task",
    "url": "https://doi.org/10.1037/0096-3445.136.3.389"
  },
  {
    "author": "Stothart",
    "year": "2015",
    "title": "The attentional cost of receiving a cell phone notification",
    "url": "https://doi.org/10.1037/xhp0000100"
  },
  {
    "author": "Haber",
    "year": "1979",
    "title": "Twenty years of haunting eidetic imagery: where's the ghost?",
    "url": "https://doi.org/10.1017/S0140525X00064542"
  },
  {
    "author": "Luck",
    "year": "1997",
    "title": "The capacity of visual working memory for features and conjunctions",
    "url": "https://doi.org/10.1038/36846"
  },
  {
    "author": "Ericsson",
    "year": "1982",
    "title": "Exceptional memory",
    "url": "https://pubmed.ncbi.nlm.nih.gov/7181217/"
  },
  {
    "author": "Maguire",
    "year": "2003",
    "title": "Routes to remembering: the brains behind superior memory",
    "url": "https://doi.org/10.1038/nn988"
  },
  {
    "author": "Wells",
    "year": "2003",
    "title": "Eyewitness testimony",
    "url": "https://doi.org/10.1146/annurev.psych.54.101601.145028"
  },
  {
    "author": "Miller",
    "year": "1956",
    "title": "The magical number seven, plus or minus two: Some limits on our capacity for processing information",
    "url": "https://doi.org/10.1037/h0043158"
  },
  {
    "author": "Cowan",
    "year": "2001",
    "title": "The magical number 4 in short-term memory: a reconsideration of mental storage capacity",
    "url": "https://doi.org/10.1017/S0140525X01003922"
  },
  {
    "author": "Baddeley",
    "year": "1974",
    "title": "Working memory",
    "url": "https://doi.org/10.1016/S0079-7421(08)60452-1"
  },
  {
    "author": "Stroop",
    "year": "1935",
    "title": "Studies of interference in serial verbal reactions",
    "url": "https://doi.org/10.1037/h0054651"
  },
  {
    "author": "MacLeod",
    "year": "1991",
    "title": "Half a century of research on the Stroop effect: An integrative review",
    "url": "https://doi.org/10.1037/0033-2909.109.2.163"
  },
  {
    "author": "Kane",
    "year": "2003",
    "title": "Working-memory capacity and the control of attention: The contributions of goal neglect, response competition, and task set to Stroop interference",
    "url": "https://doi.org/10.1037/0096-3445.132.1.47"
  },
  {
    "author": "Woods",
    "year": "2015",
    "title": "Factors influencing the latency of simple reaction time",
    "url": "https://doi.org/10.3389/fnhum.2015.00131"
  },
  {
    "author": "Jain",
    "year": "2015",
    "title": "A comparative study of visual and auditory reaction times on the basis of gender and physical activity levels of medical first year students",
    "url": "https://doi.org/10.4103/2229-516X.157168"
  },
  {
    "author": "Donders",
    "year": "1969",
    "title": "On the speed of mental processes",
    "url": "https://doi.org/10.1016/0001-6918(69)90065-1"
  },
  {
    "author": "Hick",
    "year": "1952",
    "title": "On the rate of gain of information",
    "url": "https://doi.org/10.1080/17470215208416600"
  },
  {
    "author": "Hyman",
    "year": "1953",
    "title": "Stimulus information as a determinant of reaction time",
    "url": "https://doi.org/10.1037/h0056940"
  },
  {
    "author": "Salovey",
    "year": "1990",
    "title": "Emotional intelligence",
    "url": "https://doi.org/10.2190/DUGG-P24E-52WK-6CDG"
  },
  {
    "author": "Mayer",
    "year": "2016",
    "title": "The ability model of emotional intelligence: Principles and updates",
    "url": "https://doi.org/10.1177/1754073916639667"
  },
  {
    "author": "Hook",
    "year": "2021",
    "title": "The Enneagram: A systematic review of the literature and directions for future research",
    "url": "https://doi.org/10.1002/jclp.23097"
  },
  {
    "author": "Forer",
    "year": "1949",
    "title": "The fallacy of personal validation: A classroom demonstration of gullibility",
    "url": "https://doi.org/10.1037/h0059240"
  },
  {
    "author": "Open Science Collaboration",
    "year": "2015",
    "title": "Estimating the reproducibility of psychological science",
    "url": "https://doi.org/10.1126/science.aac4716"
  },
  {
    "author": "Nolen-Hoeksema",
    "year": "2008",
    "title": "Rethinking rumination",
    "url": "https://doi.org/10.1111/j.1745-6924.2008.00088.x"
  },
  {
    "author": "Scullin",
    "year": "2018",
    "title": "The effects of bedtime writing on difficulty falling asleep: A polysomnographic study comparing to-do lists and completed activity lists",
    "url": "https://doi.org/10.1037/xge0000374"
  },
  {
    "author": "Borkovec",
    "year": "1983",
    "title": "Stimulus control applications to the treatment of worry",
    "url": "https://doi.org/10.1016/0005-7967(83)90206-1"
  }
] as const;

export function citationUrl(text: string): string | undefined {
  const normalized = text.replace(/\*/g, '').toLowerCase();
  return citations.find((entry) =>
    normalized.startsWith(entry.author.toLowerCase() + (entry.author === 'Open Science Collaboration' ? '.' : ',')) &&
    normalized.includes(`(${entry.year})`) &&
    normalized.includes(entry.title.toLowerCase()),
  )?.url;
}
