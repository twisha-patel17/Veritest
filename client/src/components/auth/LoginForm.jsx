
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function LoginForm() {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const entrance = {
    hidden: {
      opacity: 0,
      y: reduceMotion ? 0 : 14,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0 : 0.4,
        ease: "easeOut",
      },
    },
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsLoading(true);

    try {
      await login({
        email: normalizedEmail,
        password,
      });

      navigate("/dashboard", { replace: true });
    } catch (err) {
      const status = err.response?.status;

      if (status === 400 || status === 401) {
        setError(
          err.response?.data?.message ||
            "Invalid email or password."
        );
      } else if (status === 429) {
        setError(
          "Too many attempts. Please wait a moment and try again."
        );
      } else if (err.response) {
        setError(
          err.response.data?.message ||
            "Unable to sign in. Please try again."
        );
      } else if (err.request) {
        setError(
          "Cannot connect to Veritest. Please check that the server is running."
        );
      } else {
        setError(
          err.message || "Something went wrong. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full max-w-[400px]">
      {/* Veritest brand */}
      <motion.div
        variants={entrance}
        initial="hidden"
        animate="visible"
      >
        <Link to="/" className="inline-flex items-center gap-2.5">
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-9 w-9 shrink-0"
            aria-hidden="true"
          >
            <rect
              x="1"
              y="1"
              width="38"
              height="38"
              rx="11"
              fill="#12251E"
              stroke="#285541"
            />
            <path
              d="M20 7.5L29 11V19C29 25.2 25.1 29.3 20 32C14.9 29.3 11 25.2 11 19V11L20 7.5Z"
              stroke="#80E8BF"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M15.5 19.5L18.5 22.5L24.8 16"
              stroke="#80E8BF"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="29.5" cy="28.5" r="4.5" fill="#0B0D0F" />
            <path
              d="M28 27L29.5 28.5L28 30"
              stroke="#80E8BF"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M30.5 30H32"
              stroke="#80E8BF"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>

          <span className="text-base font-semibold tracking-tight text-[#f1f3f5]">
            Veri<span className="text-[#80e8bf]">test</span>
          </span>
        </Link>
      </motion.div>

      {/* Heading */}
      <motion.div
        variants={entrance}
        initial="hidden"
        animate="visible"
        transition={{
          delay: reduceMotion ? 0 : 0.08,
        }}
        className="mt-9"
      >
        <h1 className="text-2xl font-bold tracking-tight text-[#f1f3f5]">
          Sign in
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#a2adbc]">
          Welcome back to your workspace.
        </p>
      </motion.div>

      {/* Login form */}
      <motion.form
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: reduceMotion ? 0 : 0.09,
              delayChildren: reduceMotion ? 0 : 0.18,
            },
          },
        }}
        initial="hidden"
        animate="visible"
        onSubmit={handleSubmit}
        className="mt-7 space-y-6"
        noValidate
      >
        {/* Email */}
        <motion.div variants={entrance}>
          <label
            htmlFor="login-email"
            className="mb-2 block text-sm text-[#a2adbc]"
          >
            Email
          </label>

          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isLoading}
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
            }}
            className="h-10 w-full rounded-md border border-[#252b33] bg-[#111419] px-3 text-sm text-[#f1f3f5] outline-none transition focus:border-[#80e8bf] focus:ring-2 focus:ring-[#80e8bf]/10 disabled:opacity-60"
          />
        </motion.div>

        {/* Password */}
        <motion.div variants={entrance}>
          <label
            htmlFor="login-password"
            className="mb-2 block text-sm text-[#a2adbc]"
          >
            Password
          </label>

          <div className="flex h-10 items-center rounded-md border border-[#252b33] bg-[#111419] transition focus-within:border-[#80e8bf] focus-within:ring-2 focus-within:ring-[#80e8bf]/10">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              disabled={isLoading}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-[#f1f3f5] outline-none disabled:opacity-60"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword((current) => !current)
              }
              aria-label={
                showPassword ? "Hide password" : "Show password"
              }
              aria-pressed={showPassword}
              className="mr-1.5 inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs text-[#a2adbc] transition hover:text-[#80e8bf] focus-visible:outline-2 focus-visible:outline-[#80e8bf]"
            >
              {showPassword ? (
                <EyeOff size={15} />
              ) : (
                <Eye size={15} />
              )}
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </motion.div>

        {/* Error feedback */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: reduceMotion ? 0 : -5 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="text-xs leading-5 text-[#ff8b92]"
          >
            {error}
          </motion.p>
        )}

        {/* Submit */}
        <motion.div variants={entrance} className="pt-1">
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={
              reduceMotion || isLoading ? undefined : { y: -1 }
            }
            whileTap={
              reduceMotion || isLoading
                ? undefined
                : { scale: 0.99 }
            }
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#80e8bf] px-4 text-sm font-semibold text-[#102019] transition-colors hover:bg-[#a0f2d1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#80e8bf] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading && (
              <LoaderCircle size={16} className="animate-spin" />
            )}
            {isLoading ? "Signing in..." : "Sign in"}
          </motion.button>
        </motion.div>
      </motion.form>

      {/* Registration link */}
      <motion.p
        variants={entrance}
        initial="hidden"
        animate="visible"
        transition={{
          delay: reduceMotion ? 0 : 0.55,
        }}
        className="mt-5 text-sm text-[#a2adbc]"
      >
        New to Veritest?{" "}
        <Link
          to="/register"
          className="font-medium text-[#80b5ff] transition-colors hover:text-[#a4ccff]"
        >
          Create an account
        </Link>
      </motion.p>
    </section>
  );
}

export default LoginForm;
