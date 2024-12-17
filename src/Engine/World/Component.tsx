import log from "loglevel";

import { Object3D } from "three";
import { ResourceManager } from "../Manager/ResourceManager";
import { Entity } from "./Entity";
import { ComponentConfig } from "Engine/Config/ComponentConfig";
import Engine from "Engine";

/**
 * Base class for all scripts attached to entities.
 * 
 * # Component
 * Based on components from Unity, components support the aptly named Composite design pattern.
 * Components are responsible for all the functionality of `Entity` objects.
 * 
 * @see {@link Entity}
 * @see {@link https://en.wikipedia.org/wiki/Composite_pattern}
 */
export default abstract class Component {
    /**
     * The name of the component.
     */
    name: string;

    /**
     * Whether or not the component is active or not.
     */
    active: boolean;

    /**
     * The object the component is attached to.
     */
    game_object: Object3D;

    /**
     * Whether the component is going to be destroyed.
     */
    private death_flag: boolean;

    /**
     * The reference to the Three.JS engine the component lives in. 
     */
    protected engine: Engine;

    /**
     * Creates a new component.
     * @param name the name of the component for querying.
     * @param active whether the component is active or not.
     * @param game_object the entity the component is attached to.
     * @param engine the Three.JS engine the component lives in. 
     */
    constructor(active: boolean, game_object: Object3D, engine: Engine) {
        //  We can't add the name to the constructor because components 
        //  only know their name after being created 😔.
        this.name = this.get_name();
        this.active = active;
        this.game_object = game_object;

        this.engine = engine;

        this.death_flag = false;
    }

    /**
     * Gets the component's name.
     */
    protected abstract get_name(): string;

    /**
     * Initialize the component with the data needed to properly handle starting up.
     * @param data - any data for the component.
     */
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    abstract initialize(data: any): void;

    /**
     * Called when the component is initialized (after all components have been added).
     */
    abstract start(): void;

    /**
     * Called during the update step of the application.
     */
    abstract update(delta: number): void;

    /**
     * Called when the component is being destroyed.
     */
    abstract dispose(): void;

    /**
     * Mark this component for destruction.
     */
    destroy() {
        this.death_flag = true;
    }

    /**
     * Returns true if this component is marked for destruction.
     * @returns 
     */
    will_destroy(): boolean {
        return this.death_flag;
    }
}

/**
 * Parses a component from the component config JSON.
 * @param component_config the component config JSON,
 * @param entity the entity the component will be attached to.
 * @param engine the Three.JS engine.
 * @returns 
 */
export async function parse_components_from_config(component_config: ComponentConfig,
    entity: Entity,
    engine: Engine
): Promise<Component | undefined> {
    //  The constructor matches `Component`'s constructor.
    type ComponentConstructor = new (...args: ConstructorParameters<typeof Component>) => Component;

    const component_module: { default: ComponentConstructor } | undefined = await engine
        .get_manager<ResourceManager>(ResourceManager.name)!
        .load(component_config.uuid);

    if (component_module == undefined) {
        log.error("Couldn't instantiate the component");
        return undefined;
    }

    const component = new component_module.default(
        component_config.active,
        entity,
        engine
    );
    component.initialize(component_config.data);
    return component;
}