// In-memory store to simulate a database
let polls = [
  {
    pollId: "1",
    title: "What is your favorite programming language?",
    creatorId: "user_123",
    choices: [
      { id: "c1", text: "JavaScript", count: 5 },
      { id: "c2", text: "Python", count: 10 },
      { id: "c3", text: "Rust", count: 3 },
    ],
  },
  {
    pollId: "2",
    title: "Dark mode or light mode?",
    creatorId: "user_456",
    choices: [
      { id: "c4", text: "Dark Mode", count: 15 },
      { id: "c5", text: "Light Mode", count: 2 },
    ],
  },
];

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get all polls
 */
export async function getPolls() {
  await delay(50);
  return JSON.parse(JSON.stringify(polls));
}

/**
 * Get a specific poll by ID
 */
export async function getPoll(id) {
  await delay(50);
  const poll = polls.find((p) => p.pollId === id);
  return poll ? JSON.parse(JSON.stringify(poll)) : null;
}

/**
 * Create a new poll
 */
export async function createPoll(data) {
  await delay(100);
  const newPoll = {
    pollId: `poll_${new Date().getTime()}`,
    title: data.title,
    creatorId: "current_user",
    choices: data.choices.map((text, index) => ({
      id: `choice_${new Date().getTime()}_${index}`,
      text,
      count: 0,
    })),
  };
  polls.unshift(newPoll);
  return JSON.parse(JSON.stringify(newPoll));
}

/**
 * Cast a vote on a poll choice
 */
export async function castVote(pollId, choiceId) {
  await delay(100);
  const pollIndex = polls.findIndex((p) => p.pollId === pollId);
  if (pollIndex === -1) {
    throw new Error("Poll not found");
  }

  const choiceIndex = polls[pollIndex].choices.findIndex(
    (c) => c.id === choiceId
  );
  if (choiceIndex === -1) {
    throw new Error("Choice not found");
  }

  polls[pollIndex].choices[choiceIndex].count++;

  return { success: true };
}
