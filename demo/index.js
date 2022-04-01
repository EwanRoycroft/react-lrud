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
        onFocus: props.onFocus,
    });

    return (
        <div
            ref={ref}
            style={{
                height: '100%',
                border: focused ? '3px solid red' : '1px solid black',
            }}
            className="item"
            id={props.id}
        >
            {props.number}
        </div>
    );
};

const Rail = function (props) {
    const { ref, active } = useNavigation({
        orientation: 'horizontal',
        id: props.id,
        isWrapping: true,
        onActive: props.onActive,
    });

    return (
        <NavigationContext.Provider value={props.id}>
            <ScrollView
                horizontal
                style={{
                    width: '100%',
                    height: '200px',
                    boxSizing: 'border-box',
                    border: active ? '1px dashed red' : '1px dashed grey',
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
                            onFocus={(event, element) =>
                                ref.current.scrollTo({
                                    left: element.offsetLeft - padding,
                                    behavior: 'smooth',
                                })
                            }
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
                {new Array(5).fill(undefined).map((value, key) => (
                    <Rail
                        key={key}
                        id={`rail${key}`}
                        onActive={(event, element) =>
                            ref.current.scrollTo({
                                top: element.offsetTop - padding,
                                behavior: 'smooth',
                            })
                        }
                    />
                ))}
            </ScrollView>
        </NavigationContext.Provider>
    );
};

export default App;

ReactDOM.render(<App />, document.getElementById('content'));
