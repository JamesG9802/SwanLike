import log from "loglevel";

import * as THREE from 'three';

import Component, { parse_components_from_config } from "./Component"
import { ResourceManager } from '../Managers/ResourceManager';
import { WorldManager } from "../Managers/WorldManager";
import { EntityConfig } from "Engine/Config/EntityConfig";
import { InputManager } from "Engine/Managers/InputManager";

/**
 * An entity is a basic Object3D with support for component scripts.
 * 
 * # Entity
 * Based on GameObjects from Unity, entities are the base unit of worlds.
 * 
 * ## Event Lifecycle
 * Entities have a similar event lifecycle to Unity GameObjects.
 * 
 * ### Start
 * On creation, an entity invokes `start` on all `Component`s attached to it.
 * @see {@link start}
 * @see {@link Component.start}
 * 
 * ### Update
 * When an entity updates, it first initializes any components that have been attached to it
 * since the last time it has updated.
 * Then it invokes `update` on all components attached to it.
 * Finally, any components marked for destruction have `dispose` invoked and are removed.
 * 
 * ### Dispose
 * When an entity's destruction is being finalized, it also invokes `dispose` on all components.
 * 
 * ## Compoent List Modification
 * Additions to the component map are visible immediately.
 * - Also, only one instance of a component type is allowed.
 * Deletions to the component map are processed at the end of the update frame, so they can be referenced without worry.
 * 
 * @see {@link update}
 * 
 */
export class Entity extends THREE.Object3D {
    /**
     * Components that will be added to the component list.
     */
    private future_components: Map<string, Component>;

    /**
     * The components the entity has.
     */
    private components: Map<string, Component>;

    /**
     * Whether the entity is going to be destroyed.
     */
    private _death_flag: boolean;

    /**
     * Create an Entity with a name.
     * @param name (Optional) the name of the entity.
     */
    constructor(name: string = "") {
        super();
        this.name = name;

        this.future_components = new Map<string, Component>();
        this.components = new Map<string, Component>();
        this._death_flag = false;
    }

    /**
     * Returns an iterator going through the entity's components.
     * @returns
     */
    *get_components_iter(): IterableIterator<[string, Component]> {
        // Iterate over entries in `this.components`
        for (const [key, value] of this.components.entries()) {
            yield [key, value];
        }
        // Iterate over entries in `this.future_components`
        for (const [key, value] of this.future_components.entries()) {
            yield [key, value];
        }
    }

    /**
     * Returns a dictionary of the entity's components.
     * Note: this is NOT the entity's actual map of components, so while you can modify
     * the components, modifying the map itself (by trying to add/remove components)
     * does not affect the actual entity. 
     * @returns 
     */
    get_components(): Map<string, Component> {
        const dictionary: Map<string, Component> = new Map();
        const iterator = this.get_components_iter();

        for (const [key, value] of iterator) {
            dictionary.set(key, value);
        }
        return dictionary;
    }

    /**
     * Add components to the entity.
     * @param components 
     */
    add_components(...components: Component[]) {
        for (let i = 0; i < components.length; i++) {
            //  Component exists
            if (this.components.has(components[i].name) || this.future_components.has(components[i].name)) {
                log.warn(`Entity ${this.name} already has ${components[i].name}.`);
            }
            else {
                this.future_components.set(components[i].name, components[i]);
            }
        }
    }

    /**
     * Remove components to the entity.
     * @param component_names the names of the component.   
     */
    remove_components(...component_names: string[]) {
        for (let i = 0; i < component_names.length; i++) {
            this.future_components.get(component_names[i])?.destroy();
            this.components.get(component_names[i])?.destroy();
        }
    }

    /**
     * Invoke all components that need to start.
     */
    start() {
        this.future_components.forEach((component, name) => {
            component.start();
            this.components.set(name, component);
            this.future_components.delete(name);
        });
    }

    /**
     * Invoke all components' update function
     * @param delta - the time since the last frame
     */
    update(delta: number) {
        this.future_components.forEach((component, name) => {
            if (component.will_destroy()) {
                return;
            }
            component.start();
            this.components.set(name, component);
            this.future_components.delete(name);
        });

        this.components.forEach((component) => {
            if (component.active) {
                component.update(delta);
            }
        });

        this.cleanup();
    }

    /**
     * Remove all components that are marked for destruction.
     */
    protected cleanup() {
        this.future_components.forEach((component) => {
            if (component.will_destroy()) {
                component.dispose();
                this.future_components.delete(component.name);
            }
        });

        this.components.forEach((component) => {
            if (component.will_destroy()) {
                component.dispose();
                this.components.delete(component.name);
            }
        });
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

    /**
     * Cleanup all resources owned by this entity.
     * NOTE: this should NOT be used for destroying an entity.
     * @see {@link destroy} for destroying an entity in a safe manner.
     */
    dispose() {
        this.future_components.forEach((component) => {
            component.dispose();
        });
        this.components.forEach((component) => {
            component.dispose();
        });
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
    resource_manager: ResourceManager, 
    world_manager: WorldManager,
    input_manager: InputManager,
): Promise<Entity> {
    const entity = new Entity(entity_config.name);

    entity.position.set(entity_config.position[0], entity_config.position[1], entity_config.position[2])

    entity.rotation.set(entity_config.rotation[0], entity_config.rotation[1], entity_config.rotation[2], "XYZ");

    entity.scale.set(entity_config.scale[0], entity_config.scale[1], entity_config.scale[2]);

    const components: Component[] = [];
    const promises: Promise<Component | undefined>[] = [];

    for (let i = 0; i < entity_config.components.length; i++) {
        promises.push(
            parse_components_from_config(
                entity_config.components[i], 
                entity, 
                resource_manager, 
                world_manager,
                input_manager
            )
        );
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