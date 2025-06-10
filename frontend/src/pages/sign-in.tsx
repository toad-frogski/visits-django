import { useEffect, useRef, useState, type FC } from "react";
import { useNavigate } from "react-router";
import Button from "../ui/components/button";
import Input from "../ui/components/input";
import { useSession } from "../contexts/session";
import { isAxiosError } from "axios";

const SignIn: FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 justify-center items-center flex sm:bg-gradient-to-r from-blue-700 via-blue-500 to-blue-300">
        <section className="w-full px-6 sm:max-w-[450px] sm:p-[56px] sm:rounded-4xl bg-white">
          <SignInForm />
        </section>
      </main>
    </div>
  );
}

const SignInForm: FC = () => {
  const navigate = useNavigate();
  const { login } = useSession();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Browser password manager autocomplete support.
  useEffect(() => {
    setUsername(usernameRef.current?.value || "");
    setPassword(passwordRef.current?.value || "");
  }, [usernameRef, passwordRef])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      if (isAxiosError(err) && err.status === 400) {
        setError("Invalid username or password")
        return;
      }
      setError("Internal server error");
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
export default SignIn;