import { EntityConfig } from "./EntityConfig"

/**
 * The format of World config JSONs.
 */
export type WorldConfig = {
    /**
     * All the entities in the world.
     */
    entities: EntityConfig[]
}
