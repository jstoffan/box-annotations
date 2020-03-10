import * as React from 'react';
import * as ReactDOM from 'react-dom';
import merge from 'lodash/merge';
import BaseManager, { Options, Props } from '../common/BaseManager';
import HighlightAnnotations from './HighlightAnnotations';
import './HighlightAnnotator.scss';

export default class HighlightManager implements BaseManager {
    page: string;

    pageEl: HTMLElement;

    root: HTMLElement | null;

    constructor({ page, pageEl }: Options) {
        // TODO: Pass in the same root element to each manager? Pass in the reference element/selector?
        const canvasLayerEl = pageEl.querySelector('.canvasWrapper') as HTMLElement;
        const textLayerEl = pageEl.querySelector('.textLayer') as HTMLElement;
        const referenceEl = textLayerEl || canvasLayerEl; // Use the optional text layer if it's available

        this.page = page;
        this.pageEl = pageEl;
        this.root = this.insert(referenceEl);
    }

    destroy(): void {
        if (!this.root) {
            return;
        }

        ReactDOM.unmountComponentAtNode(this.root);

        this.root.remove();
        this.root = null;
    }

    exists(pageEl: HTMLElement): boolean {
        return pageEl.contains(this.root);
    }

    format({ annotations, scale }: Props): Annotation[] {
        const pageHeight = this.pageEl.offsetHeight;

        return annotations
            .filter(annotation => annotation.type.indexOf('highlight') >= 0)
            .map(annotation => {
                return merge({}, annotation, {
                    location: {
                        quadPoints: annotation.location.quadPoints.map(
                            quadPoint =>
                                quadPoint
                                    .map(val => Math.round(val * (4 / 3) * scale)) // Coords are PDF-space relative (for some reason)
                                    .map((val, index) => (index % 2 ? pageHeight - val : val)), // Coords on y axis are page-relative (for some reason)
                        ),
                    },
                });
            })
            .sort((a1, a2) => (a1.location.quadPoints[0][1] < a2.location.quadPoints[0][1] ? -1 : 1)); // Sort by the top-most Y-coordinate (top to bottom)
    }

    insert(referenceEl: HTMLElement): HTMLElement {
        // Find the nearest applicable reference and document elements
        const documentEl = this.pageEl.ownerDocument || document;
        const parentEl = referenceEl.parentNode || documentEl;

        // Construct a layer element where we can inject a root React component
        const rootLayerEl = documentEl.createElement('div');
        rootLayerEl.classList.add('ba-Layer');
        rootLayerEl.classList.add('ba-Layer--highlights');

        // Insert the new layer element immediately after the reference element
        return parentEl.insertBefore(rootLayerEl, referenceEl.nextSibling);
    }

    render(props: Props): void {
        if (!this.root) {
            return;
        }

        ReactDOM.render(<HighlightAnnotations annotations={this.format(props)} />, this.root);
    }
}
