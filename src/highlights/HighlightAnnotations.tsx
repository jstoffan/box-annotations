import * as React from 'react';
import { Instance } from '@popperjs/core';
import HighlightAnnotation from './HighlightAnnotation';
import HighlightCanvas from './HighlightCanvas';
import Popper from '../components/Popper';
import PopupMessage from '../components/PopupMessage';

type Props = {
    annotations: Annotation[];
};

type State = {
    selectedId: string | null;
};

export default class HighlightAnnotations extends React.Component<Props, State> {
    anchorRef: React.RefObject<HTMLAnchorElement> = React.createRef();

    popperRef: React.RefObject<HTMLDivElement> = React.createRef();

    popper?: Instance;

    state = {
        selectedId: null,
    };

    static defaultProps = {
        annotations: [],
    };

    componentDidMount(): void {
        document.addEventListener('click', this.handleClickOut);
    }

    componentDidUpdate(): void {
        const { current: anchorRef } = this.anchorRef;
        const { current: popperRef } = this.popperRef;

        if (anchorRef && popperRef) {
            this.popper = Popper(anchorRef, popperRef);
        } else if (this.popper) {
            this.popper.destroy();
        }
    }

    componentWillUnmount(): void {
        document.removeEventListener('click', this.handleClickOut);
    }

    handleClick = (selectedId: Annotation): void => {
        this.setState({ selectedId });
    };

    handleClickOut = (): void => {
        this.setState({ selectedId: null });
    };

    render(): JSX.Element {
        const { annotations } = this.props;
        const { selectedId } = this.state;

        return (
            <>
                <HighlightCanvas annotations={annotations} />

                <svg className="ba-Highlights">
                    {annotations.map(annotation => (
                        <HighlightAnnotation
                            key={annotation.id}
                            anchorRef={annotation.id === selectedId ? this.anchorRef : null}
                            annotation={annotation}
                            onClick={this.handleClick}
                        />
                    ))}
                </svg>

                {selectedId && <PopupMessage ref={this.popperRef} annotation={selectedId} />}
            </>
        );
    }
}
