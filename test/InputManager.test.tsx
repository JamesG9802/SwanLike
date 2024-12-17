import { describe, it, expect, vi, beforeEach } from "vitest";
import { InputManager } from "Engine/Manager/InputManager";

vi.mock("loglevel", () => ({
    default: {
        error: vi.fn(),
    },
}));

describe("InputManager", () => {
    let input_manager: InputManager;

    beforeEach(() => {
        input_manager = new InputManager();
    });

    it("should react to mouse move (top left)", () => {
        const mouseMoveEvent = { 
            clientX: 10, 
            clientY: 10,
            target: {
                getBoundingClientRect: () => {
                    return { top: 10, left: 10, right: 110, bottom: 110}
                }
            }
        };

        input_manager.on_mouse_move(mouseMoveEvent as unknown as React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>);

        expect(input_manager.mouse_pos.x).toBe(0);
        expect(input_manager.mouse_pos.y).toBe(0);
        expect(input_manager.mouse_ndc.x).toBe(-1);
        expect(input_manager.mouse_ndc.y).toBe(1);
    });

    it("should react to mouse move (top right)", () => {
        const mouseMoveEvent = { 
            clientX: 110, 
            clientY: 10,
            target: {
                getBoundingClientRect: () => {
                    return { top: 10, left: 10, right: 110, bottom: 110}
                }
            }
        };

        input_manager.on_mouse_move(mouseMoveEvent as unknown as React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>);

        expect(input_manager.mouse_pos.x).toBe(100);
        expect(input_manager.mouse_pos.y).toBe(0);
        expect(input_manager.mouse_ndc.x).toBe(1);
        expect(input_manager.mouse_ndc.y).toBe(1);
    });

    it("should react to mouse move (bottom right)", () => {
        const mouseMoveEvent = { 
            clientX: 110, 
            clientY: 110,
            target: {
                getBoundingClientRect: () => {
                    return { top: 10, left: 10, right: 110, bottom: 110}
                }
            }
        };

        input_manager.on_mouse_move(mouseMoveEvent as unknown as React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>);

        expect(input_manager.mouse_pos.x).toBe(100);
        expect(input_manager.mouse_pos.y).toBe(100);
        expect(input_manager.mouse_ndc.x).toBe(1);
        expect(input_manager.mouse_ndc.y).toBe(-1);
    });

    it("should react to mouse move (bottom left)", () => {
        const mouseMoveEvent = { 
            clientX: 10, 
            clientY: 110,
            target: {
                getBoundingClientRect: () => {
                    return { top: 10, left: 10, right: 110, bottom: 110}
                }
            }
        };

        input_manager.on_mouse_move(mouseMoveEvent as unknown as React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>);

        expect(input_manager.mouse_pos.x).toBe(0);
        expect(input_manager.mouse_pos.y).toBe(100);
        expect(input_manager.mouse_ndc.x).toBe(-1);
        expect(input_manager.mouse_ndc.y).toBe(-1);
    });
});
