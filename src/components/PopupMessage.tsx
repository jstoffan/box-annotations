import * as React from 'react';
import { Annotation } from '../api/TypesModel';
import PopupBase from './PopupBase';

type Props = {
    annotation?: Annotation | null;
};

export default React.forwardRef(({ annotation }: Props, ref: React.Ref<HTMLDivElement>) => {
    if (!annotation) {
        return null;
    }

    const { comments, createdBy } = annotation;
    const message = comments && comments[0] && comments[0].message;

    return (
        <PopupBase ref={ref}>
            <div className="ba-PopupMessage">
                {createdBy && <div className="ba-PopupMessage-author">{createdBy.name}</div>}
                {message && <div className="ba-PopupMessage-message">{message}</div>}
            </div>
        </PopupBase>
    );
});
