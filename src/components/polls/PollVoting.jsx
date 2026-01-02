import { useEffect, useState } from "react";
import { castVote } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function PollVoting({ poll, user }) {
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState(null);
  const [error, setError] = useState("");
  const [pollData, setPollData] = useState(poll);

  const totalVotes = pollData.choices.reduce(
    (sum, choice) => sum + choice.count,
    0
  );

  const handleVote = async (choiceId) => {
    if (!user) {
      setError("You must be logged in to vote.");
      return;
    }

    try {
      setLoading(true);
      setSelectedChoiceId(choiceId);
      await castVote(pollData.pollId, choiceId);

      // Update local poll data
      const updatedPoll = {
        ...pollData,
        choices: pollData.choices.map((c) =>
          c.id === choiceId ? { ...c, count: c.count + 1 } : c
        ),
      };
      setPollData(updatedPoll);
      setVoted(true);
    } catch (err) {
      setError(err.message || "Failed to cast vote.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardContent>
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {pollData.choices.map((choice) => {
          const percentage =
            totalVotes > 0 ? (choice.count / totalVotes) * 100 : 0;
          const isSelected = selectedChoiceId === choice.id;

          return (
            <div key={choice.id}>
              {voted ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span>{choice.text}</span>
                    <span className="text-muted-foreground">
                      {percentage.toFixed(1)}% ({choice.count} votes)
                    </span>
                  </div>
                  <Progress value={percentage} />
                </div>
              ) : (
                <Button
                  onClick={() => handleVote(choice.id)}
                  variant="outline"
                  className="w-full justify-start h-12 text-base"
                  disabled={!user || loading}
                >
                  {loading && isSelected && (
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" />
                  )}
                  {choice.text}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {!user && (
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Please log in to vote
          </p>
        </div>
      )}
    </CardContent>
  );
}
