/**
 * Represents the result of an action.
 */
interface FormActionResult {
    formatErrors?: Record<string, { error: string | undefined, value: string }>;
    success?: string;
}

export type {
    FormActionResult
};