import type { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { useLogin } from "../model/use-login";
import { Password } from "@/shared/components/ui/password";

const loginSchema = z.object({
  username: z.string({
    required_error: "Username is required",
  }),
  password: z.string({
    required_error: "Password is required",
  }),
});

const LoginForm: FC = () => {
  const form = useForm({
    resolver: zodResolver(loginSchema),
  });

  const { error, isPending, login } = useLogin();

  const onSubmit = form.handleSubmit(login);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} name="username" type="username" placeholder="john@doe" />
              </FormControl>
              {form.formState.errors.username && (
                <p className="text-destructive text-sm">{form.formState.errors.username.message}</p>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="mt-6">
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Password {...field} name="password" placeholder="secretPwd!" />
              </FormControl>
              {form.formState.errors.password && (
                <p className="text-destructive text-sm">{form.formState.errors.password.message}</p>
              )}
            </FormItem>
          )}
        />

        {error && error.errors.map((e) => <p className="text-destructive text-sm mt-3">{e.detail}</p>)}

        <Button className="w-full mt-12 border" type="submit" disabled={isPending}>
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
