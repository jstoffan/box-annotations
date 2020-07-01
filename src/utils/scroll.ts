import { Position } from '../@types';

export type ScrollOptions = {
    offsets?: Position;
    rotation?: number;
    threshold?: number;
};

const DEFAULT_OFFSETS = { x: 0, y: 0 };
const DEFAULT_ROTATION = 0; // degrees
const DEFAULT_THRESHOLD = 1000; // pixels

export const rotate = (centerX = 0, centerY = 0, x = 0, y = 0, rotation = 0): Position => {
    const degrees = rotation >= 0 ? rotation : 360 + rotation; // Convert to positive degrees
    const radians = (Math.PI / 180) * degrees;
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);

    return {
        x: (cosine * (x - centerX)) - (sine * (y - centerY)) + centerX, // prettier-ignore
        y: (cosine * (y - centerY)) + (sine * (x - centerX)) + centerY // prettier-ignore
    };
};

export function scrollToLocation(parentEl: HTMLElement, referenceEl: HTMLElement, options: ScrollOptions = {}): void {
    const { left: parentLeft, top: parentTop } = parentEl.getBoundingClientRect();
    const {
        height: referenceHeight,
        left: referenceLeft,
        top: referenceTop,
        width: referenceWidth,
    } = referenceEl.getBoundingClientRect();
    const { offsets = DEFAULT_OFFSETS, rotation = DEFAULT_ROTATION, threshold = DEFAULT_THRESHOLD } = options;
    const { x: offsetX, y: offsetY } = offsets;

    const canSmoothScroll = 'scrollBehavior' in parentEl.style;
    const offsetCenterX = Math.round(referenceWidth * (offsetX / 100));
    const offsetCenterY = Math.round(referenceHeight * (offsetY / 100));

    // const { x, y } = rotate(
    //     referenceWidth / 2,
    //     referenceHeight / 2,
    //     offsetCenterX,
    //     offsetCenterY,
    //     rotation,
    // );

    const offsetLeft = Math.max(0, referenceLeft - parentLeft);
    const offsetTop = Math.max(0, referenceTop - parentTop);
    const scrollLeft = Math.max(0, Math.min(offsetLeft + offsetCenterX, referenceWidth));
    const scrollTop = Math.max(0, Math.min(offsetTop + offsetCenterY, referenceHeight));

    if (canSmoothScroll && Math.abs(parentEl.scrollTop - scrollTop) < threshold) {
        parentEl.scrollTo({
            behavior: 'smooth',
            left: scrollLeft,
            top: scrollTop,
        });
    } else {
        parentEl.scrollLeft = scrollLeft;
        parentEl.scrollTop = scrollTop;
    }
}
