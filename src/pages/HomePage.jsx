import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { pollApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare, Vote, Loader, AlertCircle } from "lucide-react";

export default function HomePage() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setLoading(true);
        const response = await pollApi.getAllPolls();
        setPolls(response.data);
        setError("");
      } catch (err) {
        console.error("Failed to fetch polls:", err);
        setError("Failed to load polls. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, []);

  const totalVotes = (poll) =>
    poll.choices.reduce((sum, choice) => sum + (choice.count || 0), 0);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Welcome to CrowdPulse
          </span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
          Create, share, and vote on polls instantly. Your opinion matters. Make
          it count.
        </p>
        <div className="pt-2">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
          >
            <Link to="/create">+ Create a New Poll</Link>
          </Button>
        </div>
      </div>

      {/* Polls Section */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Recent Polls</h2>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 font-medium">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-red-600 hover:text-red-800 font-medium text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-slate-400">
                Loading polls...
              </p>
            </div>
          </div>
        ) : polls.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {polls.map((poll) => (
              <Card
                key={poll.id || poll.pollId}
                className="hover:shadow-lg transition-shadow border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="line-clamp-2 text-xl">
                    {poll.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    By {poll.creatorId || "Anonymous"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Vote className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium">{totalVotes(poll)}</span>
                      <span className="text-gray-500 dark:text-slate-400">
                        votes
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">
                        {poll.choices?.length || 0}
                      </span>
                      <span className="text-gray-500 dark:text-slate-400">
                        choices
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Link to={`/poll/${poll.id || poll.pollId}`}>
                      View & Vote →
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg">
            <MessageSquare className="w-12 h-12 text-gray-400 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-slate-400 mb-4">
              No polls yet
            </p>
            <p className="text-gray-500 dark:text-slate-500 text-sm mb-4">
              Be the first to create one!
            </p>
            <Button asChild>
              <Link to="/create">Create a Poll</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
