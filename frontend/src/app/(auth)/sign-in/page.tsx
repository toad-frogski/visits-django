import SignInForm from "@/app/(auth)/sign-in/signin-form";
import { FC } from "react";

const Page: FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 justify-center items-center flex sm:bg-gradient-to-r from-blue-700 via-blue-500 to-blue-300">
        <section className="w-full px-6 sm:max-w-[450px] sm:p-[56px] sm:rounded-4xl bg-white">
          <SignInForm />
        </section>
      </main>
    </div>
  );
};

export default Page;
