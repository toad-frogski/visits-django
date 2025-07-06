import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeClosed } from "lucide-react";

const Password = forwardRef<
  HTMLInputElement,
  Omit<InputHTMLAttributes<HTMLInputElement>, "type">
>(({ placeholder, ...props }, ref) => {
  const [show, setShow] = useState(false);

  const toggleShow = () => setShow((prev) => !prev);

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={show ? "text" : "password"}
        placeholder={show ? placeholder : "*".repeat(placeholder?.length || 6)}
        {...props}
      />
      <Button className="absolute right-0 top-1/2 -translate-y-1/2" size="icon" variant="ghost" onClick={toggleShow} type="button">
        {show ? <EyeClosed /> : <Eye />}
      </Button>
    </div>
  );
});

export { Password };
