import { describe, it, expect, vi, beforeEach } from "vitest";

import { renderHook } from "@testing-library/react";
import { createElement } from "react";
import log from "loglevel";
import { ResourceManager } from "Engine/Manager/ResourceManager";
import { useWorldManager, WorldManager, WorldManagerProvider } from "Engine/Manager/WorldManager";
import { World } from "Engine/World";
import { InputManager } from "Engine/Manager/InputManager";
import Engine from "Engine";

vi.mock("loglevel", () => ({
    default: {
        error: vi.fn(),
        info: vi.fn(),
    },
}));

vi.mock("Engine/World", () => ({
    World: vi.fn(() => { return { entities: [] } }),
    ThreeWorld: vi.fn(() => <div>World</div>),
    parse_world_from_config: vi.fn(async () => new World([])),
}));

describe("WorldManager", () => {
    let engine: Engine;
    let resource_manager: ResourceManager;
    let input_manager: InputManager;
    let worldmanager: WorldManager;

    beforeEach(() => {
        engine = new Engine;
        
        resource_manager = new ResourceManager(engine);
        engine.add_managers(resource_manager);
        
        input_manager = new InputManager(engine)
        engine.add_managers(input_manager);
        
        worldmanager = new WorldManager(engine);
        engine.add_managers(worldmanager)

    });

    it("should initialize with the starting scene", async () => {
        vi.spyOn(resource_manager, "load").mockResolvedValue({ name: "Test World Config" });

        const changeSceneSpy = vi.spyOn(worldmanager, "change_scene");
        await worldmanager.change_scene("123");

        expect(changeSceneSpy).toHaveBeenCalledWith("123");
        expect(resource_manager.load).toHaveBeenCalledWith("123");
        expect(worldmanager.get_scene()).not.toBeUndefined();
    });

    it("should return undefined if the scene does not exist", async () => {
        vi.spyOn(resource_manager, "load").mockResolvedValue(undefined);

        const result = await worldmanager.change_scene("non-existent");
        expect(result).toBe(false);
        expect(log.error).toHaveBeenCalledWith("Failed to load world config non-existent");
    });

    it("should log info when changing scenes", async () => {
        vi.spyOn(resource_manager, "load").mockResolvedValue({ name: "Test World Config" });

        await worldmanager.change_scene("456");
        expect(log.info).toHaveBeenCalledWith("Attempting to change scene to 456.");
    });

    it("should notify listeners on scene change", async () => {
        const listener = vi.fn();
        worldmanager.on_scene_change.attach(listener);

        vi.spyOn(resource_manager, "load").mockResolvedValue({ name: "Test World Config" });
        await worldmanager.change_scene("123");

        expect(listener).toHaveBeenCalled();
    });
});

describe("WorldManagerProvider and useWorldManager", () => {
    it("should provide the WorldManager instance via context", () => {
        const engine: Engine = new Engine()
        const manager = new WorldManager(engine);
        const wrapper = ({ children }: { children: React.ReactNode }) =>
            createElement(WorldManagerProvider, { manager, children });

        const { result } = renderHook(() => useWorldManager(), { wrapper });
        expect(result.current).toBe(manager);
    });

    it("should log an error if useWorldManager is used outside of provider", () => {
        const { result } = renderHook(() => useWorldManager());
        expect(result.current).toBeUndefined();
        expect(log.error).toHaveBeenCalledWith("useWorldManager hook must be used with a WorldManagerProvider");
    });
});
