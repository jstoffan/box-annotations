// @flow
import React from 'react';
import { render } from 'react-dom';
import Annotator from '../Annotator';
import HighlightManager from '../highlights/HighlightManager';
import Popper from '../components/Popper';
import PopupReply from '../components/PopupReply';
import * as util from '../util';

const SELECTION_TIMEOUT = 500;
const SELECTOR_PREVIEW_DOC = '.bp-doc';

export default class DocAnnotator extends Annotator {
    managers = new Map();

    /** @inheritdoc */
    constructor(options: Object) {
        super(options);

        this.handleSelectionChange = this.handleSelectionChange.bind(this);
        this.resetAnnotationUI = this.resetAnnotationUI.bind(this);
    }

    init() {
        super.init();
    }

    render() {
        // TODO: Inject page/document elements from Preview SDK rather than DOM?
        const pages = [...this.annotatedElement.querySelectorAll('.page')]; // TODO: Pass in from viewer?
        const scale = Number(document.querySelector('[data-scale]').dataset.scale); // TODO: Store as a variable

        pages
            .filter(pageEl => pageEl.dataset.loaded)
            .forEach(pageEl => {
                // Lazily create new managers as pages are rendered
                const { pageNumber } = pageEl.dataset;
                const annotations = this.getAnnotations(pageNumber);

                // Destroy any managers that were attached to page elements that no longer exist
                if (this.managers.has(pageNumber)) {
                    if (this.managers.get(pageNumber).some(manager => !manager.exists(pageEl))) {
                        this.managers.get(pageNumber).forEach(manager => manager.destroy());
                        this.managers.delete(pageNumber);
                    }
                }

                // Lazily instantiate managers as pages are added or re-rendered
                if (!this.managers.has(pageNumber)) {
                    this.managers.set(pageNumber, [
                        // Add additional managers here for other annotation types
                        new HighlightManager({ page: pageNumber, pageEl }),
                    ]);
                }

                this.managers.get(pageNumber).forEach(manager =>
                    manager.render({
                        annotations,
                        scale,
                    }),
                );
            });
    }

    getAnnotations(pageNumber) {
        // TODO: Normalize this data in the data store, instead
        const annotationsArray = Object.values(this.annotationMap);
        const annotationsByPage = annotationsArray.reduce((result, annotation) => {
            const { location } = annotation;
            result[location.page] = result[location.page] || [];
            result[location.page].push(annotation);
            return result;
        }, {});
        return annotationsByPage[pageNumber] || [];
    }

    scaleAnnotations(data: Object) {
        this.setScale(data.scale);
        this.render();
    }

    /**
     * [destructor]
     *
     * @return {void}
     */
    destroy() {
        super.destroy();

        this.managers.forEach(page => page.forEach(manager => manager.destroy()));
        this.managers.clear();
    }

    /** @inheritdoc */
    getAnnotatedEl(containerEl: HTMLElement) {
        return containerEl.querySelector(SELECTOR_PREVIEW_DOC);
    }

    /** @inheritdoc */
    resetAnnotationUI() {
        window.getSelection().removeAllRanges();
    }

    /**
     * Binds DOM event listeners.
     *
     * @return {void}
     */
    bindDOMListeners() {
        super.bindDOMListeners();

        this.container.addEventListener('resize', this.resetAnnotationUI);

        // Prevent highlight creation if annotating (or plain AND comment highlights) is disabled
        if (this.permissions.can_annotate) {
            document.addEventListener('selectionchange', this.handleSelectionChange);
        }
    }

    /**
     * Unbinds DOM event listeners.
     *
     * @return {void}
     */
    unbindDOMListeners() {
        super.unbindDOMListeners();

        if (this.container) {
            this.container.removeEventListener('resize', this.resetAnnotationUI);
        }

        document.removeEventListener('selectionchange', this.handleSelectionChange);
    }

    /**
     * Handles changes in text selection. Used for mobile highlight creation.
     *
     * @param {Event} event The DOM event coming from interacting with the element.
     * @return {void}
     */
    handleSelectionChange(event: Event) {
        const selection = window.getSelection();
        const selectionNode = selection.anchorNode;

        if (this.popper && selection.type !== 'Range') {
            this.popper.destroy();
        }

        // If the selection is not contained within the annotated element, don't do anything to avoid conflicting
        // with default selection behavior outside of annotations.
        // In IE 11, we need to check the parent of the selection, as the anchor node is a TextElement that cannot
        // be found by it's parent divs.
        if (
            !this.annotatedElement.contains(selectionNode) ||
            !this.annotatedElement.contains(selectionNode.parentNode)
        ) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        if (this.selectionEndTimeout) {
            clearTimeout(this.selectionEndTimeout);
            this.selectionEndTimeout = null;
        }

        this.selectionEndTimeout = setTimeout(() => {
            if (selection.type !== 'Range') {
                return;
            }

            const { pageEl } = util.getPageInfo(selection.anchorNode);
            const popupEl = util.getPopoverLayer(pageEl);
            const popupRef = React.createRef();
            const selectionRect = selection.getRangeAt(0).getBoundingClientRect();
            const target = { getBoundingClientRect: () => selectionRect };

            // TODO: Get the interstitial tooltip working again; on click, open the reply popup

            render(<PopupReply ref={popupRef} />, popupEl, () => {
                this.popper = new Popper(target, popupRef.current, {
                    modifiers: [
                        {
                            name: 'eventListeners',
                            options: {
                                scroll: false,
                            },
                        },
                    ],
                });
            });
        }, SELECTION_TIMEOUT);
        this.isCreatingHighlight = true;
    }
}
