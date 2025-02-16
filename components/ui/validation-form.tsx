"use client"

import React, { useActionState } from 'react';
import * as Form from '@radix-ui/react-form';
import { FormActionResult } from '@/models/form-action-result';
import { Subject, Subscription } from 'rxjs';
import FormTrigger, { FormTriggerProps } from './form-trigger';

const ValidationForm: React.FC<{
    action: (prevResult: FormActionResult, data: FormData) => Promise<FormActionResult>,
    children: React.ReactNode,
}> = ({ action, children }) => {
    // Subject の作成
    const formSubject = React.useMemo(() => new Subject<{
        result: FormActionResult;
        isPending: boolean;
    }>(), []);

    // FormTrigger コンポーネントを探して設定を取得
    React.useEffect(() => {
        const subscriptions: Subscription[] = [];

        React.Children.forEach(children, child => {
            if (React.isValidElement(child) && child.type === FormTrigger) {
                const triggerProps = child.props as FormTriggerProps<any>;
                const transformed$ = triggerProps.trigger(formSubject.asObservable());
                
                // 変換されたストリームを購読
                const subscription = transformed$.subscribe(value => {
                    triggerProps.action(value);
                });

                subscriptions.push(subscription);
            }
        });

        return () => subscriptions.forEach(subscription => subscription.unsubscribe());
    }, [children, formSubject]);

    // カスタムバリデーションを組み込んだ dispatch 関数
    const customDispatch = async (prevResult: FormActionResult, formData: FormData): Promise<FormActionResult> => {
        const customErrors: Record<string, { error: string | undefined, value: string }> = {};
        
        const getFormDataValue = (name: string): string => {
            return formData.get(name)?.toString() || '';
        };

        // 全てのエラーがundefinedかどうかをチェックする関数
        const hasNoErrors = (errors: Record<string, { error: string | undefined, value: string }>) => {
            return Object.values(errors).every(field => field.error === undefined);
        };

        // 再帰的に子要素を走査しバリデーションを実行
        const validateChildren = (children: React.ReactNode) => {
            React.Children.forEach(children, (child) => {
                if (!React.isValidElement(child)) return;
                
                const childProps = child.props as { 
                    name?: string; 
                    'data-required-message'?: string;
                    'data-pattern'?: string;
                    'data-pattern-message'?: string;
                    children?: React.ReactNode;
                    required?: boolean;
                };

                // 現在の要素のバリデーション
                if (childProps.name) {
                    const value = getFormDataValue(childProps.name);
                    let error: string | undefined;

                    // required チェック
                    if ((!value || value.trim() === "") && childProps.required) {
                        error = childProps['data-required-message'];
                    }
                    // パターンチェック
                    else if (value && childProps['data-pattern'] && childProps['data-pattern-message']) {
                        const pattern = new RegExp(childProps['data-pattern']);
                        if (!pattern.test(value)) {
                            error = childProps['data-pattern-message'];
                        }
                    }

                    customErrors[childProps.name] = { error, value };
                }

                // 子要素が存在する場合、再帰的に処理
                if (childProps.children) {
                    validateChildren(childProps.children);
                }
            });
        };

        // バリデーション開始
        validateChildren(children);

        // カスタムエラーがある場合、action は実行せずエラー結果を返す
        if (!hasNoErrors(customErrors)) {
            return Promise.resolve({ formatErrors: customErrors });
        }

        if (action) {
            return await action(prevResult, formData);
        }

        return Promise.resolve({});
    };

    const [state, formDispatch, isPending] = useActionState(
        customDispatch,
        {}
    );

    const injectObservable = (children: React.ReactNode): React.ReactNode =>
        React.Children.map(children, (child) => {
            if (!React.isValidElement(child)) return child;
            const element = child as React.ReactElement<any>;
            if (typeof element.type !== 'string') {
                return React.cloneElement(element, {
                    ...element.props,
                    observable: formSubject.asObservable(),
                    children: element.props.children 
                        ? injectObservable(element.props.children)
                        : null
                });
            }
            return element;
        });


    // 状態が変更されたら Subject に通知
    React.useEffect(() => {
        formSubject.next({ result: state, isPending });
    }, [state, isPending]);

    return (
        <Form.Root action={formDispatch} noValidate>
            {injectObservable(children)}
        </Form.Root>
    );
};

export default ValidationForm;