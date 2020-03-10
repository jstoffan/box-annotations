import * as React from 'react';
import classNames from 'classnames';
import './PopupBase.scss';

type Props = {
    children: React.ReactNode;
    className?: string;
};

export default React.forwardRef(({ children, className }: Props, ref: React.Ref<HTMLDivElement>) => {
    const handleClick = (event: React.MouseEvent): void => {
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
    };

    return (
        <div ref={ref} className={classNames('ba-Popup', className)}>
            <div onClick={handleClick} role="presentation">
                <div className="ba-Popup-arrow" />
                <div className="ba-Popup-content">{children}</div>
            </div>
        </div>
    );
});
