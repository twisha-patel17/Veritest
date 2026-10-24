
import { motion, useReducedMotion } from "motion/react";

function AuthSideDesign({
  title = "Know what your tests actually catch.",
}) {
  const reduceMotion = useReducedMotion();

  const fadeUp = {
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

  const reportAnimation = {
    hidden: {
      opacity: 0,
      x: reduceMotion ? 0 : 22,
      scale: reduceMotion ? 1 : 0.98,
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: reduceMotion ? 0 : 0.55,
        delay: reduceMotion ? 0 : 0.2,
        ease: "easeOut",
      },
    },
  };

  const testLines = [
    {
      symbol: "✓",
      text: "full period returns full price",
      color: "#55dda0",
    },
    {
      symbol: "✓",
      text: "days beyond period throws",
      color: "#55dda0",
    },
    {
      symbol: "×",
      text: "leap-day downgrade",
      color: "#ff646f",
      detail: "expected 0.33, got -0.33",
    },
  ];

  return (
    <aside className="relative hidden min-h-screen flex-col justify-center overflow-hidden bg-[#111419] px-10 py-12 lg:flex xl:px-16">
      {/* Subtle ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-100px] top-[15%] h-[280px] w-[280px] rounded-full bg-[#80e8bf]/[0.035] blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-[460px]">
        {/* Heading */}
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="max-w-[420px] text-[26px] font-bold leading-[1.5] tracking-tight text-[#f1f3f5]"
        >
          {title}
        </motion.h2>

        {/* Description */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{
            delay: reduceMotion ? 0 : 0.1,
          }}
          className="mt-3 max-w-[430px] text-sm leading-[1.7] text-[#a2adbc]"
        >
          AI proposes the tests. Execution verifies them. Evidence measures
          their value.
        </motion.p>

        {/* Animated test report */}
        <motion.div
          variants={reportAnimation}
          initial="hidden"
          animate="visible"
          className="mt-4 rounded-lg border border-[#252b33] bg-[#111419] p-4"
        >
          <div className="overflow-x-auto rounded-md border border-[#272d36] bg-[#0d1014] py-3 font-mono text-xs leading-[1.8]">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{
                delay: reduceMotion ? 0 : 0.3,
              }}
              className="whitespace-nowrap px-3 text-[#8292a9]"
            >
              // run_8f3a · calcProration
            </motion.div>

            {testLines.map((line, index) => (
              <motion.div
                key={line.text}
                initial={{
                  opacity: 0,
                  x: reduceMotion ? 0 : 8,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: reduceMotion ? 0 : 0.3,
                  delay: reduceMotion ? 0 : 0.4 + index * 0.12,
                  ease: "easeOut",
                }}
                className="flex min-w-max items-center gap-2 px-3"
              >
                <span
                  className="shrink-0"
                  style={{ color: line.color }}
                >
                  {line.symbol}
                </span>

                <span className="text-[#e2e7ed]">
                  {line.text}
                </span>

                {line.detail && (
                  <span className="text-[#8292a9]">
                    {line.detail}
                  </span>
                )}
              </motion.div>
            ))}
          </div>

          {/* Evidence badges */}
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.35,
              delay: reduceMotion ? 0 : 0.8,
            }}
            className="mt-3 flex flex-wrap gap-2 font-mono text-[11px]"
          >
            <span className="rounded-full border border-[#247f5c] px-2 py-1 text-[#55dda0]">
              ✓ Reproduced 3/3
            </span>

            <span className="rounded-full border border-[#426fb0] px-2 py-1 text-[#80b5ff]">
              Mutation score 85.4%
            </span>
          </motion.div>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: reduceMotion ? 0 : 0.4,
            delay: reduceMotion ? 0 : 0.9,
          }}
          className="mt-6 text-xs leading-5 text-[#697586]"
        >
          Sample data from the demo workspace.
        </motion.p>
      </div>
    </aside>
  );
}

export default AuthSideDesign;
