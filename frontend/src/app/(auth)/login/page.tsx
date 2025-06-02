import { FC } from "react";

const Page: FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 justify-center items-center flex">
        <section className="min-h-1/2 max-w-1/3">
          <div className="flex flex-col p-3 rounded border">
            <label>Username </label>
            <input type="email" placeholder="foo.bar" />
          </div>
          <div className="flex flex-col p-3 rounded mt-3 border">
            <label>Password</label>
            <input type="password" placeholder="***" />
          </div>
          <button className="rounded w-full p-3 mt-3 border">Submit</button>
        </section>
      </main>
    </div>
  );
};

export default Page;
