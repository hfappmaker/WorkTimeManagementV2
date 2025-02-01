"use client"
import React, { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { toast } from "sonner";
import * as Form from '@radix-ui/react-form';
import { FormActionResult } from '@/models/form-action-result';
import Spinner from '@/components/spinner';

const NewForm: React.FC<{
    action: (prevResult: FormActionResult, data: FormData) => Promise<FormActionResult>,
    children: React.ReactNode | React.ReactNode[],
}> = ({ action, children }) => {
    const [state, formDispatch, isPending] = useFormState(
        action ?? (() => Promise.resolve({})),
        {}
    );

    useEffect(() => {
        if (state.error) {
            toast.error(state.error);
        }

        if (state.success) {
            toast.success(state.success);
        }
    }, [state, isPending]);

    return (
        <Form.Root action={formDispatch}>
            {isPending ? (
                <div className="flex items-center justify-center min-h-[200px]">
                    <Spinner />
                </div>
            ) : (
                children
            )}
        </Form.Root>
    );
};

export default NewForm;