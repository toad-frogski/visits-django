import { useRfid } from "@/features/settings/model/use-rfid";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import type { ComponentProps, FC } from "react";

const RfidForm: FC<Pick<ComponentProps<"div">, "className">> = ({ className }) => {
  const { form, onSubmit } = useRfid();

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className={className}>
        <FormField
          control={form.control}
          name="rfid_token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RFID token</FormLabel>
              <Input {...field} className="mt-3" />
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default RfidForm;
