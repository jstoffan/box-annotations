import * as React from 'react';
import Button from 'box-ui-elements/es/components/button';
import PrimaryButton from 'box-ui-elements/es/components/primary-button';
import PopupBase from './PopupBase';

type Props = {
    onCreate: (text: string) => void;
};

export default React.forwardRef(({ onCreate }: Props, ref: React.Ref<HTMLDivElement>) => {
    const [text, setText] = React.useState('');
    const handleClick = (event: React.MouseEvent): void => {
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
    };
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
        setText(event.target.value);
    };
    const handleCreate = (event: React.MouseEvent): void => {
        event.preventDefault();
        event.stopPropagation();

        onCreate(text);
    };

    return (
        <PopupBase ref={ref}>
            <div className="ba-Popup-main">
                <textarea className="ba-Popup-text" onChange={handleChange} onClick={handleClick} />
            </div>
            <div className="ba-Popup-footer">
                <Button>Cancel</Button>
                <PrimaryButton onClick={handleCreate}>Post</PrimaryButton>
            </div>
        </PopupBase>
    );
});
