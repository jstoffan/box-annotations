import BoxAnnotations, { Annotator, PreviewOptions } from '../BoxAnnotations';
import { PERMISSIONS, Permissions } from '../@types';
import DocumentAnnotator from '../document/DocumentAnnotator';

describe('BoxAnnotations', () => {
    let loader: BoxAnnotations = new BoxAnnotations();

    beforeEach(() => {
        loader = new BoxAnnotations();
    });

    describe('canLoad()', () => {
        let permissions: Permissions;

        beforeEach(() => {
            permissions = {
                [PERMISSIONS.CAN_ANNOTATE]: false,
                [PERMISSIONS.CAN_VIEW_ANNOTATIONS_ALL]: false,
                [PERMISSIONS.CAN_VIEW_ANNOTATIONS_SELF]: false,
            };
        });

        it('should return false if permissions do not exist', () => {
            expect(loader.canLoad()).toBe(false);
        });

        it('should return true if user has at least can_annotate permissions', () => {
            permissions[PERMISSIONS.CAN_ANNOTATE] = true;
            expect(loader.canLoad(permissions)).toBe(true);
        });

        it('should return true if user has at least can_view_annotations_all permissions', () => {
            permissions[PERMISSIONS.CAN_VIEW_ANNOTATIONS_ALL] = true;
            expect(loader.canLoad(permissions)).toBe(true);
        });

        it('should return true if user has at least can_view_annotations_self permissions', () => {
            permissions[PERMISSIONS.CAN_VIEW_ANNOTATIONS_SELF] = true;
            expect(loader.canLoad(permissions)).toBe(true);
        });
    });

    describe('getAnnotators()', () => {
        it("should return the loader's annotators", () => {
            expect(loader.getAnnotators()).toStrictEqual(loader.annotators);
        });

        it("should return an empty array if the loader doesn't have annotators", () => {
            loader.annotators = [];
            expect(loader.getAnnotators()).toStrictEqual([]);
        });
    });

    describe('getAnnotatorsForViewer()', () => {
        it('should return undefined if the annotator does not exist', () => {
            const annotator = loader.getAnnotatorsForViewer('not_supported_type');
            expect(annotator).toBeUndefined();
        });

        it('should return the correct annotator for the viewer name', () => {
            const name = 'Document';
            const annotator = loader.getAnnotatorsForViewer(name);
            expect(annotator && annotator.NAME).toEqual(name); // First entry is Document annotator
        });
    });

    describe('determineAnnotator()', () => {
        const getAnnotator = (): Annotator => ({
            CONSTRUCTOR: DocumentAnnotator,
            NAME: 'Document',
            VIEWERS: ['Document'],
            TYPES: ['region'],
        });
        const getOptions = (): PreviewOptions => ({
            file: {
                permissions: {},
            },
            viewer: {
                NAME: 'Document',
            },
        });

        beforeEach(() => {
            loader.canLoad = jest.fn().mockReturnValue(true);
        });

        it('should use the specified types from options', () => {
            loader.viewerOptions = {
                Document: { enabledTypes: ['region'] },
            };
            expect(loader.determineAnnotator(getOptions())).toMatchObject({ TYPES: ['region'] });
        });

        it('should filter and only keep allowed types of annotations', () => {
            const viewerConfig = { enabledTypes: ['region', 'timestamp'] };
            expect(loader.determineAnnotator(getOptions(), viewerConfig)).toMatchObject({ TYPES: ['region'] });

            loader.viewerOptions = {
                Document: {
                    enabledTypes: ['region', 'timestamp'],
                },
            };
            expect(loader.determineAnnotator(getOptions())).toMatchObject({ TYPES: ['region'] });
        });

        it('should respect default annotators if none provided', () => {
            expect(loader.determineAnnotator(getOptions())).toMatchObject({ TYPES: ['region'] });
        });

        it('should not return an annotator if the user has incorrect permissions/scopes', () => {
            loader.canLoad = jest.fn().mockReturnValue(false);
            loader.getAnnotatorsForViewer = jest.fn().mockReturnValue(getAnnotator());
            expect(loader.determineAnnotator(getOptions())).toBeNull();
        });

        it('should choose the first annotator that matches the viewer', () => {
            loader.getAnnotatorsForViewer = jest.fn().mockReturnValue(getAnnotator());

            const result = loader.determineAnnotator(getOptions());
            expect(result && result.NAME).toEqual('Document');
            expect(loader.getAnnotatorsForViewer).toBeCalled();
        });

        it('should not return an annotator if no matching annotator is found', () => {
            loader.getAnnotatorsForViewer = jest.fn().mockReturnValue(null);
            expect(loader.determineAnnotator(getOptions())).toBeNull();
        });

        it('should return null if the config for the viewer disables annotations', () => {
            const config = {
                enabled: false,
            };
            loader.getAnnotatorsForViewer = jest.fn().mockReturnValue(getAnnotator());
            expect(loader.determineAnnotator(getOptions(), config)).toBeNull();
        });
    });
});
