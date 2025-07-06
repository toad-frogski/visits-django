import { useRfid } from "@/features/settings/model/use-rfid";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, type ComponentProps, type FC } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const rfidSchema = z.object({
  rfid_token: z.string(),
});

const RfidForm: FC<Pick<ComponentProps<"div">, "className">> = ({
  className,
}) => {
  const { rfid, setRfid, saveError } = useRfid();
  const form = useForm({
    resolver: zodResolver(rfidSchema),
    defaultValues: {
      rfid_token: "",
    },
  });

  useEffect(() => {
    if (rfid?.rfid_token) {
      form.reset({ rfid_token: rfid.rfid_token });
    }
  }, [rfid, form]);

  useEffect(() => {
    if (!saveError) return;

    form.setError("rfid_token", {
      type: "server",
      message:
        (saveError as any)?.rfid_token ||
        (saveError as Error)?.message ||
        "Ошибка при сохранении RFID",
    });
  }, [saveError, form]);

  const onSubmit = form.handleSubmit(setRfid);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className={className}>
        <FormField
          control={form.control}
          name="rfid_token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RFID token</FormLabel>
              <Input {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default RfidForm;
