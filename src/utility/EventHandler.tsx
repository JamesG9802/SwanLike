/**
 * A callback that is invoked when an event is triggered.
 * @param TSender the object that is being listened for events.
 * @param TArgs any argument passed to the callbacks.
 */
export type Listener<TSender, TArgs> = (sender: TSender, args: TArgs) => void;

/**
 * Class for managing event listeners and triggering them when necessary.
 * @param TSender the object that is being listened for events.
 * @param TArgs the type of the argument passed to the callbacks
 */
export default class EventHandler<TSender, TArgs> {
    /**
     * Reference to the source object that event listeners are logically attached to. 
     */
    private sender: TSender;

    /**
     * List of all the attached event listeners.
     */
    private listeners: Listener<TSender, TArgs>[] = [];

    constructor(sender: TSender) {
        this.sender = sender;
    }

    /**
     * Attach a listener to the event.
     * @param listener The callbacks to be invoked when the event is notified.
     * @returns True if the listener was successfully added.
     */
    attach(listener: Listener<TSender, TArgs>): boolean {
        if(!this.listeners.includes(listener)) {
            this.listeners.push(listener);
            return true;
        }
        return false;
    }

    /**
     * Detach a listener from the event.
     * @param listener The listener function to be removed.
     * @returns True if the listener was successfully removed.
     */
    detach(listener: Listener<TSender, TArgs>): boolean {
        const size = this.listeners.length;
        this.listeners = this.listeners.filter((l) => l !== listener);
        return size > this.listeners.length;    //  If the size decreased, removal successful.
    }

    /**
     * Notify all attached listeners with the provided arguments.
     * @param args The arguments to pass to each listener.
     */
    notify(args: TArgs): void {
        for (const listener of this.listeners) {
            listener(this.sender, args);
        }
    }
}