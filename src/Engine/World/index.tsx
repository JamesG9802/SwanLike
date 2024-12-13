import log from "loglevel";

import { Listener } from "Utility/EventHandler";
import { useEffect, useRef, useState } from "react";
import { Entity, parse_entities_from_config } from "Engine/World/Entity";
import { RootState, useFrame, useThree } from "@react-three/fiber";
import { useWorldManager, WorldManager } from "Engine/Managers/WorldManager";
import { ResourceManager } from "Engine/Managers/ResourceManager";
import { WorldConfig } from "Engine/Config/WorldConfig";
import { Scene } from "three";

/**
 * The logical representation of a scene containing entities.
 * 
 * # World
 * Based on Scenes from Unity, worlds enforce several invariants on their state.
 * 
 * ## Entity update order
 * Only entities at the start of the frame will update. If any entities are added, such as through:
 * `world.add_entities(entity)`
 * 
 * @see {@link add_entities}
 * 
 * that entity is guaranteed to only update in the next update invocation.
 * 
 * ## Entity list modification
 * Additions to the entity list are visible immediately.
 * Deletions to the entity list are processed at the end of the update frame, so they can still be referenced without worry.
 * 
 * @see {@link update}
 */
export class World {
    /**
     * The entities of the world.
     */
    private entities: Entity[];

    /**
     * The Three.JS scene container that will be rendered to a JSX.component.
     */
    private scene?: Scene;

    /**
     * Creates a world based on entities.
     * @param entities
     */
    constructor(entities: Entity[]) {
        this.entities = entities;
    }

    /**
     * Adds the Three.js scene to the world.
     * @param scene
     */
    link_scene(scene: Scene) {
        this.scene = scene;
    } 

    /**
     * Starts the world by initializing all entities.
     */
    start() {
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].start();
        }
    }

    /**
     * Runs an iteration of the update cycle over all entities.
     * @param _state 
     * @param delta 
     */
    update(_state: RootState, delta: number) {
        this.entities.forEach((entity) => {
            entity.update(delta);
        });

        this.cleanup();
    }

    /**
     * After updates, cleanup any entities marked for destruction.
     */
    protected cleanup() {
        for (let i = 0; i < this.entities.length; i++) {
            if (this.entities[i].will_destroy()) {
                this.entities[i].dispose();
                this.scene?.remove(this.entities[i]);
                this.entities.splice(i, 1);
                i -= 1;
            }
        }
    }

    /**
     * Returns a list of all entities.
     * @returns 
     */
    get_entities(): readonly Entity[] {
        return this.entities;
    }

    /**
     * Add entities to the world.
     * @param entities 
     */
    add_entities(...entities: Entity[]) {
        this.entities = [...this.entities, ...entities];
        
        if(this.scene != undefined) {
            for(let i = 0; i < entities.length; i++) {
                this.scene.add(entities[i]);
            }
        }
    }

    /**
     * Return a list of entities by name.
     * @param name 
     * @returns 
     */
    find_by_name(name: string): Entity[] {
        return this.entities.filter((entity) => {
            return entity.name == name;
        });
    }
}

/**
 * The props for the Three React component of a world.
 */
export type ThreeWorldProps = {
    /**
     * The actual world data
     */
    world: World
};

/**
 * The Three React component of a world.
 * @returns 
 */
export function ThreeWorld({ world }: ThreeWorldProps): JSX.Element {
    const { scene } = useThree();
    const world_ref = useRef<World>();

    //  On initialization, store a deep copy of the entities. 
    //  The entities' scripts' Start function are all invoked.
    useEffect(() => {
        world_ref.current = world;
        world_ref.current.link_scene(scene);
        scene.add(...world_ref.current.get_entities());
        world_ref.current.start();

        return () => {
            scene.remove(...world_ref.current!.get_entities());

            //  explicitly call cleanup on entities
            for (let i = 0; i < world_ref.current!.get_entities().length; i++) {
                world_ref.current!.get_entities()[i].dispose();
            }
            log.info("Cleaning up scene.");
        }
    }, [scene, world]);

    //  Every animation frame, the Update function is called.
    useFrame((_state, delta) => {
        if (world_ref.current != undefined) {
            world_ref.current.update(_state, delta);
        }
    });

    return (
        <>
        </>
    );
}

/**
 * Hook to access the current world from the current `WorldManagerProvider`.
 * @returns 
 */
export function useWorld(): React.ReactNode | undefined {
    const world_manager = useWorldManager();
    const [current_world, set_current_world] = useState(world_manager?.get_scene());

    useEffect(() => {
        const on_change_scene: Listener<WorldManager, void> = (world_manager) => {
            set_current_world(world_manager.get_scene());
        };

        world_manager?.on_scene_change.attach(on_change_scene);
        return () => {
            world_manager?.on_scene_change.detach(on_change_scene);
        }

    }, [world_manager]);

    return current_world;
}

/**
 * Parses a world config into a world
 * @param world_config the world config JSON object
 * @param resource_manager the resource manager
 * @param world_manager the world manager
 * @returns the Three React world component.
 */
export async function parse_world_from_config(world_config: WorldConfig,
    resource_manager: ResourceManager, world_manager: WorldManager): Promise<World> {
    const entities: Entity[] = [];
    const promises: Promise<Entity>[] = [];

    for (let i = 0; i < world_config.entities.length; i++) {
        promises.push(parse_entities_from_config(world_config.entities[i], resource_manager, world_manager));
    }

    const results = await Promise.allSettled(promises);

    //  Add all successfully loaded entities.
    results.forEach((result) => {
        if (result.status === 'fulfilled') {
            entities.push(result.value);
        }
        else {
            log.error(result.reason);
            log.error("Couldn't load entity.");
        }
    });

    return new World(entities);
}