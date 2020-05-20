import * as React from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import scrollIntoView, { Options } from 'scroll-into-view-if-needed';

type Props = {
    annotationId: string;
    className?: string;
    isActive?: boolean;
    onSelect?: (annotationId: string) => void;
    style: React.CSSProperties;
};

const scrollOptions: Options = {
    behavior: 'smooth',
    block: 'center',
    inline: 'center',
    scrollMode: 'if-needed',
};

export type AnnotationTargetRef = HTMLButtonElement;

export const AnnotationTarget = (props: Props, ref: React.Ref<AnnotationTargetRef>): JSX.Element => {
    const { annotationId, className, isActive, onSelect = noop, ...rest } = props;
    const innerRef = React.useRef<HTMLButtonElement>(null);

    React.useImperativeHandle(ref, () => innerRef.current as HTMLButtonElement, [innerRef]);
    React.useEffect(() => {
        if (isActive && innerRef.current) {
            scrollIntoView(innerRef.current, scrollOptions);
        }
    }, [isActive]);

    const cancelEvent = (event: React.SyntheticEvent): void => {
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation(); // Prevents document event handlers from executing
    };
    const handleBlur = (event: React.SyntheticEvent): void => {
        cancelEvent(event);
    };
    const handleClick = (event: React.MouseEvent): void => {
        cancelEvent(event);
        onSelect(annotationId);
    };
    const handleFocus = (event: React.SyntheticEvent): void => {
        cancelEvent(event);
        onSelect(annotationId);
    };

    return (
        <button
            ref={innerRef}
            className={classNames('ba-AnnotationTarget', className)}
            data-testid={`ba-AnnotationTarget-${annotationId}`}
            onBlur={handleBlur}
            onClick={handleClick}
            onFocus={handleFocus}
            type="button"
            {...rest}
        />
    );
};

export default React.forwardRef(AnnotationTarget);
