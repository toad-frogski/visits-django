import { type FC } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { useLogin } from "../model/use-login";
import { Password } from "@/shared/components/ui/password";
import { useTranslation } from "react-i18next";

const LoginForm: FC = () => {
  const { error, isPending, form, onSubmit } = useLogin();
  const [t] = useTranslation(["common", "auth"]);

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
              <FormMessage />
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
              <FormMessage />
            </FormItem>
          )}
        />

        {error && Array.isArray(error.errors) ? (
          error.errors.map((e) => (
            <p className="text-destructive text-sm mt-3">{t(`auth:errors.${e.code}.${e.attr}`)}</p>
          ))
        ) : (
          <p className="text-destructive text-sm mt-3">{t("common:errors.server")}</p>
        )}

        <Button className="w-full mt-12 border" type="submit" disabled={isPending}>
          {t("common:submit")}
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
