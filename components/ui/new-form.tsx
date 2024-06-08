"use client"
import React, { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { toast } from "sonner";
import * as Form from '@radix-ui/react-form';

interface State {
    error?: string | undefined,
    success?: string | undefined
}

const NewForm: React.FC<{
    action: (prevState: State, data: FormData) => Promise<State>,
    children: React.ReactNode | React.ReactNode[],
}> = (props) => {
    const { action, children } = props;
    const [state, formDispatch] = useFormState(action, { error: undefined, success: undefined });

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