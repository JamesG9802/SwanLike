import EventHandler, { Listener } from 'Utility/EventHandler';
import { expect, it, describe } from 'vitest'

/**
 * Test class that holds data.
 */
type TestClass = {
    field_1: number,
}

describe("EventHandler.attach", () => {
    it("should work normally without arguments", () => {
        const test: TestClass = { field_1: 1};
        const on_test: EventHandler<TestClass, void> = new EventHandler(test);

        let output: number = 0;
        const callback: Listener<TestClass, void> = (sender) => { 
            output = sender.field_1;
        };

        expect(on_test.attach(callback)).toBe(true);
        on_test.notify();

        expect(output).toBe(1);
    });
    it("should work normally with arguments", () => {
        const test: TestClass = { field_1: 1};
        const on_test: EventHandler<TestClass, number> = new EventHandler(test);

        let output: number = 0;
        const callback: Listener<TestClass, number> = (sender, args) => { 
            output = sender.field_1;
            output += args;
        };

        expect(on_test.attach(callback)).toBe(true);
        on_test.notify(5);

        expect(output).toBe(1 + 5);
    });
    it("should deny duplicate callbacks", () => {
        const test: TestClass = { field_1: 1};
        const on_test: EventHandler<TestClass, void> = new EventHandler(test);

        const callback: Listener<TestClass, void> = () => { };
    
        expect(on_test.attach(callback)).toBe(true);
        expect(on_test.attach(callback)).toBe(false);
    })
});

describe("EventHandler.detach", () => {
    it("should work normally", () => {
        const test: TestClass = { field_1: 1};
        const on_test: EventHandler<TestClass, void> = new EventHandler(test);

        let output: number = 0;
        const callback: Listener<TestClass, void> = (sender) => { output = sender.field_1 };

        expect(on_test.attach(callback)).toBe(true);
        expect(on_test.detach(callback)).toBe(true);

        on_test.notify();
        expect(output).toBe(0);
    });
    it("should not remove unrelated callbacks", () => {
        const test: TestClass = { field_1: 1};
        const on_test: EventHandler<TestClass, void> = new EventHandler(test);

        let output: number = 0;
        const callback_1: Listener<TestClass, void> = () => { output += 1 };
        const callback_2: Listener<TestClass, void> = () => { output += 2 };

        expect(on_test.attach(callback_1)).toBe(true);
        expect(on_test.attach(callback_2)).toBe(true);
        expect(on_test.detach(callback_1)).toBe(true);

        on_test.notify();
        expect(output).toBe(2);
    })
});