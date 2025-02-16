import { Observable } from 'rxjs';
import { FormActionResult } from '@/models/form-action-result';

export interface FormTriggerProps<T> {
    trigger: (observable$: Observable<{result: FormActionResult, isPending: boolean}>) => Observable<T>;
    action: (value: T) => void;
}

const FormTrigger = <T,>(_props: FormTriggerProps<T>) => {
    return null;
};

export default FormTrigger;