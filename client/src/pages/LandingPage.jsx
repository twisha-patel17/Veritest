
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";

function LandingPage() {
  const reduceMotion = useReducedMotion();

  const reveal = {
    hidden: {
      opacity: 0,
      y: reduceMotion ? 0 : 16,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0 : 0.45,
        ease: "easeOut",
      },
    },
  };

  return (
    <main className="min-h-screen overflow-x-clip bg-[#0b0d0f] text-[#f1f3f5]">
      <div className="mx-auto min-w-0 max-w-[1160px] px-4 sm:px-6 md:px-8">
        {/* Navigation */}
        <nav className="flex min-h-[64px] items-center justify-between gap-3 border-b border-[#252a30] py-3 sm:min-h-[72px] sm:gap-4 sm:py-0">
          {/* Brand */}
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2"
            aria-label="Veritest home"
          >
            <svg
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 shrink-0 sm:h-9 sm:w-9"
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

            <span className="text-sm font-semibold tracking-tight text-[#f1f3f5] sm:text-base">
              Veri<span className="text-[#80e8bf]">test</span>
            </span>
          </Link>

          {/* Desktop navigation links */}
          <div className="hidden items-center gap-5 text-sm text-[#a2abb8] md:flex lg:gap-6">
            <a
              href="#how-it-works"
              className="transition-colors hover:text-white"
            >
              How it works
            </a>
            <a
              href="#principles"
              className="transition-colors hover:text-white"
            >
              Principles
            </a>
          </div>

          {/* Authentication actions */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <motion.div
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            >
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-md border border-[#292f37] px-2.5 py-2 text-xs font-medium text-[#e0e5ec] transition-colors hover:border-[#80e8bf]/50 hover:bg-[#15191e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#80e8bf] sm:px-4 sm:text-sm"
              >
                Sign in
              </Link>
            </motion.div>

            <motion.div
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            >
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-md bg-[#80e8bf] px-2.5 py-2 text-xs font-semibold text-[#102019] transition-colors hover:bg-[#a0f2d1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#80e8bf] sm:px-4 sm:text-sm"
              >
                Get started
              </Link>
            </motion.div>
          </div>
        </nav>

        {/* Hero */}
        <section
          id="home"
          className="grid gap-8 py-10 sm:gap-10 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-20"
        >
          <motion.div
            variants={reveal}
            initial="hidden"
            animate="visible"
            className="min-w-0"
          >
            <p className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-[#285541] bg-[#12251e]/60 px-3 py-1.5 text-[11px] font-medium text-[#80e8bf] sm:text-xs">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#80e8bf]" />
              Execution-backed test evidence
            </p>

            <h1 className="max-w-[540px] text-[clamp(2.25rem,7vw,3.625rem)] font-bold leading-[1.1] tracking-[-0.045em]">
              Find the cases your code forgot.
            </h1>

            <p className="mt-5 max-w-[510px] text-sm leading-[1.8] text-[#a2adbc] sm:text-base sm:leading-[1.7]">
              AI-generated tests are only the beginning. Veritest executes
              them, investigates failures, and measures whether they catch
              real bugs.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 sm:mt-7">
              <motion.div
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              >
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#80e8bf] px-4 py-3 text-sm font-semibold text-[#102019] transition-colors hover:bg-[#a0f2d1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#80e8bf]"
                >
                  Get started
                  <span aria-hidden="true">→</span>
                </Link>
              </motion.div>

              <motion.a
                href="#how-it-works"
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                className="inline-flex items-center justify-center rounded-md border border-[#292f37] bg-[#15191e] px-4 py-3 text-sm text-[#e0e5ec] transition-colors hover:border-[#80e8bf]/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#80e8bf]"
              >
                See how it works
              </motion.a>
            </div>

            <p className="mt-4 text-xs leading-5 text-[#697586]">
              Built around execution evidence, not generated output alone.
            </p>
          </motion.div>

          {/* Illustrative test report */}
          <motion.div
            initial={{
              opacity: 0,
              x: reduceMotion ? 0 : 18,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: reduceMotion ? 0 : 0.6,
              delay: reduceMotion ? 0 : 0.12,
              ease: "easeOut",
            }}
            className="min-w-0 w-full overflow-hidden rounded-xl border border-[#252b33] bg-[#111419] p-3 sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#e7ebf0]">
                  Test evidence
                </p>
                <p className="mt-1 break-all text-xs text-[#7f8b9c]">
                  billing/proration.js
                </p>
              </div>

              <span className="shrink-0 rounded-full border border-[#343b44] px-2.5 py-1 font-mono text-[10px] text-[#a2adbc]">
                DEMO
              </span>
            </div>

            {/* Horizontally scrollable code */}
            <div className="overflow-x-auto rounded-md border border-[#272d36] bg-[#0d1014] py-3 font-mono text-[11px] leading-[1.9] sm:text-xs">
              <div className="whitespace-nowrap px-3 text-[#8292a9]">
                // billing/proration.js
              </div>

              <div className="whitespace-nowrap px-3">
                <span className="text-[#c7a5ff]">function</span>{" "}
                <span className="text-[#a7d8ff]">calculateProration</span>
                <span className="text-[#e2e7ed]">(start, end, plan) {"{"}</span>
              </div>

              <div className="whitespace-nowrap bg-[#3b2029] px-3">
                <span className="text-[#e2e7ed]">{"  const d = "}</span>
                <span className="text-[#a7d8ff]">daysBetween</span>
                <span className="text-[#e2e7ed]">(start, end); </span>
                <span className="text-[#8d9aad]">// ← run_8f3a</span>
              </div>

              <div className="whitespace-nowrap px-3 text-[#e2e7ed]">
                {"  return round(d / 30 * plan.price, 2);"}
              </div>

              <div className="whitespace-nowrap px-3 text-[#e2e7ed]">
                {"}"}
              </div>
            </div>

            {/* Result badges */}
            <div className="mt-4 flex flex-wrap gap-2 font-mono text-[10px] sm:text-[11px]">
              <span className="rounded-full border border-[#247f5c] px-2 py-1 text-[#55dda0]">
                ✓ 11 passed
              </span>

              <span className="rounded-full border border-[#9b3e49] px-2 py-1 text-[#ff777e]">
                × 2 failed
              </span>

              <span className="rounded-full border border-[#426fb0] px-2 py-1 text-[#80b5ff]">
                Mutation score 85.4%
              </span>
            </div>

            <div className="mt-4 break-words rounded-md border border-[#492b32] bg-[#25171b] p-3">
              <p className="font-mono text-[11px] leading-5 text-[#ff8b92] sm:text-xs">
                Expected 0.33, received -0.33
              </p>

              <p className="mt-1 text-xs leading-5 text-[#b8a0a4]">
                Failure reproduced in 3/3 attempts.
              </p>
            </div>

            <p className="mt-3 text-[10px] leading-4 text-[#697586]">
              Illustrative results · Not a live test run
            </p>
          </motion.div>
        </section>

        {/* Problem */}
        <section
          id="problem"
          className="border-t border-[#252a30] py-8 sm:py-10 lg:py-12"
        >
          <motion.h2
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="text-xl font-bold tracking-tight sm:text-2xl"
          >
            Why generated tests aren't enough
          </motion.h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#a2adbc]">
            A test suite is useful only when its assertions are valid and it
            can expose incorrect behavior.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {[
              {
                number: "01",
                title: "Invalid or ineffective tests",
                description:
                  "Models can propose assertions that are incorrect, irrelevant, or too weak to catch a defect.",
              },
              {
                number: "02",
                title: "Passing isn't catching",
                description:
                  "A green test suite does not prove that important behavior changes would be detected.",
              },
              {
                number: "03",
                title: "Hard-to-reproduce failures",
                description:
                  "Failures need confirmation and, where possible, smaller inputs that make the problem easier to investigate.",
              },
            ].map((item, index) => (
              <motion.article
                key={item.number}
                variants={reveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.4,
                  delay: reduceMotion ? 0 : index * 0.09,
                }}
                whileHover={reduceMotion ? undefined : { y: -3 }}
                className="min-w-0 rounded-lg border border-[#252b33] bg-[#111419] p-4 transition-colors hover:border-[#3b5145] sm:min-h-[150px] sm:p-5"
              >
                <span className="font-mono text-xs text-[#80e8bf]">
                  {item.number}
                </span>

                <h3 className="mt-3 text-sm font-bold leading-6">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-[1.7] text-[#a2adbc]">
                  {item.description}
                </p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Workflow */}
        <section
          id="how-it-works"
          className="border-t border-[#252a30] py-8 sm:py-10 lg:py-12"
        >
          <motion.h2
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            className="text-xl font-bold tracking-tight sm:text-2xl"
          >
            How it works
          </motion.h2>

          <p className="mt-2 text-sm leading-6 text-[#a2adbc]">
            From candidate tests to evidence you can inspect.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-5 lg:gap-x-5">
            {[
              {
                title: "Submit your code",
                description:
                  "Provide the function and its expected behavior.",
              },
              {
                title: "Generate candidate tests",
                description:
                  "Propose cases for normal and edge-case behavior.",
              },
              {
                title: "Validate and execute",
                description:
                  "Check test structure and run tests deterministically.",
              },
              {
                title: "Investigate failures",
                description:
                  "Confirm failures and work toward minimal repros.",
              },
              {
                title: "Measure effectiveness",
                description:
                  "Use mutation testing to examine whether tests catch changes.",
              },
            ].map((step, index) => (
              <motion.div
                key={step.title}
                initial={{
                  opacity: 0,
                  y: reduceMotion ? 0 : 12,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.4,
                  delay: reduceMotion ? 0 : index * 0.07,
                  ease: "easeOut",
                }}
                className="min-w-0 border-l-2 border-[#80e8bf] py-1 pl-4"
              >
                <span className="font-mono text-[11px] text-[#80e8bf]">
                  STEP {String(index + 1).padStart(2, "0")}
                </span>

                <h3 className="mt-2 text-sm font-bold leading-[1.55]">
                  {step.title}
                </h3>

                <p className="mt-2 text-xs leading-[1.7] text-[#a2adbc]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Principles */}
        <section
          id="principles"
          className="border-t border-[#252a30] py-8 sm:py-10 lg:py-12"
        >
          <motion.h2
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            className="text-xl font-bold tracking-tight sm:text-2xl"
          >
            Engineering principles
          </motion.h2>

          <motion.ul
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: reduceMotion ? 0 : 0.06,
                },
              },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-5 list-disc space-y-2 pl-5 text-sm leading-6 text-[#a2adbc] marker:text-[#80e8bf]"
          >
            {[
              "Tests are executed, not merely suggested.",
              "Results are backed by execution evidence.",
              "Invalid model output must be validated.",
              "Untrusted code requires restricted execution.",
              "Mutation testing measures one aspect of test effectiveness, not correctness.",
            ].map((principle) => (
              <motion.li key={principle} variants={reveal}>
                {principle}
              </motion.li>
            ))}
          </motion.ul>
        </section>

        {/* Final CTA */}
        <section className="border-t border-[#252a30] py-8 sm:py-10 lg:py-12">
          <div className="rounded-xl border border-[#285541] bg-[#101a16] p-5 sm:p-7 md:p-8">
            <h2 className="max-w-lg text-2xl font-bold tracking-tight sm:text-3xl">
              Don't stop at tests that pass.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#a2adbc]">
              Investigate what your tests actually detect, with execution
              evidence behind the results.
            </p>

            <motion.div
              className="mt-5 inline-flex"
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            >
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#80e8bf] px-4 py-3 text-sm font-semibold text-[#102019] transition-colors hover:bg-[#a0f2d1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#80e8bf]"
              >
                Get started
                <span aria-hidden="true">→</span>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-col gap-2 border-t border-[#252a30] py-5 text-xs leading-5 text-[#7f8b9c] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-6">
          <Link
            to="/"
            className="w-fit font-semibold text-[#e0e5ec]"
          >
            Veri<span className="text-[#80e8bf]">test</span>
          </Link>

          <p>
            Veritest prototype · Sample results are illustrative, not live
            measurements.
          </p>
        </footer>
      </div>
    </main>
  );
}

export default LandingPage;

