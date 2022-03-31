import { useState, useEffect } from 'react';
import { Lrud } from 'lrud';
import { v4 as uuidv4 } from 'uuid';

let _navigation;
let _debug = false;

const _log = (...args) => console.debug('react-lrud:', ...args);

const _handleKeyEvent = function (event) {
    event.preventDefault();
    _navigation.handleKeyEvent(event);
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

    if (!_navigation.getNode(id)) {
        _navigation.registerNode(id, {
            parent: props.parent,
            isFocusable: props.isFocusable ?? true,
            orientation: props.orientation,
            isWrapping: props.isWrapping,
            index: props.index,
            isIndexAlign: props.isIndexAlign,
            indexRange: props.indexRange,
            isStopPropagate: props.isStopPropagate,
            onFocus: (event) => {
                if (event.id === id) {
                    setFocused(true);
                    props.onFocus?.(event);
                }
            },
            onBlur: (event) => {
                if (event.id === id) {
                    setFocused(false);
                    props.onBlur?.(event);
                }
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
        focused,
        assignFocus,
    };
};

export { initNavigation, destroyNavigation, useNavigation, assignFocus };
