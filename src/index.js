import { createContext, useContext, useRef, useState, useEffect } from 'react';
import { Lrud } from 'lrud';
import { v4 as uuidv4 } from 'uuid';

let _navigation;

const _log = (...args) => console.debug('react-lrud:', ...args);

const _handleKeyEvent = function (event) {
    if (
        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter'].includes(
            event.code
        )
    ) {
        event.preventDefault();
        _navigation.handleKeyEvent(event);
    }
};

const initNavigation = function (options) {
    _navigation = new Lrud();

    document.addEventListener('keydown', _handleKeyEvent);

    if (options?.debug) {
        _navigation.on('focus', (event) => _log('focus:', event));
        _navigation.on('blur', (event) => _log('blur:', event));
        _navigation.on('active', (event) => _log('active:', event));
        _navigation.on('inactive', (event) => _log('inactive:', event));
        _navigation.on('select', (event) => _log('select:', event));
        _navigation.on('cancelled', (event) => _log('cancelled:', event));
    }
};

const destroyNavigation = function () {
    document.removeEventListener('keydown', _handleKeyEvent);
    _navigation = undefined;
};

const NavigationContext = createContext(null);

const useNavigation = function (props) {
    const [id] = useState(props.id ?? uuidv4());
    const [focused, setFocused] = useState(false);
    const [active, setActive] = useState(false);
    const [disabled, setDisabled] = useState(false);

    const ref = useRef(null);
    const parent = useContext(NavigationContext);

    if (!disabled && !_navigation.getNode(id)) {
        _navigation.registerNode(id, {
            parent: props.parent ?? parent,
            isFocusable: props.isFocusable ?? true,
            orientation: props.orientation,
            isWrapping: props.isWrapping,
            index: props.index,
            isIndexAlign: props.isIndexAlign,
            indexRange: props.indexRange,
            isStopPropagate: props.isStopPropagate,
            onFocus: (event) => {
                props.onFocus?.(event, ref.current);
                setFocused(true);
            },
            onBlur: (event) => {
                props.onBlur?.(event, ref.current);
                setFocused(false);
            },
            onSelect: (event) => {
                props.onSelect?.(event, ref.current);
            },
            onActive: (event) => {
                props.onActive?.(event, ref.current);
                setActive(true);
            },
            onInactive: (event) => {
                props.onInactive?.(event, ref.current);
                setActive(false);
            },
            onLeave: (event) => {
                props.onLeave?.(event, ref.current);
            },
            onEnter: (event) => {
                props.onEnter?.(event, ref.current);
            },
            shouldCancelLeave: props.shouldCancelLeave,
            shouldCancelEnter: props.shouldCancelEnter,
            onLeaveCancelled: props.onLeaveCancelled,
            onEnterCancelled: props.onEnterCancelled,
        });
    }

    const unregisterSelf = () => _navigation.unregisterNode(id);

    // On component unmount
    useEffect(() => () => unregisterSelf(), [id]);

    return {
        id,
        ref,
        focused,
        active,
        getNode: () => _navigation.getNode(id),
        registerSelf: (options) => _navigation.registerNode(id, options),
        unregisterSelf,
        setFocusable: (focusable) =>
            _navigation.setNodeFocusable(id, focusable),
        setDisabled: (disabled) => {
            if (disabled) unregisterSelf();

            setDisabled(disabled);
        },
        setActiveChild: (child) =>
            _navigation.setActiveChild(_navigation.getNode(id), child),
    };
};

const assignFocus = (id) => _navigation.assignFocus(id);

const getCurrentFocusNode = () => _navigation.getCurrentFocusNode();

const getRootNode = () => _navigation.getRootNode();

const insertTree = (tree, options) => _navigation.insertTree(tree, options);

const getNode = (id) => _navigation.getNode(id);

export {
    initNavigation,
    destroyNavigation,
    useNavigation,
    NavigationContext,
    assignFocus,
    getCurrentFocusNode,
    getRootNode,
    insertTree,
    getNode,
};
