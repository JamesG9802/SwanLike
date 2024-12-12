import log from "loglevel";

import { Object3D } from "three";
import { ResourceManager } from "../Managers/ResourceManager";
import { WorldManager } from "../Managers/WorldManager";
import { Entity } from "./Entity";
import { ComponentConfig } from "Engine/Config/ComponentConfig";

/**
 * Base class for all scripts attached to entities.
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
     * Reference to the resource manager.
     */
    resource_manager_ref: ResourceManager;

    /**
     * Reference to the world manager;
     */
    world_manager_ref: WorldManager;

    /**
     * Creates a new component.
     * @param name the name of the component for querying.
     * @param active whether the component is active or not.
     * @param game_object the entity the component is attached to.
     * @param resource_manager_ref a reference to the resource manager.
     * @param world_manager_ref a reference to the world manager.
     */
    constructor(active: boolean, game_object: Object3D,
        resource_manager_ref: ResourceManager, world_manager_ref: WorldManager
    ) {
        //  We can't add the name to the constructor because components 
        //  only know their name after being created 😔.
        this.name = this.get_name();
        this.active = active;
        this.game_object = game_object;

        this.resource_manager_ref = resource_manager_ref;
        this.world_manager_ref = world_manager_ref;
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
}

/**
 * Parses a component from the component config JSON.
 * @param component_config the component config JSON,
 * @param entity the entity the component will be attached to.
 * @param resource_manager the resource manager.
 * @param world_manager the world manager.
 * @returns 
 */
export async function parse_components_from_config(component_config: ComponentConfig,
    entity: Entity,
    resource_manager: ResourceManager, world_manager: WorldManager): Promise<Component | undefined> {
    //  The constructor matches `Component`'s constructor.
    type ComponentConstructor = new (...args: ConstructorParameters<typeof Component>) => Component;

    const component_module: { default: ComponentConstructor } | undefined = await resource_manager.load(component_config.uuid);

    if (component_module == undefined) {
        log.error("Couldn't instantiate the component");
        return undefined;
    }

    const component = new component_module.default(
        component_config.active,
        entity,
        resource_manager,
        world_manager
    );
    component.initialize(component_config.data);
    return component;
}