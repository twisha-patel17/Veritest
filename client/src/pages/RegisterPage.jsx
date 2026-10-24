
import { motion, useReducedMotion } from "motion/react";
import RegisterForm from "../components/auth/RegisterForm";
import AuthSideDesign from "../components/auth/AuthSideDesign";

function RegisterPage() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="min-h-screen overflow-x-clip bg-[#0b0d0f] text-[#f1f3f5]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left side: Registration form */}
        <section className="relative flex min-h-screen min-w-0 items-center justify-center px-5 py-10 sm:px-8 sm:py-12 md:px-12 lg:px-10 xl:px-16">
          <motion.div
            initial={{
              opacity: 0,
              y: reduceMotion ? 0 : 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: reduceMotion ? 0 : 0.45,
              ease: "easeOut",
            }}
            className="w-full max-w-[400px]"
          >
            <RegisterForm />
          </motion.div>
        </section>

        {/* Right side: Shared design and test report */}
        <div className="hidden min-w-0 lg:block">
          <AuthSideDesign
            title="Know what your tests actually catch."
          />
        </div>
      </div>
    </main>
  );
}

export default RegisterPage;
