import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  signUp,
  signIn,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
  getCurrentUser,
} from "aws-amplify/auth";
import {
  Mail,
  Lock,
  AlertCircle,
  Loader,
  Eye,
  EyeOff,
  CheckCircle,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signUpMode, setSignUpMode] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [waitingForCode, setWaitingForCode] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    // Check if already logged in
    const checkAuth = async () => {
      try {
        await getCurrentUser();
        navigate("/", { replace: true });
      } catch (error) {
        // Not logged in, proceed with login
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
        },
      });
      setWaitingForCode(true);
      // ❌ REMOVED: setPassword("");
      // We keep the password in state so we can use it for auto-login later
    } catch (err) {
      setError(err.message || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSignUp = async (e) => {
    e.preventDefault();
    if (!confirmationCode) {
      setError("Please enter the confirmation code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await confirmSignUp({ username: email, confirmationCode });

      // ✅ Check if we still have the password
      if (password) {
        await signIn({ username: email, password });
        navigate("/", { replace: true });
      } else {
        // If password was lost, switch to Sign In tab so they can type it again
        setWaitingForCode(false);
        setSignUpMode(false);
        alert("Account confirmed! Please sign in.");
      }
    } catch (err) {
      setError(err.message || "Confirmation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signIn({ username: email, password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await resetPassword({ username: email });
      setResetMode(true);
    } catch (err) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    if (!resetCode || !newPassword) {
      setError("Please enter code and new password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: resetCode,
        newPassword,
      });
      setError("");
      setResetMode(false);
      setSignUpMode(false);
      alert("Password reset successfully! Please sign in.");
      setNewPassword("");
      setResetCode("");
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-10 w-56 h-56 bg-white opacity-5 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-8 h-8 text-white" />
            <h1 className="text-4xl font-bold text-white">CrowdPulse</h1>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-indigo-100 text-lg">Instant Polling Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => {
                setSignUpMode(false);
                setError("");
                setWaitingForCode(false);
                setResetMode(false);
              }}
              className={`flex-1 pb-2 pt-2 px-4 font-semibold rounded-md transition-all ${
                !signUpMode && !resetMode
                  ? "bg-white text-indigo-600 shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setSignUpMode(true);
                setError("");
                setWaitingForCode(false);
                setResetMode(false);
              }}
              className={`flex-1 pb-2 pt-2 px-4 font-semibold rounded-md transition-all ${
                signUpMode && !resetMode
                  ? "bg-white text-indigo-600 shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Forms */}
          {!waitingForCode && !resetMode ? (
            <form
              onSubmit={signUpMode ? handleSignUp : handleSignIn}
              className="space-y-5"
            >
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {!signUpMode && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-indigo-600 hover:text-indigo-700 mt-2 font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-indigo-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : null}
                {signUpMode ? "Create Account" : "Sign In"}
              </button>
            </form>
          ) : resetMode ? (
            <form onSubmit={handleConfirmReset} className="space-y-5">
              <p className="text-gray-600 text-sm mb-4">
                Enter the code sent to <strong>{email}</strong> and your new
                password
              </p>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reset Code
                </label>
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="123456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-indigo-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : null}
                Reset Password
              </button>
              <button
                type="button"
                onClick={() => setResetMode(false)}
                className="w-full text-indigo-600 hover:text-indigo-700 font-medium py-2 transition-colors"
              >
                Back to Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleConfirmSignUp} className="space-y-5">
              <p className="text-gray-600 text-sm mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Confirmation code sent to <strong>{email}</strong>
              </p>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmation Code
                </label>
                <input
                  type="text"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  placeholder="123456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 text-center text-lg tracking-widest"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-indigo-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : null}
                Confirm Email
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500 font-medium">
                or try demo mode
              </span>
            </div>
          </div>

          {/* Demo Info */}
          <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg text-sm border border-blue-200">
            <p className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Demo Credentials
            </p>
            <div className="space-y-1 text-blue-800">
              <p>
                📧 Email:{" "}
                <code className="bg-white px-2 py-1 rounded text-xs">
                  demo@example.com
                </code>
              </p>
              <p>
                🔒 Password:{" "}
                <code className="bg-white px-2 py-1 rounded text-xs">
                  Demo123!
                </code>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
