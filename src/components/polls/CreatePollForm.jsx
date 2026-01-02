import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, XCircle } from "lucide-react";
import { createPoll } from "@/lib/api";
import { useNavigate } from "react-router-dom";

export default function CreatePollForm() {
  const navigate = useNavigate();
  const [choices, setChoices] = useState(["", ""]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChoiceChange = (index, value) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    setChoices(newChoices);
  };

  const addChoice = () => {
    setChoices([...choices, ""]);
  };

  const removeChoice = (index) => {
    if (choices.length <= 2) {
      setError("A poll must have at least two choices.");
      return;
    }
    const newChoices = choices.filter((_, i) => i !== index);
    setChoices(newChoices);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const filteredChoices = choices.filter((c) => c.trim() !== "");

    if (!title.trim()) {
      setError("Poll title is required.");
      return;
    }

    if (filteredChoices.length < 2) {
      setError("Poll must have at least two choices.");
      return;
    }

    try {
      setLoading(true);
      const newPoll = await createPoll({ title, choices: filteredChoices });
      navigate(`/poll/${newPoll.pollId}`);
    } catch (err) {
      setError(err.message || "Failed to create poll.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title" className="text-base">
          Poll Title
        </Label>
        <Input
          id="title"
          placeholder="e.g., What's your favorite season?"
          required
          className="text-base py-6"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <Label className="text-base">Choices</Label>
        {choices.map((choice, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              placeholder={`Choice ${index + 1}`}
              value={choice}
              onChange={(e) => handleChoiceChange(index, e.target.value)}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeChoice(index)}
              aria-label="Remove choice"
            >
              <XCircle className="h-5 w-5 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={addChoice}
          className="w-full"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Choice
        </Button>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Create Poll
      </Button>
    </form>
  );
}
