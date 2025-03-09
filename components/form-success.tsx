import { useState, useEffect } from "react";
import { CheckCircledIcon, Cross2Icon } from "@radix-ui/react-icons";

type FormSuccessProps = {
  message?: string;
  resetSignal?: string | number;
};

const FormSuccess = ({ message, resetSignal }: FormSuccessProps) => {
  const [visible, setVisible] = useState(true);
  if (!message || !visible) return null;

  // resetSignal の値が変化すれば再表示する
  useEffect(() => {
    setVisible(true);
  }, [resetSignal]);

  return (
    <div className="relative bg-emerald-500/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-emerald-500">
      <CheckCircledIcon className="h-4 w-4 flex-none" />
      <p>{message}</p>
      <button
        onClick={() => setVisible(false)}
        className="absolute top-1 right-1 p-1 focus:outline-none"
      >
        <Cross2Icon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default FormSuccess;
