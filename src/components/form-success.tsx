import { CheckCircledIcon, Cross2Icon } from "@radix-ui/react-icons";
import { useState, useEffect } from "react";

type FormSuccessProps = {
  message?: string;
  resetSignal?: string | number;
};

const FormSuccess = ({ message, resetSignal }: FormSuccessProps) => {
  const [visible, setVisible] = useState(true);
  
  // resetSignal の値が変化すれば再表示する
  useEffect(() => {
    setVisible(true);
  }, [resetSignal]);

  if (!message || !visible) return null;

  return (
    <div className="relative flex items-center gap-x-2 rounded-md bg-emerald-500/15 p-3 text-sm text-emerald-500">
      <CheckCircledIcon className="size-4 flex-none" />
      <p className="pr-6">{message}</p>
      <button
        onClick={() => { setVisible(false); }}
        className="absolute right-1 top-1 p-1 focus:outline-none"
      >
        <Cross2Icon className="size-4" />
      </button>
    </div>
  );
};

export default FormSuccess;
