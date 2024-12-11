/**
 * Identifiable objects can be uniquely differentiated by their UID (unique identifier).
 */
export default interface Identifiable {
    /**
     * a UUID (unique identifier).
     */
    readonly uuid: string;
}
