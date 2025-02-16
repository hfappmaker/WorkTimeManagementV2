"use client"

import React, { useActionState } from 'react';
import * as Form from '@radix-ui/react-form';
import { FormActionResult } from '@/models/form-action-result';
import { Subject, Subscription } from 'rxjs';
import ValidationFormBehavior ,{ ValidationFormBehaviorProps } from './validation-form-behavior';

const ValidationForm: React.FC<{
    action: (prevResult: FormActionResult, data: FormData) => Promise<FormActionResult>,
    children: React.ReactNode,
}> = ({ action, children }) => {
    // Subject の作成
    const formSubject = React.useMemo(() => {
        console.log("Creating new Subject");
        return new Subject<{
        result: FormActionResult;
        isPending: boolean;
    }>()}, []);

    // FormTrigger コンポーネントを探して設定を取得
    React.useEffect(() => {
        console.log("Setting up FormTrigger subscriptions");
        const subscriptions: Subscription[] = [];

        React.Children.forEach(children, child => {
            if (React.isValidElement(child) && child.type === ValidationFormBehavior) {
                const triggerProps = child.props as ValidationFormBehaviorProps<any>;
                const transformed$ = triggerProps.trigger(formSubject.asObservable());
                
                // 変換されたストリームを購読
                const subscription = transformed$.subscribe(value => {
                    console.log("FormTrigger subscription triggered with value:", value);
                    triggerProps.action(value);
                });

                subscriptions.push(subscription);
            }
        });

        return () => {
            console.log("Cleaning up FormTrigger subscriptions");
            subscriptions.forEach(subscription => subscription.unsubscribe());
        }
    }, [formSubject]);

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

    const injectObservable = (children: React.ReactNode): React.ReactNode =>{
        console.log("injectObservable called");
        return React.Children.map(children, (child) => {
            if (!React.isValidElement(child)) return child;
            const element = child as React.ReactElement<any>;
            console.log("Before Injecting observable to:", typeof element.type + ':' + element.props.name || 'Unknown Component');
            // Componentの場合
            if (typeof element.type !== 'string') {
                console.log("Injecting observable to:", element.type.name + ':' + element.props.name || 'Unknown Component');
                return React.cloneElement(element, {
                    ...element.props, // 既存のpropsを保持
                    observable: formSubject.asObservable(),
                    children: element.props.children 
                        ? injectObservable(element.props.children)
                        : null
                });
            }
            // childrenがある場合
            else if (element.props.children){
                return React.cloneElement(element, {
                    ...element.props, // 既存のpropsを保持
                    children: injectObservable(element.props.children)
                });
            }
            return element;
        });
    }

        
    const content = React.useMemo(() => {
        console.log("Recalculating content");
        return injectObservable(children);
    }, [children, injectObservable]);

    // 状態が変更されたら Subject に通知
    React.useLayoutEffect(() => {
        console.log("Emitting new state:", state);
        formSubject.next({ result: state, isPending });
    }, [state, isPending]);

    return (
        <Form.Root action={formDispatch} noValidate>
            {content}
        </Form.Root>
    );
};

export default ValidationForm;