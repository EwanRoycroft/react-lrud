import {
    createContext,
    useContext,
    createRef,
    useState,
    useEffect,
} from 'react';
import { Lrud } from 'lrud';
import { v4 as uuidv4 } from 'uuid';
import EventEmitter from 'events';

let _navigation;

const NavigationContext = createContext(null);

let _debug = false;

const _log = (...args) => console.debug('react-lrud:', ...args);

const _eventEmitter = new EventEmitter();

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

const assignFocus = (id) => {
    _navigation.assignFocus(id);
};

const useNavigation = function (props) {
    const [id] = useState(props.id ?? uuidv4());
    const [focused, setFocused] = useState(false);

    const ref = createRef();
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
                props.onFocus?.(event);
                // _eventEmitter.emit('focus', { element: ref.current, event });
                setFocused(true);
            },
            onBlur: (event) => {
                props.onBlur?.(event);
                // _eventEmitter.emit('blur', { element: ref.current, event });
                setFocused(false);
            },
            onSelect: props.onSelect,
            onActive: props.onActive,
            onInactive: props.onInactive,
            onLeave: props.onLeave,
            onEnter: props.onEnter,
            shouldCancelLeave: props.shouldCancelLeave,
            shouldCancelEnter: props.shouldCancelEnter,
            onLeaveCancelled: props.onLeaveCancelled,
            onEnterCancelled: props.onEnterCancelled,
        });
    }

    useEffect(() => () => _navigation.unregisterNode(id), []);

    return {
        id,
        ref,
        focused,
        assignFocus,
    };
};

const addNavigationEventListener = (type, listener) =>
    _eventEmitter.on(type, listener);

const removeNavigationEventListener = (type, listener) =>
    _eventEmitter.off(type, listener);

export {
    initNavigation,
    destroyNavigation,
    useNavigation,
    NavigationContext,
    assignFocus,
    addNavigationEventListener,
    removeNavigationEventListener,
};
