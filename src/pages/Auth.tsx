import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", fullName: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "register") {
      const { error } = await signUp(form.email, form.password, form.fullName);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created! Please check your email to verify.");
      }
    } else {
      const { error } = await signIn(form.email, form.password);
      if (error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Welcome back!");
        navigate("/");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left - Brand panel */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/3" />
        <div className="relative text-white text-center">
          <div className="flex flex-col items-center mb-6">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.png"
              alt="Myntra Symbol"
              className="h-24 w-auto drop-shadow-xl"
            />
            <img
              src="https://logos-download.com/wp-content/uploads/2016/10/Myntra_logo.png"
              alt="Myntra"
              className="h-10 w-auto mt-2 brightness-0 invert"
            />
          </div>
          <p className="text-white/80 text-xl font-body max-w-xs leading-relaxed">
            Fashion that speaks your language. Shop the latest trends.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 text-sm">
            {["10M+ Products", "500+ Brands", "Free Returns", "Secure Pay"].map(f => (
              <div key={f} className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 font-body font-semibold">
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 lg:max-w-md flex flex-col justify-center px-6 md:px-12 py-12">
        {/* Logo on mobile */}
        <div className="lg:hidden mb-8 text-center">
          <div className="flex flex-col items-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.png"
              alt="Myntra Symbol"
              className="h-14 w-auto"
            />
            <img
              src="https://logos-download.com/wp-content/uploads/2016/10/Myntra_logo.png"
              alt="Myntra"
              className="h-6 w-auto mt-1"
            />
          </div>
        </div>

        <div className="max-w-sm w-full mx-auto">
          <div>
            <h2 className="font-brand text-3xl font-bold text-foreground">
              {mode === "login" ? "Welcome back!" : "Create account"}
            </h2>
            <p className="text-muted-foreground font-body mt-2 text-sm">
              {mode === "login"
                ? "Login to access your orders, wishlist and more"
                : "Join millions of fashion lovers on Myntra"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex mt-8 mb-6 bg-secondary rounded-xl p-1">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all font-body
                ${mode === "login" ? "bg-card shadow-card text-foreground" : "text-muted-foreground"}`}
            >
              Login
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all font-body
                ${mode === "register" ? "bg-card shadow-card text-foreground" : "text-muted-foreground"}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-body">
            {mode === "register" && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    value={form.fullName}
                    onChange={e => setForm(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="John Doe"
                    required
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                  required
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder={mode === "register" ? "Minimum 6 characters" : "Enter password"}
                  required
                  minLength={6}
                  className="pl-10 pr-10 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-brand text-primary-foreground border-0 h-12 text-base font-bold rounded-xl mt-2"
            >
              {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>

          {mode === "login" && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              By continuing, you agree to our Terms of Use and Privacy Policy.
            </p>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6 font-body">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-primary font-semibold hover:underline"
            >
              {mode === "login" ? "Sign Up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
