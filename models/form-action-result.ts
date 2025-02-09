/**
 * Represents the result of an action.
 */
interface FormActionResult {
    errors?: Record<string, string>;
    success?: string;
}

export type {
    FormActionResult
};