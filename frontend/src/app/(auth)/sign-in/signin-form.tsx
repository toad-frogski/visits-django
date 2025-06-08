"use client"

import Button from "@/ui/components/button";
import Input from "@/ui/components/input";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FC, useEffect, useLayoutEffect, useRef, useState } from "react"

const SignInForm: FC = () => {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Browser password manager autocomplete support.
  useLayoutEffect(() => {
    setUsername(usernameRef.current?.value || "");
    setPassword(passwordRef.current?.value || "");
  }, [usernameRef, passwordRef])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });

      if (result?.error) {
        setError("Неверные учетные данные");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError("Ошибка подключения к серверу");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="text-center w-full text-h2/h2 font-bold">Sign in</h1>
      <Input
        ref={usernameRef}
        className="mt-[56px]"
        label="Username"
        autoComplete="on"
        type="text"
        name="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <Input
        ref={passwordRef}
        className="mt-6"
        label="Password"
        type="password"
        autoComplete="on"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && (
        <div className="mt-4 bg-red-light text-background rounded-md p-3">
          {error}
        </div>
      )}
      <Button
        type="submit"
        disabled={loading || !username.length || !password.length}
        className="mt-9"
      >
        {loading ? "Signing" : "Sign in"}
      </Button>
    </form>
  )
}

export default SignInForm;
