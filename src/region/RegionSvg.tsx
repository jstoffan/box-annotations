import * as React from 'react';
import RegionShadow from './RegionShadow';

export function RegionSvg(props: React.SVGProps<SVGSVGElement>, ref: React.Ref<SVGSVGElement>): JSX.Element {
    const { children, ...rest } = props;

    return (
        <svg ref={ref} {...rest}>
            <RegionShadow />
            {children}
        </svg>
    );
}

export default React.forwardRef(RegionSvg);
