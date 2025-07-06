import type { FC } from "react";
import Layout from "./ui/layout";
import LoginForm from "./ui/login-form";

const LoginPage: FC = () => {
  return (
    <Layout>
      <LoginForm />
    </Layout>
  );
};

export const Component = LoginPage;
