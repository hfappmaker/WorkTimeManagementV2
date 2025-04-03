import { ExclamationTriangleIcon, Cross2Icon } from "@radix-ui/react-icons";
import { useState, useEffect } from "react";

type FormErrorProps = {
  message?: string;
  resetSignal?: string | number;
};

const FormError = ({ message, resetSignal }: FormErrorProps) => {
  const [visible, setVisible] = useState(true);

  // resetSignal の値が変化すれば再表示する
  useEffect(() => {
    setVisible(true);
  }, [resetSignal]);

  if (!message || !visible) return null;

  return (
    <div className="relative flex items-center gap-x-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
      <ExclamationTriangleIcon className="size-4 flex-none" />
      <p>{message}</p>
      <button
        onClick={() => { setVisible(false); }}
        className="absolute right-1 top-1 p-1 focus:outline-none"
      >
        <Cross2Icon className="size-4" />
      </button>
    </div>
  );
};

export default FormError;
