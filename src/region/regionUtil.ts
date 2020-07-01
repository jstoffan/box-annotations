import * as React from 'react';
import { Annotation, AnnotationRegion, Position } from '../@types';

export type Shape = {
    height: number;
    width: number;
    x: number;
    y: number;
};

export const EMPTY_STYLE = { display: 'none' };

const ROTATION_ONCE_DEG = -90;
const ROTATION_TWICE_DEG = -180;
const ROTATION_THRICE_DEG = -270;

export function getRotatedLocation(shape: Shape, rotation: number) {
    const { height, width, x, y } = shape;

    switch (rotation) {
        case ROTATION_ONCE_DEG:
            return [y, height - x];
        case ROTATION_TWICE_DEG:
            return [width - x, height - y];
        case ROTATION_THRICE_DEG:
            return [width - y, x];
        default:
            break;
    }

    return [x, y];
}

export const rotateShape = (centerX = 0, centerY = 0, x = 0, y = 0, rotation = 0): Position => {
    const degrees = rotation >= 0 ? rotation : 360 + rotation; // Convert to positive degrees
    const radians = (Math.PI / 180) * degrees;
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);

    return {
        x: (cosine * (x - centerX)) - (sine * (y - centerY)) + centerX, // prettier-ignore
        y: (cosine * (y - centerY)) + (sine * (x - centerX)) + centerY // prettier-ignore
    };
};

export const centerShape = (shape: Shape): Position => {
    const { height, width } = shape;

    return {
        x: width / 2,
        y: height / 2,
    };
};

export const centerRegion = (shape: Shape, rotation = 0): Position => {
    const { x: shapeX, y: shapeY } = shape;
    const { x: centerX, y: centerY } = centerShape(shape);

    const [x, y] = getRotatedLocation(shape, rotation);

    return { x, y };
};

export function isRegion(annotation: Annotation): annotation is AnnotationRegion {
    return annotation?.target?.type === 'region';
}

export function styleShape(shape?: Shape): React.CSSProperties {
    if (!shape) {
        return EMPTY_STYLE;
    }

    const { height, width, x, y } = shape;

    return {
        display: 'block', // Override inline "display: none" from EMPTY_STYLE
        height: `${height}%`,
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
    };
}
