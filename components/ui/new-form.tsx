"use client"

import React, { useActionState, useEffect } from 'react';
import { toast } from "sonner";
import * as Form from '@radix-ui/react-form';
import { FormActionResult } from '@/models/form-action-result';

const NewForm: React.FC<{
    action: (prevResult: FormActionResult, data: FormData) => Promise<FormActionResult>,
    children: React.ReactNode | React.ReactNode[],
}> = ({ action, children }) => {
    const [state, formDispatch] = useActionState(
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
    }, [state]);

    return (
        <Form.Root action={formDispatch}>
            {children}
        </Form.Root>
    );
};

export default NewForm;