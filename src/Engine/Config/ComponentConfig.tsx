/**
 * The format of Component config JSONs.
 */
export interface ComponentConfig {
    /**
     * The UUID of the component.
     */
    uuid: string,

    /**
     * Whether the component starts active or not.
     */
    active: boolean,

    /**
     * Any data that the component should receive.
     */
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    data?: any
}