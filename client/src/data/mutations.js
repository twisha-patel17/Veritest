export const MUTATION_SUMMARY = {
  score: 85.4,
  tested: 53,
  killed: 41,
  survived: 7,
  equivalent: 3,
  inconclusive: 2,
};

export const DEMO_MUTATIONS = [
  {
    id: "mutation-1",
    location: "proration.js:14",
    mutation: "daysBetween: `<` → `<=`",
    result: "SURVIVED",
    action: "Add boundary test at period end",
  },
  {
    id: "mutation-2",
    location: "proration.js:19",
    mutation: "round(x,2) → round(x,3)",
    result: "SURVIVED",
    action: 'Related candidate: "price rounding"',
  },
  {
    id: "mutation-3",
    location: "proration.js:22",
    mutation: "&& → ||",
    result: "KILLED",
    action: "Rejects end before start",
  },
  {
    id: "mutation-4",
    location: "proration.js:31",
    mutation: "return 0 → return 1",
    result: "KILLED",
    action: "Zero-length period",
  },
  {
    id: "mutation-5",
    location: "proration.js:35",
    mutation: "- → +",
    result: "EQUIVALENT",
    action: "Dead branch, no observable change",
  },
  {
    id: "mutation-6",
    location: "proration.js:40",
    mutation: "amount * rate → amount / rate",
    result: "INCONCLUSIVE",
    action: "No reliable execution result",
  },
];