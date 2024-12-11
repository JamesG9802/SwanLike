import { useState } from "react";
import { v6 } from "uuid"

/**
 * Editor for SwanLike.
 */
export function Editor() {
    const [uuid, set_uuid] = useState<string>("");

    return (
        <div>
            <button onClick={() => {
                const uuid = v6();
                set_uuid(uuid);
                navigator.clipboard.writeText(uuid);
            }}>
                Generate UUID
            </button>
            <p>UUID: {uuid}</p>
        </div>
    );
}