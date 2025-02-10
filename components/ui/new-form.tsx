"use client"

import React, { useActionState, useEffect, useRef } from 'react';
import * as Form from '@radix-ui/react-form';
import { FormActionResult } from '@/models/form-action-result';
import { toast } from 'sonner';


const NewForm: React.FC<{
    action: (prevResult: FormActionResult, data: FormData) => Promise<FormActionResult>,
    children: React.ReactNode,
    noValidate?: boolean
}> = ({ action, children, noValidate }) => {

    const [state, formDispatch, isPending] = useActionState(
        action ?? (() => Promise.resolve({})),
        {}
    );
    
    // 子要素に対して1段階のみ error を注入する（再帰は行わない）
    const content = React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        
        if (child.props.name !== undefined) {
            const { name } = child.props as { name: string };
            const fieldError = state.errors 
              ? (state.errors as Record<string, { error: string | undefined, value: string }>)[name]
              : undefined;
            if (fieldError) {
                return React.cloneElement(child as React.ReactElement<any>, { 
                    error: fieldError.error,
                    defaultValue: fieldError.value,
                    isPending: isPending,
                });
            }

        }
        return child;
    });

    useEffect(() => {
        if (state.success) {
            toast.success(state.success);
        }
    }, [state]);

    return (
        <Form.Root action={formDispatch} noValidate={noValidate}>
            {content}
        </Form.Root>
    );
};

export default NewForm;