
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
    <main className="min-h-screen bg-[#0b0d0f] text-[#f1f3f5]">
      <div className="mx-auto max-w-[1160px] px-5 sm:px-8">
        {/* Navigation */}
        <nav className="flex min-h-[56px] items-center justify-between border-b border-[#252a30]">
          <a href="#home" className="flex items-center gap-2.5">
            {/* Veritest logo */}
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
          </a>

          <div className="hidden items-center gap-6 text-sm text-[#a2abb8] sm:flex">
            <a href="#how-it-works" className="transition hover:text-white">
              How it works
            </a>
            <a href="#principles" className="transition hover:text-white">
              Principles
            </a>
          </div>

          <motion.a
            href="#workspace"
            whileHover={reduceMotion ? undefined : { y: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            className="rounded-md bg-[#80e8bf] px-4 py-2 text-sm font-medium text-[#102019] transition-colors hover:bg-[#a0f2d1]"
          >
            Open dashboard
          </motion.a>
        </nav>

        {/* Hero */}
        <section
          id="home"
          className="grid gap-10 py-10 sm:py-12 lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-11"
        >
          <motion.div
            variants={reveal}
            initial="hidden"
            animate="visible"
          >
            <h1 className="max-w-[540px] text-[42px] font-bold leading-[1.1] tracking-[-0.045em] sm:text-5xl">
              Find the cases your code forgot.
            </h1>

            <p className="mt-5 max-w-[510px] text-[15px] leading-[1.7] text-[#a2adbc] sm:text-base">
              AI-generated tests are only the beginning. Veritest executes
              them, investigates failures, and measures whether they catch
              real bugs.
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <motion.a
                href="#workspace"
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                className="rounded-md bg-[#80e8bf] px-4 py-2.5 text-sm font-medium text-[#102019] transition-colors hover:bg-[#a0f2d1]"
              >
                Explore the workspace
              </motion.a>

              <motion.a
                href="#how-it-works"
                whileHover={reduceMotion ? undefined : { y: -2 }}
                className="rounded-md border border-[#292f37] bg-[#15191e] px-4 py-2.5 text-sm text-[#e0e5ec] transition-colors hover:border-[#80e8bf]/50"
              >
                See how it works
              </motion.a>
            </div>
          </motion.div>

          {/* Illustrative test report */}
          <motion.div
            initial={{
              opacity: 0,
              x: reduceMotion ? 0 : 18,
            }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.6,
              delay: reduceMotion ? 0 : 0.12,
              ease: "easeOut",
            }}
            className="min-w-0 rounded-lg border border-[#252b33] bg-[#111419] p-4"
          >
            <div className="overflow-x-auto rounded-md border border-[#272d36] bg-[#0d1014] py-3 font-mono text-xs leading-[1.8]">
              <div className="px-3 text-[#8292a9]">
                // billing/proration.js
              </div>
              <div className="px-3">
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
              <div className="px-3 text-[#e2e7ed]">
                {"  return round(d / 30 * plan.price, 2);"}
              </div>
              <div className="px-3 text-[#e2e7ed]">{"}"}</div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 font-mono text-[11px]">
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

            <p className="mt-3 break-words font-mono text-[11px] leading-5 text-[#ff646f]">
              expected 0.33, received -0.33 — reproduced 3/3
            </p>
            <p className="mt-2 text-[10px] text-[#697586]">
              Illustrative results · Not a live test run
            </p>
          </motion.div>
        </section>

        {/* Problem */}
        <section id="problem" className="border-t border-[#252a30] py-10">
          <motion.h2
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="text-xl font-bold tracking-tight"
          >
            Why generated tests aren't enough
          </motion.h2>

          <div className="mt-3 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Invalid or ineffective tests",
                description:
                  "Models propose assertions that can simply be wrong.",
              },
              {
                title: "Passing isn't catching",
                description:
                  "A green suite may miss important behavior changes.",
              },
              {
                title: "Hard-to-reproduce failures",
                description:
                  "Failures need confirmation and minimal inputs to be useful.",
              },
            ].map((item, index) => (
              <motion.article
                key={item.title}
                variants={reveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.4,
                  delay: reduceMotion ? 0 : index * 0.09,
                }}
                whileHover={reduceMotion ? undefined : { y: -3 }}
                className="min-h-[126px] rounded-lg border border-[#252b33] bg-[#111419] p-4 transition-colors hover:border-[#3b5145]"
              >
                <h3 className="text-sm font-bold">{item.title}</h3>
                <p className="mt-4 text-sm leading-[1.65] text-[#a2adbc]">
                  {item.description}
                </p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Workflow */}
        <section
          id="how-it-works"
          className="border-t border-[#252a30] py-10"
        >
          <motion.h2
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            className="text-xl font-bold tracking-tight"
          >
            How it works
          </motion.h2>

          <div className="mt-3 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              "Submit code and expected behavior",
              "Generate candidate tests",
              "Validate and execute tests",
              "Investigate and minimize failures",
              "Evaluate effectiveness with mutation testing",
            ].map((step, index) => (
              <motion.div
                key={step}
                initial={{
                  opacity: 0,
                  y: reduceMotion ? 0 : 12,
                }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.4,
                  delay: reduceMotion ? 0 : index * 0.07,
                  ease: "easeOut",
                }}
                className="min-h-[72px] border-l-2 border-[#80e8bf] py-1 pl-3"
              >
                <span className="font-mono text-[11px] text-[#9ba6b4]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-1 text-sm font-bold leading-[1.55]">
                  {step}
                </h3>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Principles */}
        <section
          id="principles"
          className="border-t border-[#252a30] py-10"
        >
          <motion.h2
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            className="text-xl font-bold tracking-tight"
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
            className="mt-4 list-disc space-y-1 pl-10 text-sm leading-5 text-[#a2adbc] marker:text-[#8b96a5]"
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

        {/* Workspace placeholder */}
        <section
          id="workspace"
          className="sr-only"
          aria-label="Workspace"
        >
          The Veritest workspace will be available here.
        </section>

        {/* Footer */}
        <footer className="border-t border-[#252a30] py-10 text-xs leading-6 text-[#9ba6b4]">
          Veritest prototype · GitHub, Docs and Legal links are placeholders,
          not configured
        </footer>
      </div>
    </main>
  );
}

export default LandingPage;
