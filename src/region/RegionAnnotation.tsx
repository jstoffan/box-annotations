import classNames from 'classnames';
import * as React from 'react';
import AnnotationTarget, { AnnotationTargetRef } from '../components/AnnotationTarget';
import { getRegionStyle } from './RegionRect';
import { Rect } from '../@types';
import './RegionAnnotation.scss';

type Props = {
    annotationId: string;
    className?: string;
    isActive?: boolean;
    onSelect?: (annotationId: string) => void;
    shape: Rect;
};

export type RegionAnnotationRef = AnnotationTargetRef;

export const RegionAnnotation = (props: Props, ref: React.Ref<RegionAnnotationRef>): JSX.Element => {
    const { isActive, shape, ...rest } = props;

    return (
        <AnnotationTarget
            ref={ref}
            className={classNames('ba-RegionAnnotation', { 'is-active': isActive })}
            isActive={isActive}
            style={getRegionStyle(shape)}
            {...rest}
        />
    );
};

export default React.forwardRef(RegionAnnotation);
