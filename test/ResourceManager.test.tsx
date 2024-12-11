import { describe, it, expect, vi, beforeEach } from "vitest";
import { FileConfig, FileResourceType } from "Engine/Config/FileResourceConfig";
import { ResourceManager } from "Engine/Managers/ResourceManager";

import log from "loglevel";

vi.mock("loglevel", () => ({
    default: {
        error: vi.fn(),
    },
}));

describe("ResourceManager", () => {
    let resource_manager: ResourceManager;
    let file_config: FileConfig;

    beforeEach(() => {
        resource_manager = new ResourceManager();

        file_config = {
            files: [
                {
                    uuid: "123",
                    type: FileResourceType.component,
                    file_path: "/src/Engine/Scripts/script1.tsx",
                },
                {
                    uuid: "456",
                    type: FileResourceType.scene,
                    file_path: "/src/Resources/scene/scene1.json",
                },
            ],
        };
    });

    it("should initialize resources correctly", async () => {
        const mockGlob = {
            "/src/Resources/scene/scene1.json": vi.fn(async () => ({ name: "Scene1" })),
            "/src/Engine/Scripts/script1.tsx": vi.fn(async () => ({ default: "Script1" })),
        };

        vi.stubGlobal("import.meta", {
            glob: vi.fn(() => mockGlob),
        });

        await resource_manager.initialize(file_config);

        expect(resource_manager.has("123")).toBe(true);
        expect(resource_manager.has("456")).toBe(true);
    });

    it("should load a resource correctly", async () => {
        const originalGlob = import.meta.glob;
        const mockGlob = {
            "/src/Resources/scene/scene1.json": async () => ({ name: "Scene1" }),
            "/src/Engine/Scripts/script1.tsx": async () => ({ default: "Script1" }),
        };

        import.meta.glob = vi.fn(() => mockGlob);

        await resource_manager.initialize(file_config);

        expect(resource_manager.has("123")).toBe(true);
        expect(resource_manager.has("456")).toBe(true);

        import.meta.glob = originalGlob; // Restore the original function
    });

    it("should return true for an existing resource", async () => {
        await resource_manager.initialize(file_config);
        expect(resource_manager.has("123")).toBe(true);
    });

    it("should return false for non-existent resources", () => {
        expect(resource_manager.has("non-existent-uuid")).toBe(false);
    });

    it("should not load a resource that does not exist", async () => {
        const result = await resource_manager.load("non-existent-uuid");
        expect(result).toBeUndefined();
    });

    it("should log an error when attempting to load a missing resource", async () => {
        const log = await import("loglevel");
        await resource_manager.load("non-existent-uuid");

        expect(log.default.error).toHaveBeenCalledWith("Couldn't load resource: (non-existent-uuid)");
    });

    it("should log an error when a resource cannot be loaded", async () => {
        const originalGlob = import.meta.glob;
        const mockGlob = {
            "/src/Resources/scene/scene1.json": async () => ({ name: "Scene1" }),
            "/src/Engine/Scripts/script1.tsx": async () => {
                throw new Error();
            },
        };

        import.meta.glob = vi.fn(() => mockGlob);

        await resource_manager.initialize(file_config);

        expect(resource_manager.has("456")).toBe(true);

        await resource_manager.load("456");

        expect(log.error).toHaveBeenCalledWith(`Couldn't import file data ${456}.`);

        import.meta.glob = originalGlob; // Restore the original function
    });
});
