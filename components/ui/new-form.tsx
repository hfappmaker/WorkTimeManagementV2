"use client"

import React, { useActionState, useEffect, useRef } from 'react';
import * as Form from '@radix-ui/react-form';
import { FormActionResult } from '@/models/form-action-result';
import { toast } from 'sonner';

const NewForm: React.FC<{
    action: (prevResult: FormActionResult, data: FormData) => Promise<FormActionResult>,
    children: React.ReactNode,
    noValidate?: boolean,
    onSuccess?: (result: FormActionResult) => void
}> = ({ action, children, noValidate, onSuccess }) => {
    // カスタムバリデーションを組み込んだ独自の dispatch 関数
    const customDispatch = async (prevResult: FormActionResult, formData: FormData): Promise<FormActionResult> => {
        const customErrors: Record<string, { error: string | undefined, value: string }> = {};
        
        const getFormDataValue = (name: string): string => {
            return formData.get(name)?.toString() || '';
        };

        // 全てのエラーがundefinedかどうかをチェックする関数
        const hasNoErrors = (errors: Record<string, { error: string | undefined, value: string }>) => {
            return Object.values(errors).every(field => field.error === undefined);
        };

        // 再帰的に子要素を走査する関数
        const validateChildren = (children: React.ReactNode) => {
            React.Children.forEach(children, (child) => {
                if (!React.isValidElement(child)) return;
                
                const childProps = child.props as { 
                    name?: string; 
                    'data-required-message'?: string;
                    children?: React.ReactNode;
                };

                // 現在の要素のバリデーション
                if (childProps.name && childProps['data-required-message']) {
                    const value = getFormDataValue(childProps.name);
                    customErrors[childProps.name] = { 
                        error: (!value || value.trim() === "") ? childProps['data-required-message'] : undefined, 
                        value 
                    };
                }

                // 子要素が存在する場合、再帰的に処理
                if (childProps.children) {
                    validateChildren(childProps.children);
                }
            });
        };

        // バリデーション開始
        validateChildren(children);

        // カスタムエラーがある場合、action の実行を中断し、エラー結果を返す
        if (!hasNoErrors(customErrors)) {
            return Promise.resolve({ errors: customErrors });
        }

        if (action){
            return await action(prevResult, formData);
        }

        return Promise.resolve({});
    };

    const [state, formDispatch, isPending] = useActionState(
        customDispatch,
        {}
    );

    // 子要素に対して再帰的に error を注入する
    const injectErrors = (children: React.ReactNode): React.ReactNode => {
        return React.Children.map(children, (child) => {
            if (!React.isValidElement(child)) return child;
            
            const childProps = child.props as {
                name?: string;
                children?: React.ReactNode;
            };

            let updatedChild = child;

            // 現在の要素にエラーを注入
            if (childProps.name !== undefined) {
                const fieldError = state.errors 
                    ? (state.errors as Record<string, { error: string | undefined, value: string }>)[childProps.name]
                    : undefined;
                if (fieldError) {
                    updatedChild = React.cloneElement(child as React.ReactElement<any>, { 
                        error: fieldError.error,
                        defaultValue: fieldError.value,
                        isPending: isPending,
                    });
                }
            }

            // 子要素が存在する場合、再帰的に処理
            if (childProps.children) {
                return React.cloneElement(
                    updatedChild as React.ReactElement<any>,
                    {},
                    injectErrors(childProps.children)
                );
            }

            return updatedChild;
        });
    };

    const content = injectErrors(children);

    useEffect(() => {
        if (state.success) {
            toast.success(state.success);
            if (onSuccess) {
                onSuccess(state);
            }
        }
    }, [state]);

    return (
        <Form.Root action={formDispatch} noValidate={noValidate}>
            {content}
        </Form.Root>
    );
};

export default NewForm;