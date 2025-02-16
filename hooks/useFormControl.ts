import { useState, useEffect } from 'react';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { FormActionResult } from '@/models/form-action-result';

interface FormControlState {
  localError: string | undefined;
  localValue: string;
  setLocalError: (error: string | undefined) => void;
  setLocalValue: (value: string) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string) => void;
}

export const useFormControl = (
  name: string | undefined,
  observable: Observable<{result: FormActionResult, isPending: boolean}> | undefined,
  onChange?: (e: any) => void,
  initialValue: string = ""
): FormControlState => {
  const [localError, setLocalError] = useState<string | undefined>(undefined);
  const [localValue, setLocalValue] = useState<string>(initialValue);

  useEffect(() => {
    console.log("useFormControl effect for:", name);
    if (observable && name) {
      console.log("Setting up subscription for:", name);
      const subscription = observable.pipe(
        filter(({ isPending }) => {
          console.log("Filter isPending for:", name, isPending);
          return isPending === false;
        }),
        map(({ result }) => {
          console.log("Mapping result for:", name, result);
          return result.formatErrors?.[name];
        })
      ).subscribe(error => {
        console.log("Received error for:", name, error);
        if (error !== undefined) {
          setLocalError(error.error);
          setLocalValue(error.value);
        }
      });

      return () => {
        console.log("Cleaning up subscription for:", name);
        subscription.unsubscribe();
      };
    }
  }, [observable, name]);

  useEffect(() => {
    setLocalValue(initialValue);
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string) => {
    setLocalError(undefined);
    const value = typeof e === 'string' ? e : e.target.value;
    setLocalValue(value);
    if (onChange) {
      if (typeof e === 'string') {
        onChange(value);
      } else {
        onChange(e);
      }
    }
  };

  return {
    localError,
    localValue,
    setLocalError,
    setLocalValue,
    handleChange
  };
}; 