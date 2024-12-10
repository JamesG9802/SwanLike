import log from "loglevel";

import { Listener } from "Utility/EventHandler";
import { useEffect, useRef, useState } from "react";
import { Entity, EntityConfig, parse_entities_from_config } from "Three/World/Entity";
import { RootState, useFrame, useThree } from "@react-three/fiber";
import { _XRFrame } from "@react-three/fiber/dist/declarations/src/core/utils";
import { useWorldManager, WorldManager } from "Three/Managers/WorldManager";
import { ResourceManager } from "Three/Managers/ResourceManager";

/**
 * The format of World config JSONs.
 */
export type WorldConfig = {
    /**
     * All the entities in the world.
     */
    entities: EntityConfig[]
}

/**
 * The props for the Three React component of a world.
 */
export type ThreeWorldProps = {
    /**
     * All the entities in the world.
     */
    entities: Entity[]
};

/**
 * The Three React component of a world.
 * @returns 
 */
export function ThreeWorld({ entities }: ThreeWorldProps): JSX.Element {
    const { scene } = useThree();
    const entities_ref = useRef<Entity[]>([]);

    //  On initialization, store a deep copy of the entities. 
    //  The entities' scripts' Start function are all invoked.
    useEffect(() => {
        entities_ref.current = [...entities];
        for(let i = 0; i < entities.length; i++) {
            entities[i].start();
        }

        scene.add(...entities_ref.current);

        return () => {
            scene.remove(...entities_ref.current);
        }
    }, []);

    useFrame(Update);

    //  Every animation frame, the Update function is called.
    function Update(_state: RootState, delta: number, _frame: _XRFrame) {
        for(let i = 0; i < entities_ref.current.length; i++) {
            entities_ref.current[i].update(delta);
        }

        //  Any entities marked for destruction will be removed.
        for(let i = 0; i < entities_ref.current.length; i++) {
            if(entities_ref.current[i].will_destroy()) {
                entities_ref.current.splice(i, 1);
                i -= 1;
            }
        }
    }

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
    resource_manager: ResourceManager, world_manager: WorldManager): Promise<JSX.Element> 
{
    let entities: Entity[] = [];
    let promises: Promise<Entity>[] = []; 

    for(let i = 0; i < world_config.entities.length; i++) {
        promises.push(parse_entities_from_config(world_config.entities[i], resource_manager, world_manager));
    }

    let results = await Promise.allSettled(promises);
    
    //  Add all successfully loaded entities.
    results.forEach((result) => {
        if (result.status === 'fulfilled') {
            entities.push(result.value);
        } 
        else {
            log.error(result.reason);
        }
    });

    return <ThreeWorld entities={entities}/>;
}