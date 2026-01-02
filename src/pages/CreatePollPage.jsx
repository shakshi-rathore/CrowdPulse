import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "aws-amplify/auth";
import { pollApi } from "@/services/api";
import { Plus, X, Loader, AlertCircle } from "lucide-react";

export default function CreatePollPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [choices, setChoices] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await getCurrentUser();
        setIsAuthenticated(true);
      } catch (error) {
        navigate("/login", { replace: true });
      }
    };

    checkAuth();
  }, [navigate]);

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
      setError("A poll must have at least 2 choices");
      return;
    }
    setChoices(choices.filter((_, i) => i !== index));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!title.trim()) {
      setError("Poll title is required");
      return;
    }

    const filteredChoices = choices.filter((c) => c.trim() !== "");
    if (filteredChoices.length < 2) {
      setError("A poll must have at least 2 choices");
      return;
    }

    setLoading(true);

    try {
      const response = await pollApi.createPoll({
        title: title.trim(),
        choices: filteredChoices,
      });

      // Redirect to poll page
      navigate(`/poll/${response.data.pollId}`, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to create poll"
      );
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            Create a Poll
          </h1>
          <p className="text-gray-600 text-lg">
            Ask your community and get instant feedback
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title Field */}
            <div>
              <label className="block text-lg font-bold text-gray-900 mb-3">
                Poll Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your question?"
                className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-white hover:bg-gray-50 text-gray-900 font-medium text-lg"
              />
              <p className="mt-2 text-sm text-gray-600">
                ✓ Be clear and concise with your question
              </p>
            </div>

            {/* Choices Section */}
            <div>
              <label className="block text-lg font-bold text-gray-900 mb-4">
                Choices <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {choices.map((choice, index) => (
                  <div key={index} className="flex gap-3 group">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={choice}
                        onChange={(e) =>
                          handleChoiceChange(index, e.target.value)
                        }
                        placeholder={`Choice ${index + 1}`}
                        className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-white hover:bg-gray-50 text-gray-900 font-medium"
                      />
                    </div>
                    {choices.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeChoice(index)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove choice"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Choice Button */}
              <button
                type="button"
                onClick={addChoice}
                className="mt-4 w-full flex items-center justify-center gap-2 px-5 py-3 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors font-semibold text-lg"
              >
                <Plus className="w-5 h-5" />
                Add Another Choice
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-indigo-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : null}
              {loading ? "Creating Poll..." : "Create Poll"}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl text-sm border border-blue-200">
            <p className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              💡 Tips for a great poll:
            </p>
            <ul className="space-y-2 text-blue-800">
              <li className="flex gap-2">
                <span className="text-indigo-600 font-bold">✓</span>
                Keep your question clear and specific
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-600 font-bold">✓</span>
                Add 2-5 relevant choices
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-600 font-bold">✓</span>
                Avoid biased or leading questions
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-600 font-bold">✓</span>
                Make it engaging and easy to answer
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
