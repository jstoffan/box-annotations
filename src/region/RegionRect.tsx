import * as React from 'react';
import classNames from 'classnames';
import './RegionRect.scss';

type Props = {
    className?: string;
    isActive?: boolean;
    height?: number;
    width?: number;
    x?: number;
    y?: number;
};

export const FILTER_STYLE = { filter: 'url("#ba-RegionShadow")' };

export function RegionRect(props: Props, ref: React.Ref<SVGRectElement>): JSX.Element {
    const { className, height = 0, isActive, width = 0, x = 0, y = 0 } = props;
    const style = isActive ? FILTER_STYLE : undefined;

    return (
        <rect
            ref={ref}
            className={classNames('ba-RegionRect', className)}
            height={height}
            rx={6}
            style={style}
            width={width}
            x={x}
            y={y}
        />
    );
}

export default React.forwardRef(RegionRect);
