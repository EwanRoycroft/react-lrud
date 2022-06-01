import { createContext, useContext, useRef, useState, useEffect } from 'react';
import { Lrud } from 'lrud';
import { v4 as uuidv4 } from 'uuid';
import EventEmitter from 'events';

let _navigation;

let _debug = false;

const _log = (...args) => _debug && console.debug('react-lrud:', ...args);

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

    _debug = options?.debug ?? false;

    if (_debug) {
        _navigation.on('focus', (event) => _log('focus:', event));
        _navigation.on('blur', (event) => _log('blur:', event));
        _navigation.on('active', (event) => _log('active:', event));
        _navigation.on('inactive', (event) => _log('inactive:', event));
        _navigation.on('select', (event) => _log('select:', event));
        _navigation.on('cancelled', (event) => _log('cancelled:', event));
        _navigation.on('move', (event) => _log('move:', event));
    }
};

const pauseNavigation = function () {
    document.removeEventListener('keydown', _handleKeyEvent);
    _log('navigation paused');
};

const resumeNavigation = function () {
    document.addEventListener('keydown', _handleKeyEvent);
    _log('navigation resumed');
};

const destroyNavigation = function () {
    document.removeEventListener('keydown', _handleKeyEvent);
    _navigation = undefined;
};

const NavigationContext = createContext(null);

let _focusIntentId;

const useNavigation = function (props) {
    const [id] = useState(props?.id ?? uuidv4());
    const [focused, setFocused] = useState(false);
    const [active, setActive] = useState(false);
    const [disabled, setDisabled] = useState(false);

    // We can't just pass props functions as the regsitration options because
    // this will create a closure that won't update if props change. We can't
    // re-register the node with new options because this will create a render
    // loop. The solution is to emit events from the node and register new event
    // listeners when the props change.
    const [eventEmitter] = useState(new EventEmitter());

    const ref = useRef(null);
    const parent = useContext(NavigationContext);

    if (!disabled && !_navigation.getNode(id)) {
        const options = {
            parent: props?.parent ?? parent,
            isFocusable: props?.isFocusable ?? true,
            orientation: props?.orientation ?? 'vertical',
            isWrapping: props?.isWrapping,
            index: props?.index,
            isIndexAlign: props?.isIndexAlign,
            indexRange: props?.indexRange,
            isStopPropagate: props?.isStopPropagate,
            onFocus: (event) => {
                eventEmitter.emit('focus', event, ref.current);
                setFocused(true);
            },
            onBlur: (event) => {
                eventEmitter.emit('blur', event, ref.current);
                setFocused(false);
            },
            onFocusWithin: (node, focusNode) =>
                eventEmitter.emit('focusWithin', node, focusNode, ref.current),
            onBlurWithin: (node, blurNode) =>
                eventEmitter.emit('blurWithin', node, blurNode, ref.current),
            onSelect: (event) => {
                eventEmitter.emit('select', event, ref.current);
            },
            onActive: (event) => {
                eventEmitter.emit('active', event, ref.current);
                setActive(true);
            },
            onInactive: (event) => {
                eventEmitter.emit('inactive', event, ref.current);
                setActive(false);
            },
            onLeave: (event) => {
                eventEmitter.emit('leave', event, ref.current);
            },
            onEnter: (event) => {
                eventEmitter.emit('enter', event, ref.current);
            },
            shouldCancelLeave: props?.shouldCancelLeave,
            shouldCancelEnter: props?.shouldCancelEnter,
            onLeaveCancelled: (event) => {
                eventEmitter.emit('leaveCancelled', event, ref.current);
            },
            onEnterCancelled: (event) => {
                eventEmitter.emit('enterCancelled', event, ref.current);
            },
        };

        _navigation.registerNode(id, options);
        _log('registered node:', id, options);
    }

    useEffect(() => {
        props?.onFocus && eventEmitter.on('focus', props.onFocus);
        props?.onBlur && eventEmitter.on('blur', props.onBlur);
        props?.onFocusWithin &&
            eventEmitter.on('focusWithin', props.onFocusWithin);
        props?.onBlurWithin &&
            eventEmitter.on('blurWithin', props.onBlurWithin);
        props?.onSelect && eventEmitter.on('select', props.onSelect);
        props?.onActive && eventEmitter.on('active', props.onActive);
        props?.onInactive && eventEmitter.on('inactive', props.onInactive);
        props?.onLeave && eventEmitter.on('leave', props.onLeave);
        props?.onEnter && eventEmitter.on('enter', props.onEnter);
        props?.onLeaveCancelled &&
            eventEmitter.on('leaveCancelled', props.onLeaveCancelled);
        props?.onEnterCancelled &&
            eventEmitter.on('enterCancelled', props.onEnterCancelled);

        return () => {
            props?.onFocus && eventEmitter.off('focus', props.onFocus);
            props?.onBlur && eventEmitter.off('blur', props.onBlur);
            props?.onFocusWithin &&
                eventEmitter.off('focusWithin', props.onFocusWithin);
            props?.onBlurWithin &&
                eventEmitter.off('blurWithin', props.onBlurWithin);
            props?.onSelect && eventEmitter.off('select', props.onSelect);
            props?.onActive && eventEmitter.off('active', props.onActive);
            props?.onInactive && eventEmitter.off('inactive', props.onInactive);
            props?.onLeave && eventEmitter.off('leave', props.onLeave);
            props?.onEnter && eventEmitter.off('enter', props.onEnter);
            props?.onLeaveCancelled &&
                eventEmitter.off('leaveCancelled', props.onLeaveCancelled);
            props?.onEnterCancelled &&
                eventEmitter.off('enterCancelled', props.onEnterCancelled);
        };
    });

    const unregisterSelf = () => {
        _navigation.unregisterNode(id);
        _log('unregistered node:', id);
    };

    useEffect(() => {
        if (id === _focusIntentId) {
            assignFocus(id);
            _focusIntentId = undefined;
        }
    });

    // On component unmount
    useEffect(() => () => unregisterSelf(), [id]);

    return {
        actualId: id,
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

const getCurrentFocusNode = () => _navigation.getCurrentFocusNode();

const assignFocus = function (id) {
    if (_navigation.getNode(id)) {
        _log('assigned focus:', id);
        _navigation.assignFocus(id);
    } else {
        _log('focus intent:', id);
        _focusIntentId = id;
    }
};

// Unlike assignFocus, this function will not ignore shouldCancelLeave and
// shouldCancelEnter.
const assignFocusSoft = function (id) {
    if (
        getCurrentFocusNode()?.shouldCancelLeave?.() ||
        _navigation.getNode(id)?.shouldCancelEnter?.()
    )
        return false;

    assignFocus(id);
    return true;
};

const getRootNode = () => _navigation.getRootNode();

const insertTree = (tree, options) => _navigation.insertTree(tree, options);

const getNode = (id) => _navigation.getNode(id);

const addEventListener = (type, listener) => _navigation.on(type, listener);

const removeEventListener = (type, listener) => _navigation.off(type, listener);

export {
    initNavigation,
    pauseNavigation,
    resumeNavigation,
    destroyNavigation,
    useNavigation,
    NavigationContext,
    getCurrentFocusNode,
    assignFocus,
    assignFocusSoft,
    getRootNode,
    insertTree,
    getNode,
    addEventListener,
    removeEventListener,
};
