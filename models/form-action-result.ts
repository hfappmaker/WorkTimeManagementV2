/**
 * Represents the result of an action.
 */
interface FormActionResult {
    errors?: Record<string, { error: string | undefined, value: string }>;
    success?: string;
}

export type {
    FormActionResult
};