"use client"
import React, { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { toast } from "sonner";

interface State {
    error?: string | undefined,
    success?: string | undefined
}

const NewForm: React.FC<{
    action: (prevState: State, data: FormData) => Promise<State>,
    children: React.ReactNode | React.ReactNode[],
}> = (props) => {
    const [state, formDispatch] = useFormState(props.action, { error: undefined, success: undefined });

    useEffect(() => {
        if (state.error) {
            toast.error(state.error);
        }

        if (state.success) {
            toast.success(state.success);
        }
    }, [state]);

    return (
        <form action={formDispatch}>
            {props.children}
        </form>
    );
};

export default NewForm;