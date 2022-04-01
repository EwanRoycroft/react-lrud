import { createContext, useContext, useRef, useState, useEffect } from 'react';
import { Lrud } from 'lrud';
import { v4 as uuidv4 } from 'uuid';

let _navigation;

const NavigationContext = createContext(null);

let _debug = false;

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

    _debug = options?.debug ?? false;

    document.addEventListener('keydown', _handleKeyEvent);

    if (_debug) {
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

const assignFocus = (id) => _navigation.assignFocus(id);

const useNavigation = function (props) {
    const [id] = useState(props.id ?? uuidv4());
    const [focused, setFocused] = useState(false);
    const [active, setActive] = useState(false);

    const ref = useRef(null);
    const parent = useContext(NavigationContext);

    if (!_navigation.getNode(id)) {
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

    // On component unmount
    useEffect(() => () => _navigation.unregisterNode(id), [id]);

    return {
        id,
        ref,
        focused,
        active,
        assignFocus,
    };
};

export {
    initNavigation,
    destroyNavigation,
    useNavigation,
    NavigationContext,
    assignFocus,
};
