import * as React from 'react';
import noop from 'lodash/noop';
import * as Model from '../api/TypesModel';

type Props<T extends Model.AnnotationBase> = {
    anchorRef: React.Ref<HTMLAnchorElement>; // React.forwardRef currently does not propagate generic types
    annotation: T;
    children: React.ReactNode;
    className?: string;
    onClick?: (annotation: T) => void;
};

export default function Target<T extends Model.AnnotationBase>(props: Props<T>): JSX.Element {
    const { annotation, children, className, anchorRef, onClick = noop } = props;
    const handleEvent = (event: React.SyntheticEvent): void => {
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation(); // Prevents document event handlers from executing
    };
    const handleClick = (event: React.MouseEvent): void => {
        handleEvent(event);
        onClick(annotation);
    };
    const handleFocus = (event: React.SyntheticEvent): void => {
        handleEvent(event);
        onClick(annotation);
    };
    const handleKeyPress = (event: React.KeyboardEvent): void => {
        handleEvent(event);

        if (event.which === 13) {
            onClick(annotation);
        }
    };

    return (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a
            ref={anchorRef}
            className={className}
            onClick={handleClick}
            onFocus={handleFocus}
            onKeyPress={handleKeyPress}
            role="button"
            tabIndex={0}
        >
            {children}
        </a>
    );
}
