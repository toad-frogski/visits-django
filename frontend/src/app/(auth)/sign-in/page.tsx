import SignInForm from "@/app/(auth)/sign-in/signin-form";
import { FC } from "react";

const Page: FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 justify-center items-center flex">
        <section className="min-h-1/2 max-w-1/3">
          <SignInForm />
        </section>
      </main>
    </div>
  );
};

export default Page;
