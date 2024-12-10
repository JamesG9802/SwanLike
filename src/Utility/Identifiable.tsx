import { v6 } from "uuid";

/**
 * Identifiable objects can be uniquely differentiated by their UID (unique identifier).
 */
export default interface Identifiable {
    /**
     * a UUID (unique identifier).
     */
    readonly uuid: string;
}

/**
 * Generates a timestamp based UUID.
 * @returns 
 */
export function generate_UUID() {
    return v6();
}
