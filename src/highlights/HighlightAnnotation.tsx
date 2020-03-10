import * as React from 'react';
import Target from '../components/Target';

type Props = {
    anchorRef: React.Ref<HTMLAnchorElement>;
    annotation: Annotation;
    onClick: (annotation: Annotation) => void;
};

export default function HighlightAnnotation({ annotation, ...rest }: Props): JSX.Element {
    const { location } = annotation;
    const { quadPoints } = location;

    return (
        <Target annotation={annotation} className="ba-Highlight" {...rest}>
            {quadPoints.map(quadPoint => {
                const x1 = quadPoint[0];
                const x2 = quadPoint[2];
                const y1 = quadPoint[1];
                const y2 = quadPoint[5];

                return (
                    <rect
                        key={`${x1}-${x2}`}
                        className="ba-Highlight-rect"
                        fill="none"
                        height={y1 - y2}
                        width={x2 - x1}
                        x={x1}
                        y={y2 - 15}
                    />
                );
            })}
        </Target>
    );
}
