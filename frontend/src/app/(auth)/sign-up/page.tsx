import { FC } from "react";
import SignupForm from "@/app/(auth)/sign-up/signup-form";

const Page: FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 justify-center items-center flex">
        <section className="min-h-1/2 max-w-1/3">
            <SignupForm />
        </section>
      </main>
    </div>
  );
};

export default Page;
