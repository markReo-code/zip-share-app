export const formatSize = (bytes: number, digits = 2) => {
    const base = 1024;
    if (bytes < base) return `${bytes}B`;

    const kb = bytes / base;
    if (kb < base) return `${kb.toFixed(digits)}KB`;

    const mb = kb / base;
    if (mb < base) return `${mb.toFixed(digits)}MB`;

    const gb = mb / base;
    return `${gb.toFixed(digits)}GB`; 
};
