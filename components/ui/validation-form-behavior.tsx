import { Observable } from 'rxjs';
import { FormActionResult } from '@/models/form-action-result';

export interface ValidationFormBehaviorProps<T> {
    trigger: (observable$: Observable<{result: FormActionResult, isPending: boolean}>) => Observable<T>;
    action: (value: T) => void;
}

const ValidationFormBehavior = <T,>(_props: ValidationFormBehaviorProps<T>) => {
    return null;
};

export default ValidationFormBehavior;