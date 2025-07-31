import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import type { ComponentProps, FC } from "react";
import { useTranslation } from "react-i18next";
import * as TabsPrimitive from "@radix-ui/react-tabs";

const LanguageSwitcher: FC<ComponentProps<typeof TabsPrimitive.Root>> = (props) => {
  const { i18n } = useTranslation();

  return (
    <Tabs {...props} defaultValue={i18n.language} onValueChange={i18n.changeLanguage}>
      <TabsList>
        <TabsTrigger className="w-12" value="en">
          En
        </TabsTrigger>
        <TabsTrigger className="w-12" value="ro">
          Ro
        </TabsTrigger>
        <TabsTrigger className="w-12" value="ru">
          Ru
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default LanguageSwitcher;
