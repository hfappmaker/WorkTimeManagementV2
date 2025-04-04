import { useState } from "react";

type MessageState = {
  message: string;
  date: Date;
};

export const useMessageState = () => {
  const [error, setError] = useState<MessageState>({
    message: "",
    date: new Date(),
  });
  const [success, setSuccess] = useState<MessageState>({
    message: "",
    date: new Date(),
  });

  const showError = (message: string) => {
    setError({ message, date: new Date() });
  };

  const showSuccess = (message: string) => {
    setSuccess({ message, date: new Date() });
  };

  const clearMessages = () => {
    setError({ message: "", date: new Date() });
    setSuccess({ message: "", date: new Date() });
  };

  return { error, success, showError, showSuccess, clearMessages };
}; 