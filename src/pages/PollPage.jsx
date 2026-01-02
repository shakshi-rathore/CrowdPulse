import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCurrentUser } from "aws-amplify/auth";
import { pollApi } from "@/services/api";
import QRCodeStyling from "qr-code-styling";
import {
  Loader,
  AlertCircle,
  CheckCircle,
  LogIn,
  Share2,
  Copy,
  Download,
  Eye,
  MessageCircle,
  X,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";

export default function PollPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const qrRef = useRef();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [views, setViews] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const [qrImage, setQrImage] = useState(null);

  // ✅ HELPER: Process API Data (Fixes Array vs Object issue)
  const processPollData = (data) => {
    // If API returns an array [{...}], grab the first item. Otherwise use data as is.
    return Array.isArray(data) ? data[0] : data;
  };

  // 1. Initial Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Check Auth
        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          setUser(null);
        }

        // Fetch Poll
        const response = await pollApi.getPoll(id);
        const cleanPoll = processPollData(response.data); // ✅ Use helper
        setPoll(cleanPoll);

        // View Counter
        const viewsKey = `poll_views_${id}`;
        const storedViews = parseInt(localStorage.getItem(viewsKey)) || 0;
        setViews(storedViews + 1);
        localStorage.setItem(viewsKey, storedViews + 1);

        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load poll");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ✅ 2. REAL-TIME UPDATES (Auto-refresh every 5 seconds)
  useEffect(() => {
    if (!id) return;
    const interval = setInterval(async () => {
      try {
        const response = await pollApi.getPoll(id);
        setPoll(processPollData(response.data));
      } catch (err) {
        console.error("Background update failed", err);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [id]);

  // Generate QR code when modal opens
  useEffect(() => {
    if (showShareModal && !qrImage) {
      const pollUrl = `${window.location.origin}/poll/${id}`;
      const qrCode = new QRCodeStyling({
        width: 200,
        height: 200,
        data: pollUrl,
        margin: 10,
        type: "image/png",
        qrOptions: {
          typeNumber: 0,
          mode: "Byte",
          errorCorrectionLevel: "H",
        },
        imageOptions: {
          hideBackgroundDots: false,
          imageSize: 0.4,
          margin: 0,
        },
      });
      
      qrCode.getRawData("png").then((url) => {
        setQrImage(url);
      });
    }
  }, [showShareModal, id, qrImage]);

  const handleVote = async (choiceId) => {
    if (!user) {
      navigate("/login", { state: { returnTo: `/poll/${id}` } });
      return;
    }

    setVoting(true);
    setError("");

    try {
      await pollApi.vote(id, choiceId);
      setVoted(true);

      // Refetch immediately
      const response = await pollApi.getPoll(id);
      setPoll(processPollData(response.data));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit vote");
    } finally {
      setVoting(false);
    }
  };

  const pollUrl = `${window.location.origin}/poll/${id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pollUrl);
      setCopyMessage("Copied to clipboard!");
      setTimeout(() => setCopyMessage(""), 2000);
    } catch (err) {
      setCopyMessage("Failed to copy");
    }
  };

  const downloadQRCode = () => {
    if (qrImage) {
      const link = document.createElement("a");
      link.href = qrImage;
      link.download = `poll-${id}-qr.png`;
      link.click();
    }
  };

  const shareOnSocial = (platform) => {
    const text = `Check out this poll: ${poll?.title}`;
    const encodedUrl = encodeURIComponent(pollUrl);
    const encodedText = encodeURIComponent(text);

    let shareUrl;
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      default:
        return;
    }
    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading poll...</p>
        </div>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="py-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Poll</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={() => navigate("/")}
                className="mt-3 text-red-600 hover:text-red-800 font-medium text-sm"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="py-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Poll not found</p>
            <button
              onClick={() => navigate("/")}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ SAFELY GET & NORMALIZE CHOICES
  // Handles cases where API returns strings ['A','B'] instead of objects
  const rawChoices = poll.choices || poll.options || [];
  
  const choicesData = rawChoices.map((choice, index) => {
    if (typeof choice === 'string') {
      return {
        id: index,
        text: choice,
        count: 0
      };
    }
    return {
      id: choice.id || choice._id || index,
      text: choice.text || choice.option || "Option",
      count: choice.count !== undefined ? choice.count : (choice.votes || 0)
    };
  });

  // Calculate Total Votes
  const totalVotes = choicesData.reduce((acc, curr) => acc + curr.count, 0);

  // Safe Title
  const pollTitle = poll.title || poll.question || poll.topic || "Untitled Poll";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Poll Header with Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {pollTitle}
              </h1>
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-indigo-600" />
                  <span className="text-gray-700">
                    <span className="font-bold text-indigo-600">
                      {totalVotes}
                    </span>{" "}
                    {totalVotes === 1 ? "vote" : "votes"}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-2 rounded-lg">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">
                    <span className="font-bold text-blue-600">{views}</span>{" "}
                    views
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-pink-50 to-rose-50 px-4 py-2 rounded-lg">
                  <span className="text-gray-700">
                    <span className="font-bold text-pink-600">
                      {choicesData.length}
                    </span>{" "}
                    choices
                  </span>
                </div>
              </div>
            </div>
            {/* Share Button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all font-semibold"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {voted && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3 animate-pulse">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 text-sm font-semibold">
              ✓ Your vote has been recorded!
            </p>
          </div>
        )}

        {/* Login Prompt */}
        {!user && !voted && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 flex gap-4 items-center justify-between">
            <div className="flex gap-3 items-center">
              <LogIn className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <p className="text-blue-800 font-semibold">
                Sign in to vote on this poll
              </p>
            </div>
            <button
              onClick={() =>
                navigate("/login", { state: { returnTo: `/poll/${id}` } })
              }
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors whitespace-nowrap"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Choices List */}
        <div className="space-y-4 mb-8">
          {choicesData.map((choice) => {
            const percentage =
              totalVotes > 0 ? (choice.count / totalVotes) * 100 : 0;

            return (
              <div key={choice.id} className="group cursor-pointer">
                <button
                  onClick={() => handleVote(choice.id)}
                  disabled={voting || voted || !user}
                  className={`w-full text-left p-6 rounded-xl border-2 transition-all ${
                    !user || voted
                      ? "border-gray-200 bg-white cursor-not-allowed opacity-75"
                      : "border-gray-200 bg-white hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900 text-lg">
                      {choice.text}
                    </span>
                    <span className="text-lg font-bold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
                      {choice.count} {choice.count === 1 ? "vote" : "votes"}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-sm">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="mt-2 text-right">
                    <span className="text-sm font-bold text-gray-700">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Vote Loading Indicator */}
        {voting && (
          <div className="mb-6 flex items-center justify-center gap-2 text-indigo-600 bg-indigo-50 p-4 rounded-xl">
            <Loader className="w-5 h-5 animate-spin" />
            <span className="font-semibold">Submitting your vote...</span>
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="text-indigo-600 hover:text-indigo-800 font-semibold text-base transition-colors"
        >
          ← Back to Polls
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Share Poll</h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* QR Code */}
            <div className="mb-6 flex flex-col items-center">
              <p className="text-sm text-gray-600 mb-3 font-medium">
                Scan to Share
              </p>
              <div className="bg-white p-3 border-2 border-gray-200 rounded-lg">
                {qrImage ? (
                  <img src={qrImage} alt="Poll QR Code" className="w-48 h-48" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center bg-gray-50 rounded">
                    <Loader className="w-8 h-8 animate-spin text-indigo-600" />
                  </div>
                )}
              </div>
              <button
                onClick={downloadQRCode}
                disabled={!qrImage}
                className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Download QR Code
              </button>
            </div>

            {/* Link Sharing */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2 font-medium">
                Share Link
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pollUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
              {copyMessage && (
                <p className="text-sm text-green-600 mt-2 font-medium">
                  {copyMessage}
                </p>
              )}
            </div>

            {/* Social Sharing */}
            <div>
              <p className="text-sm text-gray-600 mb-3 font-medium">
                Share on Social Media
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => shareOnSocial("facebook")}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </button>
                <button
                  onClick={() => shareOnSocial("twitter")}
                  className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-semibold transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </button>
                <button
                  onClick={() => shareOnSocial("linkedin")}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </button>
                <button
                  onClick={() => shareOnSocial("whatsapp")}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                >
                  💬 WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}