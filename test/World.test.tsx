import { describe, it, expect, vi } from "vitest";
import { Entity } from "Engine/World/Entity";
import ReactThreeTestRenderer, { act } from "@react-three/test-renderer";

import { parse_world_from_config, ThreeWorld, useWorld, World } from "Engine/World";
import * as EngineWorld from "Engine/World";
import Component from "Engine/World/Component";
import { ResourceManager } from "Engine/Manager/ResourceManager";
import { WorldManager, WorldManagerProvider } from "Engine/Manager/WorldManager";

import log from "loglevel";

import app_config_resource from "Resources/Config/application.config.json";
import file_config_resource from "Resources/Config/resource.config.json";
import { FileConfig } from "Engine/Config/FileResourceConfig";
import { ApplicationConfig } from "Engine/Config/AppConfig";
import { renderHook } from "@testing-library/react";
import { EntityConfig } from "Engine/Config/EntityConfig";

import Engine from "Engine";

vi.mock("loglevel", () => ({
    default: {
        error: vi.fn(),
        info: vi.fn()
    },
}));

describe("ThreeWorld", () => {
    const engine: Engine = new Engine();

    it("should handle the initial world in the scene", async () => {
        const entities = [new Entity(), new Entity()];

        const world = new World(entities);

        const renderer = await ReactThreeTestRenderer.create(<ThreeWorld world={world} />);

        expect(renderer.scene.children.length).toBe(2);
        await renderer.unmount();
    });

    it("should call update on each frame", async () => {
        const entities = [new Entity(), new Entity()];

        let invoke_order: string = "";
        class TestComponent extends Component {
            time: number = 0;
            protected get_name(): string { invoke_order += "0"; return "TestComponent"; }
            initialize(): void { invoke_order += "1"; }
            start(): void { invoke_order += "2"; }
            update(delta: number): void {
                if (this.time == 0) {
                    invoke_order += "3";
                }
                this.time += delta;
            }
            dispose(): void { invoke_order += "4"; }
        }

        const component = new TestComponent(true, entities[0], engine);
        component.initialize();

        const start_spy = vi.spyOn(component, "start");
        const update_spy = vi.spyOn(component, "update");
        const dispose_spy = vi.spyOn(component, "dispose");

        entities[0].add_components(component);

        const world = new World(entities);

        const renderer = await ReactThreeTestRenderer.create(<ThreeWorld world={world} />);

        await ReactThreeTestRenderer.act(async () => {
            await renderer.advanceFrames(60, 100)
            await renderer.unmount();
        });

        expect(start_spy).toHaveBeenCalled();
        expect(update_spy).toHaveBeenCalled();

        //  Dispose shouldn't be called unless the world is explicitly disposed/
        expect(dispose_spy).not.toHaveBeenCalled();

        world.dispose();

        expect(dispose_spy).toHaveBeenCalled();
        expect(invoke_order).toBe("01234");
    });

    it("should call support adding entities", async () => {
        const entities = [new Entity()];
        const world = new World(entities);

        class TestComponent extends Component {
            operation_executed: boolean = false;
            protected get_name(): string { return "TestComponent"; }
            initialize(): void { }
            start(): void { }
            update(): void {
                if (!this.operation_executed) {
                    this.engine.get_manager<WorldManager>(WorldManager.name)!.get_world()!.add_entities(new Entity("New entity"));
                    this.operation_executed = true;
                }
            }
            dispose(): void { }
        }


        const adder_component = new TestComponent(true, entities[0],
            {
                get_manager: () => {
                    return {
                        world: world,
                        get_world: () => { return world; }
                    }
                }
            } as unknown as Engine,
        );

        entities[0].add_components(adder_component);

        const renderer = await ReactThreeTestRenderer.create(<ThreeWorld world={world} />);

        await ReactThreeTestRenderer.act(async () => {
            await renderer.advanceFrames(60, 100);
            expect(renderer.scene.children.length).toBe(2);
            await renderer.unmount();
        });

    });

    it("should call support removing entities", async () => {
        const entities = [new Entity("Entity 1"), new Entity("Entity 2")];
        const world = new World(entities);

        class TestComponent extends Component {
            operation_executed: boolean = false;
            target: string = "";
            protected get_name(): string { return "TestComponent"; }
            initialize(target: string): void { this.target = target; }
            start(): void { }
            update(): void {
                if (!this.operation_executed) {
                    const results = this.engine.get_manager<WorldManager>(WorldManager.name)!.get_world()!.find_by_name(this.target);
                    results[0].destroy();
                    this.operation_executed = true;
                }
            }
            dispose(): void { }
        }

        const deleter_component = new TestComponent(true, entities[0],
            {
                get_manager: () => {
                    return {
                        world: world,
                        get_world: () => { return world; }
                    }
                }
            } as unknown as Engine,
        );
        deleter_component.initialize("Entity 2");

        entities[0].add_components(deleter_component);

        const renderer = await ReactThreeTestRenderer.create(<ThreeWorld world={world} />);

        await ReactThreeTestRenderer.act(async () => {
            await renderer.advanceFrames(60, 100);
            expect(renderer.scene.children.length).toBe(1);
            await renderer.unmount();
        });

    });
    
    it("should be able to call get_three", async () => {
        const entities = [new Entity("Entity 1"), new Entity("Entity 2")];
        const world = new World(entities);
        const renderer = await ReactThreeTestRenderer.create(<ThreeWorld world={world} />);

        await ReactThreeTestRenderer.act(async () => {
            await renderer.advanceFrames(60, 100);
            expect(world.get_three()).toBeDefined();
            expect(world.get_three()?.scene.children.length).toBe(2);
            await renderer.unmount();
        });
    });

    it("shouldn't run if disabled", async () => {
        const entities = [new Entity("Entity 1"), new Entity("Entity 2")];
        const world = new World(entities);
        world.active = false;

        class TestComponent extends Component {
            operation_executed: boolean = false;
            target: string = "";
            protected get_name(): string { return "TestComponent"; }
            initialize(target: string): void { this.target = target; }
            start(): void { }
            update(): void {
                if (!this.operation_executed) {
                    const results = this.engine.get_manager<WorldManager>(WorldManager.name)!.get_world()!.find_by_name(this.target);
                    results[0].destroy();
                    this.operation_executed = true;
                }
            }
            dispose(): void { }
        }

        const deleter_component = new TestComponent(true, entities[0],
            {
                get_manager: () => {
                    return {
                        world: world,
                        get_world: () => { return world; }
                    }
                }
            } as unknown as Engine,
        );
        deleter_component.initialize("Entity 2");

        entities[0].add_components(deleter_component);

        const renderer = await ReactThreeTestRenderer.create(<ThreeWorld world={world} />);

        await ReactThreeTestRenderer.act(async () => {
            await renderer.advanceFrames(60, 100);
            expect(renderer.scene.children.length).toBe(2);
            await renderer.unmount();
        });
    })
});

describe("useWorld", () => {
    it("should return the active world", async () => {
        const engine: Engine = new Engine(); 
        const resource_manager: ResourceManager = new ResourceManager(engine);
        await resource_manager.initialize(file_config_resource as FileConfig);
        engine.add_managers(resource_manager);

        const world_manager: WorldManager = new WorldManager(engine);
        engine.add_managers(world_manager);

        await world_manager.change_scene((app_config_resource as ApplicationConfig).start_scene);

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <WorldManagerProvider manager={world_manager}>{children}</WorldManagerProvider>
        );

        const { result } = renderHook(() => useWorld(), { wrapper });

        await act(async () => {
            await world_manager.change_scene("456");
        });

        expect(result.current).not.toBeUndefined();
    });
    it("should react to world changes", async () => {
        const engine: Engine = new Engine();

        const resource_manager: ResourceManager = new ResourceManager(engine);
        await resource_manager.initialize(file_config_resource as FileConfig);
        engine.add_managers(resource_manager);

        const world_manager: WorldManager = new WorldManager(engine);
        engine.add_managers(world_manager);

        await world_manager.change_scene((app_config_resource as ApplicationConfig).start_scene);

        const attach_spy = vi.spyOn(world_manager.on_scene_change, "attach");
        const notify_spy = vi.spyOn(world_manager.on_scene_change, 'notify');

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <WorldManagerProvider manager={world_manager}>{children}</WorldManagerProvider>
        );

        const { result } = renderHook(() => useWorld(), { wrapper });

        await act(async () => {
            await world_manager.change_scene((app_config_resource as ApplicationConfig).start_scene);
        });

        expect(result.current).not.toBeUndefined();
        expect(attach_spy).toHaveBeenCalled();
        expect(notify_spy).toHaveBeenCalled();
    });

})

describe("parse_world_from_config", () => {
    it("should parse entities from config and return a ThreeWorld component", async () => {
        const engine: Engine = new Engine();
        const resource_manager: ResourceManager = new ResourceManager(engine);
        await resource_manager.initialize(file_config_resource as FileConfig);
        engine.add_managers(resource_manager);

        const parse_spy = vi.spyOn(EngineWorld, "parse_world_from_config");

        const world_manager: WorldManager = new WorldManager(engine);
        engine.add_managers(world_manager);

        await world_manager.change_scene((app_config_resource as ApplicationConfig).start_scene);

        expect(world_manager.get_scene()).toBeDefined();
        expect(world_manager.get_world()).toBeDefined();
        expect(parse_spy).toHaveBeenCalled();
    });

    it("should log an error if entity parsing fails", async () => {
        const engine: Engine = new Engine();

        const resource_manager: ResourceManager = new ResourceManager(engine);
        await resource_manager.initialize(file_config_resource as FileConfig);
        engine.add_managers(resource_manager);

        const world_manager: WorldManager = new WorldManager(engine);
        engine.add_managers(world_manager);

        await parse_world_from_config({
            entities: [
                {
                    components: [],
                    name: "",
                    position: [0, 0, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1],
                },
                undefined as unknown as EntityConfig,
            ]
            },
            engine
        );

        expect(log.error).toHaveBeenCalledWith("Couldn't load entity.");
    });
});
