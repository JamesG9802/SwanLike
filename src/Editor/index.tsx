import { useState } from "react";
import { generate_UUID } from "Utility/Identifiable";

/**
 * Editor for SwanLike.
 */
export function Editor() {
    const [uuid, set_uuid] = useState<string>("");
    
    return (
        <div>
            <button onClick={() => {
                const uuid = generate_UUID();
                set_uuid(uuid);
                navigator.clipboard.writeText(uuid);
            }}>
                Generate UUID
            </button>
            <p>UUID: {uuid}</p>
        </div>
    );
}