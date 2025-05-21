import { useState } from "react";
import { nanoid } from "nanoid";

export const useIdGenerator = (prefix = "") => {
    const [id, setId] = useState<string>(`${prefix}${nanoid()}`);

    const regenerate = () => {
        setId(`${prefix}${nanoid()}`);
    };

    return { id, regenerate };
};