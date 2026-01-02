import { Activity, LogOut, User } from "lucide-react";
import { signOut } from "aws-amplify/auth";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60">
      <div className="container max-w-6xl mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="hidden sm:inline bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            CrowdPulse
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2 sm:gap-4">
          {user ? (
            <>
              <Button asChild variant="default">
                <Link to="/create">+ Create Poll</Link>
              </Button>

              <div className="flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-slate-700">
                <div className="hidden sm:flex flex-col items-end">
                  <p className="text-xs font-medium text-gray-900 dark:text-slate-100">
                    {user.attributes?.email || user.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Signed in
                  </p>
                </div>

                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors disabled:opacity-50"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5 text-gray-600 dark:text-slate-400" />
                </button>
              </div>
            </>
          ) : (
            <Button asChild variant="default">
              <Link to="/login" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
