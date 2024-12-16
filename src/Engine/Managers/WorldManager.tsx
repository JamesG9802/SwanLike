import log from "loglevel";

import EventHandler from "Utility/EventHandler";
import { createContext, useContext } from "react";
import { ResourceManager } from "./ResourceManager";
import { parse_world_from_config, ThreeWorld, World } from "Engine/World";
import { WorldConfig } from "Engine/Config/WorldConfig";
import { InputManager } from "./InputManager";

/**
 * A manager of all possible scenes and controls the current scene of the application.
 */
export class WorldManager {
    /**
     * An event handler for when the scene changes.
     */
    public readonly on_scene_change: EventHandler<WorldManager, void>;

    /**
     * A reference to the resource manager.
     */
    private readonly resource_manager_ref: ResourceManager;

    /**
     * Reference to the input manager.
     */
    private readonly input_manager_ref: InputManager;

    /**
     * The current world.
     */
    private world?: World;

    constructor(start_scene_uuid: string, resource_manager: ResourceManager, input_manager: InputManager) {
        this.on_scene_change = new EventHandler<WorldManager, void>(this);
        this.resource_manager_ref = resource_manager;
        this.input_manager_ref = input_manager;

        this.change_scene(start_scene_uuid);
    }

    /**
     * Gets the current scene from the world manager, if it exists.
     * @returns the current scene or undefined if it doesn't exist.
     */
    get_scene(): React.ReactNode | undefined {
        return (
            <>
                {
                    this.world && <ThreeWorld world={this.world} />
                }
            </>
        );
    }

    /**
     * Changes the current scene if the new scene exists. Event listeners are notified. 
     * @param scene_uid the new scene's uid.
     * @returns true if the operation was successful and false otherwise
     */
    async change_scene(scene_uuid: string): Promise<boolean> {
        log.info(`Changing scene to ${scene_uuid}.`);
        const world_config = await this.resource_manager_ref.load<WorldConfig>(scene_uuid);

        if (world_config == undefined) {
            log.error(`Failed to load world config ${scene_uuid}`);
            return false;
        }

        this.world = await parse_world_from_config(
            world_config, 
            this.resource_manager_ref, 
            this,
            this.input_manager_ref
        );
        this.on_scene_change.notify();

        return true;
    }

    get_world(): World | undefined {
        return this.world;
    }
}

/**
 * Context providing the World Manager to all children elements. 
 */
export const WorldManagerContext = createContext<WorldManager | undefined>(undefined);

/**
 * Hook to access the world manager.
 * @returns 
 */
export function useWorldManager(): WorldManager | undefined {
    const world_context = useContext<WorldManager | undefined>(WorldManagerContext);
    if (!world_context) {
        log.error("useWorldManager hook must be used with a WorldManagerProvider");
        return undefined;
    }
    return world_context;
}

/**
 * Props for the WorldManagerProvider. 
 */
export type WorldProviderProps = {
    /**
     * The HTML the provider wraps around.
     */
    children: React.ReactNode,

    /**
     * The manager of the worlds.
     */
    manager: WorldManager
}

/**
 * Provider for WorldManager.
 * @param param0 
 * @returns 
 */
export function WorldManagerProvider({ children, manager }: WorldProviderProps) {
    return (
        <WorldManagerContext.Provider value={manager}>
            {children}
        </WorldManagerContext.Provider>
    );
}