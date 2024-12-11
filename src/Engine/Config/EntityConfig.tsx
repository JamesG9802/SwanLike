import { ComponentConfig } from "./ComponentConfig";

/**
 * The format of Entity Config JSONs.
 */
export interface EntityConfig {
    /**
     * Any components the entity has.
     */
    components: ComponentConfig[],
    
    /**
     * The name of the entity.
     */
    name: string,

    /**
     * The initial position of the entity.
     */
    position: [number, number, number],

    /**
     * The initial rotation of the entity.
     */
    rotation: [number, number, number],

    /**
     * The initial scale of the entity.
     */
    scale: [number, number, number],
}