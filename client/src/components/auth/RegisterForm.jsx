
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function RegisterForm() {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const entrance = {
    hidden: {
      opacity: 0,
      y: reduceMotion ? 0 : 12,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0 : 0.35,
        ease: "easeOut",
      },
    },
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const normalizedName = name.trim();
    const normalizedEmail = email.trim();

    if (
      !normalizedName ||
      !normalizedEmail ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (normalizedName.length < 2 || normalizedName.length > 80) {
      setError("Name must contain between 2 and 80 characters.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8 || password.length > 72) {
      setError("Password must contain between 8 and 72 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: normalizedName,
        email: normalizedEmail,
        password,
      });

      navigate("/dashboard", { replace: true });
    } catch (err) {
      const status = err.response?.status;

      if (status === 409) {
        setError(
          "An account with this email already exists. Try signing in."
        );
      } else if (status === 400) {
        setError(
          err.response?.data?.message ||
            "Please check your details and try again."
        );
      } else if (status === 429) {
        setError(
          "Too many attempts. Please wait a moment and try again."
        );
      } else if (err.response) {
        setError(
          err.response.data?.message ||
            "Unable to create your account. Please try again."
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
            <circle
              cx="29.5"
              cy="28.5"
              r="4.5"
              fill="#0B0D0F"
            />
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
        transition={{ delay: reduceMotion ? 0 : 0.08 }}
        className="mt-7"
      >
        <h1 className="text-2xl font-bold tracking-tight text-[#f1f3f5]">
          Create your account
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#a2adbc]">
          Start finding out what your tests actually catch.
        </p>
      </motion.div>

      {/* Registration form */}
      <motion.form
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: reduceMotion ? 0 : 0.07,
              delayChildren: reduceMotion ? 0 : 0.12,
            },
          },
        }}
        initial="hidden"
        animate="visible"
        onSubmit={handleSubmit}
        className="mt-6 space-y-4"
        noValidate
      >
        {/* Name */}
        <motion.div variants={entrance}>
          <label
            htmlFor="register-name"
            className="mb-2 block text-sm text-[#a2adbc]"
          >
            Full name
          </label>

          <input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            maxLength={80}
            disabled={isLoading}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
            className="h-10 w-full rounded-md border border-[#252b33] bg-[#111419] px-3 text-sm text-[#f1f3f5] outline-none transition focus:border-[#80e8bf] focus:ring-2 focus:ring-[#80e8bf]/10 disabled:opacity-60"
          />
        </motion.div>

        {/* Email */}
        <motion.div variants={entrance}>
          <label
            htmlFor="register-email"
            className="mb-2 block text-sm text-[#a2adbc]"
          >
            Email
          </label>

          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
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
            htmlFor="register-password"
            className="mb-2 block text-sm text-[#a2adbc]"
          >
            Password
          </label>

          <div className="flex h-10 items-center rounded-md border border-[#252b33] bg-[#111419] transition focus-within:border-[#80e8bf] focus-within:ring-2 focus-within:ring-[#80e8bf]/10">
            <input
              id="register-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={72}
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

          <p className="mt-1.5 text-xs text-[#737e8d]">
            Use at least 8 characters.
          </p>
        </motion.div>

        {/* Confirm password */}
        <motion.div variants={entrance}>
          <label
            htmlFor="register-confirm-password"
            className="mb-2 block text-sm text-[#a2adbc]"
          >
            Confirm password
          </label>

          <div className="flex h-10 items-center rounded-md border border-[#252b33] bg-[#111419] transition focus-within:border-[#80e8bf] focus-within:ring-2 focus-within:ring-[#80e8bf]/10">
            <input
              id="register-confirm-password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              disabled={isLoading}
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setError("");
              }}
              className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-[#f1f3f5] outline-none disabled:opacity-60"
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword((current) => !current)
              }
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
              aria-pressed={showConfirmPassword}
              className="mr-1.5 inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs text-[#a2adbc] transition hover:text-[#80e8bf] focus-visible:outline-2 focus-visible:outline-[#80e8bf]"
            >
              {showConfirmPassword ? (
                <EyeOff size={15} />
              ) : (
                <Eye size={15} />
              )}
              {showConfirmPassword ? "Hide" : "Show"}
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
            {isLoading ? "Creating account..." : "Create account"}
          </motion.button>
        </motion.div>
      </motion.form>

      {/* Login link */}
      <motion.p
        variants={entrance}
        initial="hidden"
        animate="visible"
        transition={{ delay: reduceMotion ? 0 : 0.5 }}
        className="mt-5 text-sm text-[#a2adbc]"
      >
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-[#80b5ff] transition-colors hover:text-[#a4ccff]"
        >
          Sign in
        </Link>
      </motion.p>
    </section>
  );
}

export default RegisterForm;
