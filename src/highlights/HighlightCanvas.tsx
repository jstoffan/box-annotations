import * as React from 'react';
import * as Model from '../api/TypesModel';
import { HIGHLIGHT_FILL } from '../constants';

type Props = {
    annotations: Model.Highlight[];
};

export default class HighlightCanvas extends React.Component<Props> {
    static defaultProps = {
        annotations: [],
    };

    canvasRef: React.RefObject<HTMLCanvasElement> = React.createRef();

    componentDidMount(): void {
        this.scaleCanvas();
        this.renderRects();
    }

    componentDidUpdate(): void {
        this.clearRects();
        this.renderRects();
    }

    getContext(): CanvasRenderingContext2D | null {
        const { current: canvasRef } = this.canvasRef;
        return canvasRef ? canvasRef.getContext('2d') : null;
    }

    scaleCanvas(): void {
        const { current: canvasRef } = this.canvasRef;

        if (!canvasRef) {
            return;
        }

        canvasRef.style.width = '100%';
        canvasRef.style.height = '100%';
        canvasRef.width = canvasRef.offsetWidth;
        canvasRef.height = canvasRef.offsetHeight;
    }

    clearRects(): void {
        const { current: canvasRef } = this.canvasRef;
        const context = canvasRef && canvasRef.getContext('2d');

        if (!canvasRef || !context) {
            return;
        }

        context.clearRect(0, 0, canvasRef.width, canvasRef.height);
    }

    renderRects(): void {
        const { annotations } = this.props;
        const { current: canvasRef } = this.canvasRef;
        const context = canvasRef && canvasRef.getContext('2d');

        if (!context) {
            return;
        }

        annotations.forEach(annotation => {
            const { location } = annotation;
            const { quadPoints } = location;

            quadPoints.forEach(quadPoint => {
                const [x1, y1, x2, y2, x3, y3, x4, y4] = quadPoint;

                context.fillStyle = HIGHLIGHT_FILL.normal;
                context.beginPath();
                context.moveTo(x1, y1 - 15);
                context.lineTo(x2, y2 - 15);
                context.lineTo(x3, y3 - 15);
                context.lineTo(x4, y4 - 15);
                context.closePath();

                // We we erase the highlight rectangle before drawing to avoid covering the underlying text
                context.save();
                context.globalCompositeOperation = 'destination-out';
                context.fillStyle = HIGHLIGHT_FILL.erase;
                context.fill();
                context.restore();
                context.fill();
            });
        });
    }

    render(): JSX.Element {
        return <canvas ref={this.canvasRef} className="ba-HighlightsCanvas" />;
    }
}
