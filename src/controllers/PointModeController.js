// @flow
import AnnotationModeController from './AnnotationModeController';
import DocPointThread from '../doc/DocPointThread';
import ImagePointThread from '../image/ImagePointThread';
import AnnotationAPI from '../api/AnnotationAPI';
import { TYPES, THREAD_EVENT, CLASS_ACTIVE, CLASS_ANNOTATION_POINT_MODE, ANNOTATOR_TYPE } from '../constants';
import { isInAnnotationOrMarker } from '../util';

class PointModeController extends AnnotationModeController {
    /** @property {HTMLElement} - The button to exit point annotation mode */
    exitButtonEl: HTMLElement;

    /** @inheritdoc */
    setupHandlers(): void {
        // $FlowFixMe
        this.pointClickHandler = this.pointClickHandler.bind(this);
        // $FlowFixMe
        this.toggleMode = this.toggleMode.bind(this);

        // Get handlers
        this.pushElementHandler(this.annotatedElement, ['click', 'touchstart'], this.pointClickHandler, true);
        this.pushElementHandler(this.exitButtonEl, 'click', this.toggleMode);
    }

    /** @inheritdoc */
    resetMode(): void {
        if (this.buttonEl) {
            this.buttonEl.classList.remove(CLASS_ACTIVE);
        }
        this.annotatedElement.classList.remove(CLASS_ANNOTATION_POINT_MODE);

        const thread = this.getThreadByID(this.pendingThreadID);
        if (thread) {
            this.destroyThread(thread);
        }

        this.pendingThreadID = null;
    }

    /** @inheritdoc */
    enter(): void {
        super.enter();

        this.annotatedElement.classList.add(CLASS_ANNOTATION_POINT_MODE);

        if (this.buttonEl) {
            this.buttonEl.classList.add(CLASS_ACTIVE);
        }
    }

    /**
     * Event handler for adding a point annotation. Creates a point annotation
     * thread at the clicked location.
     *
     * @param {Event} event - DOM event
     * @return {void}
     */
    pointClickHandler(event: Event): void {
        // Determine if a point annotation dialog is already open and close the
        // current open dialog
        if (!isInAnnotationOrMarker(event, this.container)) {
            event.stopPropagation();
            event.preventDefault();
        } else {
            return;
        }

        const pendingThread = this.getThreadByID(this.pendingThreadID);
        if (this.pendingThreadID && pendingThread) {
            pendingThread.destroy();
        }

        this.hadPendingThreads = this.destroyPendingThreads();
        this.applyActionToThreads(thread => {
            thread.hide();
        });

        // Get annotation location from click event, ignore click if location is invalid
        const location = this.getLocation(event, TYPES.point);
        if (!location) {
            return;
        }

        // Create new thread with no annotations, show indicator, and show dialog
        const thread = this.registerThread({
            id: AnnotationAPI.generateID(),
            type: this.mode,
            location,
            canAnnotate: true,
            canDelete: true,
            createdBy: this.api.user,
            createdAt: new Date().toISOString(),
            isPending: true,
            comments: [],
        });

        if (!thread) {
            return;
        }

        this.pendingThreadID = thread.threadID;
        thread.show();
        this.emit(THREAD_EVENT.pending, thread.getThreadEventData());
    }

    /** @inheritdoc */
    instantiateThread(params: Object): AnnotationThread {
        switch (this.annotatorType) {
            case ANNOTATOR_TYPE.document:
                return new DocPointThread(params);
            case ANNOTATOR_TYPE.image:
                return new ImagePointThread(params);
            default:
                return null;
        }
    }
}

export default PointModeController;
