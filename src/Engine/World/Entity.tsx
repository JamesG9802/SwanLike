import log from "loglevel";

import * as THREE from 'three';

import Component, { parse_components_from_config } from "./Component"
import { ResourceManager } from '../Managers/ResourceManager';
import { WorldManager } from "../Managers/WorldManager";
import { EntityConfig } from "Engine/Config/EntityConfig";

/**
 * An entity is a basic Object3D with support for component scripts.
 */
export class Entity extends THREE.Object3D {
    /**
     * The components the entity has.
     */
    components: Component[] = [];

    /**
     * Whether the entity is going to be destroyed.
     */
    private _death_flag: boolean = false;

    /**
     * Create an Entity with a name.
     * @param name (Optional) the name of the entity.
     */
    constructor(name: string = "") {
        super();
        this.name = name;
    }

    /**
     * Add components to the entity.
     * @param components 
     */
    add_components(...components: Component[]) {
        this.components = [...this.components, ...components];
    }

    /**
     * Invoke all components that need to start.
     */
    start() {
        for (let i = 0; i < this.components.length; i++) {
            this.components[i].start();
        }
    }

    /**
     * Invoke all components' update function
     * @param delta - the time since the last frame
     */
    update(delta: number) {
        for (let i = 0; i < this.components.length; i++) {
            if (this.components[i].active) {
                this.components[i].update(delta);
            }
        }
    }

    /**
     * Mark this entity for destruction.
     */
    destroy() {
        this._death_flag = true;
    }

    /**
     * Returns true if this entity is marked for destruction.
     * @returns 
     */
    will_destroy(): boolean {
        return this._death_flag;
    }

    cleanup() {
        for (let i = 0; i < this.components.length; i++) {
            this.components[i].dispose();
        }
    }
}

/**
 * Parses an entity from a config JSON.
 * @param entity_config the entity JSON.
 * @param resource_manager the resource manager.
 * @param world_manager the world manager.
 * @returns 
 */
export async function parse_entities_from_config(entity_config: EntityConfig,
    resource_manager: ResourceManager, world_manager: WorldManager
): Promise<Entity> {
    const entity = new Entity(entity_config.name);

    entity.position.set(entity_config.position[0], entity_config.position[1], entity_config.position[2])

    entity.rotation.set(entity_config.rotation[0], entity_config.rotation[1], entity_config.rotation[2], "XYZ");

    entity.scale.set(entity_config.scale[0], entity_config.scale[1], entity_config.scale[2]);

    const components: Component[] = [];
    const promises: Promise<Component | undefined>[] = [];

    for (let i = 0; i < entity_config.components.length; i++) {
        promises.push(parse_components_from_config(entity_config.components[i], entity, resource_manager, world_manager));
    }

    const results = await Promise.allSettled(promises);

    results.forEach((result) => {
        if (result.status === 'fulfilled') {
            if (result.value == undefined) {
                log.error("Component did not load.");
            }
            else {
                components.push(result.value);
            }
        }
    });
    entity.add_components(...components);
    return entity;
}