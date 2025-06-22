import {
  createContext,
  useContext,
  useState,
  type FC,
  type PropsWithChildren,
} from "react";
import { tv } from "tailwind-variants";

import Info from "@/assets/circle-info.svg?react";
import Alert from "@/assets/circle-alert.svg?react";

type ToastValue =
  | {
      type: "info" | "error" | "warning";
      message: string;
    }
  | string;

type ToastContextProps = {
  toasts: ToastValue[];
  addToast: (toast: ToastValue) => void;
  removeToast: (index: number) => void;
};
const ToastContext = createContext<ToastContextProps | null>(null);

export const ToastProvider: FC<PropsWithChildren> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastValue[]>([]);

  const addToast = (toast: ToastValue) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 5000);
  };

  const removeToast = (idx: number) => {
    setToasts((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2">
        {toasts.map((toast, i) => (
          <Toast key={i} value={toast} onClose={() => removeToast(i)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

type ToastProps = {
  value: ToastValue;
  onClose?: () => void;
};

const toast = tv({
  base: "p-3 rounded shadow flex justify-between items-center gap-4 font-bold text-white *:stroke-white max-w-64",
  variants: {
    type: {
      info: "bg-accent",
      error: "bg-red",
    },
  },
});

const Toast: FC<ToastProps> = ({ value, onClose }) => {
  const content =
    typeof value === "string" ? { type: "info", message: value } : value;

  return (
    <div
      className={toast({ type: content.type as "info" | "error" })}
      onClick={onClose}
    >
      <span title={content.message} className="truncate">
        {content.message}
      </span>
      {
        {
          info: <Info className="min-w-6 min-h-6" width={24} height={24} />,
          error: <Alert className="min-w-6 min-h-6" width={24} height={24} />,
        }[content.type]
      }
    </div>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");

  return ctx;
};
