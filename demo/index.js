import React, { forwardRef, createRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
    initNavigation,
    useNavigation,
    NavigationContext,
    assignFocus,
    addNavigationEventListener,
    removeNavigationEventListener,
} from '../src';

initNavigation({ debug: true });

const padding = 50;
const behavior = 'smooth';

const ScrollView = forwardRef((props, ref) => (
    <div
        ref={ref}
        className={`scroll-view ${props.className}`}
        style={{
            ...props.style,
            position: 'relative',
            overflowX: props.horizontal ? 'scroll' : 'hidden',
            overflowY: props.horizontal ? 'hidden' : 'scroll',
        }}
    >
        {props.children}
    </div>
));

ScrollView.displayName = 'ScrollView';

const Item = function (props) {
    const { ref, focused } = useNavigation({
        id: props.id,
        isFocusable: true,
    });

    return (
        <div
            ref={ref}
            style={{
                height: '100%',
                outline: focused ? '3px solid red' : '1px solid black',
            }}
            className="item"
            id={props.id}
        >
            {props.number}
        </div>
    );
};

const Rail = function (props) {
    const { ref, focused } = useNavigation({
        orientation: 'horizontal',
        id: props.id,
    });

    return (
        <NavigationContext.Provider value={props.id}>
            <ScrollView
                horizontal
                style={{
                    width: '100%',
                    height: '200px',
                    boxSizing: 'border-box',
                    outline: focused ? '1px dashed red' : '1px dashed grey',
                }}
                ref={ref}
            >
                <div
                    style={{
                        width: 'fit-content',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(10, 100px)',
                        gridTemplateRows: ' 100px',
                        gap: `${padding}px`,
                        alignItems: 'center',
                        padding: `${padding}px`,
                        paddingRight: '100%',
                    }}
                >
                    {new Array(10).fill(undefined).map((value, key) => (
                        <Item
                            key={key}
                            id={`${props.id}_item${key}`}
                            number={key}
                        />
                    ))}
                </div>
            </ScrollView>
        </NavigationContext.Provider>
    );
};

const App = function () {
    const id = 'root';

    const { ref } = useNavigation({
        id,
        orientation: 'vertical',
        isFocusable: false,
    });

    useEffect(() => assignFocus('rail0_item0'), []);

    useEffect(function () {
        // const handleFocusEvent = ({ element, event }) => {
        //     // if (event.parent?.id !== id) return;
        //     console.log(element, event);
        //     ref.current.scrollTo({
        //         top: element.offsetTop,
        //         behavior: 'smooth',
        //     });
        // };
        // addNavigationEventListener('focus', handleFocusEvent);
        // return () => removeNavigationEventListener('focus', handleFocusEvent);
    });

    return (
        <NavigationContext.Provider value={id}>
            <ScrollView
                ref={ref}
                style={{
                    width: '100%',
                    height: '100%',
                    padding: `${padding}px`,
                    display: 'grid',
                    gap: `${padding}px`,
                    boxSizing: 'border-box',
                }}
            >
                <Rail id="rail0" />
                <Rail id="rail1" />
                <Rail id="rail2" />
                <Rail id="rail3" />
                <Rail id="rail4" />
            </ScrollView>
        </NavigationContext.Provider>
    );
};

export default App;

ReactDOM.render(<App />, document.getElementById('content'));
