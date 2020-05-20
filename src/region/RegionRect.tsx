import { CSSProperties } from 'react';
import * as React from 'react';
import classNames from 'classnames';
import './RegionRect.scss';

type Shape = {
    height: number;
    width: number;
    x: number;
    y: number;
};

type Props = {
    className?: string;
    isActive?: boolean;
    shape?: Shape;
};

export type RegionRectRef = HTMLDivElement;

export const BORDER_SIZE = 4;
export const BORDER_TOTAL = BORDER_SIZE * 2;

export function getRegionStyle(shape?: Shape): CSSProperties {
    if (!shape) {
        return {};
    }

    const { height, width, x, y } = shape;
    return {
        height: `${height}px`,
        transform: `translate(${x}px, ${y}px)`,
        width: `${width}px`,
    };
}

export function RegionRect(props: Props, ref: React.Ref<RegionRectRef>): JSX.Element {
    const { className, isActive, shape } = props;

    return (
        <div
            ref={ref}
            className={classNames('ba-RegionAnnotation', className, { 'is-active': isActive })}
            style={getRegionStyle(shape)}
        />
    );
}

export default React.forwardRef(RegionRect);
