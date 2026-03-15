export const ROW_HEIGHT = 48
export const OVERSCAN_COUNT = 5

export function getVisibleRange(scrollTop, containerHeight, totalRows) {
    const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN_COUNT)
    const visibleCount = Math.ceil(containerHeight / ROW_HEIGHT)
    const endIndex = Math.min(totalRows, startIndex + visibleCount + OVERSCAN_COUNT * 2)
    return { startIndex, endIndex }
}
