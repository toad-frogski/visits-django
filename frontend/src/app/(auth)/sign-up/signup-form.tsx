"use client";

import { signup } from "@/app/(auth)/actions";
import { FC, useActionState } from "react";



const SignupForm: FC = () => {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <form action={action}>
      <div className="flex flex-col p-3 rounded border">
        <label htmlFor="username">Username</label>
        <input id="username" name="username" autoComplete="username" type="text" placeholder="Username" />
        {state?.errors?.username && <p>{state.errors.username}</p>}
      </div>
      <div className="flex flex-col p-3 rounded mt-3 border">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" placeholder="***" />
        {state?.errors?.password && <p>{state.errors.password}</p>}
      </div>
      <button
        disabled={pending}
        type="submit"
        className="rounded w-full p-3 mt-3 border hover:bg-teal-800 transition ease-in disabled:bg-red-500"
      >
        Submit
      </button>
      {state?.errors?.common && (
        <div className="flex flex-col p-3 rounded border border-red-500 mt-3">
          <p className=" text-red-500">{state.errors.common}</p>
        </div>
      )}
    </form>
  );
};

export default SignupForm;
