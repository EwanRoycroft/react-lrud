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
        indexRange: props.indexRange,
        onFocus: props.onFocus,
        onSelect: props.onSelect,
    });

    return (
        <div
            ref={ref}
            style={{
                height: '100%',
                outline: focused ? '3px solid red' : '1px solid black',
                ...props.style,
            }}
            className="item"
            id={props.id}
        >
            {props.children}
        </div>
    );
};

const Nav = function (props) {
    const { ref, active } = useNavigation({
        orientation: 'horizontal',
        id: props.id,
        onActive: props.onActive,
    });

    const itemStyle = { flexGrow: '4', height: '50px', lineHeight: '50px' };

    return (
        <NavigationContext.Provider value={props.id}>
            <nav
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexGrow: '4',
                    gap: `${padding}px`,
                    padding: `25px ${padding}px`,
                    outline: active ? '1px dashed red' : '1px dashed grey',
                }}
                ref={ref}
            >
                {new Array(3).fill(undefined).map((value, key) => (
                    <Item
                        key={key}
                        id={`${props.id}_page${key}`}
                        style={itemStyle}
                        onSelect={() => console.log(`Selected page ${key}`)}
                    >
                        Page {key}
                    </Item>
                ))}
            </nav>
        </NavigationContext.Provider>
    );
};

const Row = function (props) {
    const { ref, active } = useNavigation({
        orientation: 'horizontal',
        id: props.id,
        isFocusable: false,
        onActive: props.onActive,
    });

    const columnSpan = props.columnTemplate ?? new Array(props.columns).fill(1);

    const numColumns = columnSpan.reduce((a, b) => a + b, 0);

    let startLine = 1;

    return (
        <NavigationContext.Provider value={props.id}>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${numColumns}, 100px)`,
                    gridTemplateRows: '100px',
                    gap: `${padding}px`,
                    outline: active ? '1px dashed red' : '1px dashed grey',
                }}
                ref={ref}
            >
                {new Array(props.columns).fill(undefined).map((value, key) => {
                    const item = (
                        <Item
                            key={key}
                            id={`${props.id}_item${key}`}
                            indexRange={[
                                startLine,
                                startLine + (columnSpan[key] - 1),
                            ]}
                            onFocus={(event, element) =>
                                ref.current.scrollTo({
                                    left: element.offsetLeft - padding,
                                    behavior: 'smooth',
                                })
                            }
                            style={{
                                lineHeight: '100px',
                                gridColumn: `${startLine} / span ${columnSpan[key]}`,
                            }}
                        >
                            {key}
                        </Item>
                    );

                    startLine += columnSpan[key];

                    return item;
                })}
            </div>
        </NavigationContext.Provider>
    );
};

const Grid = function (props) {
    const { ref, active } = useNavigation({
        orientation: 'vertical',
        isIndexAlign: true,
        isFocusable: false,
        id: props.id,
    });

    return (
        <NavigationContext.Provider value={props.id}>
            <div
                style={{
                    display: 'grid',
                    gridTemplateRows: 'repeat(3, 100px)',
                    gridTemplateColumns: '100%',
                    gap: `${padding}px`,
                    padding: `${padding}px`,
                    outline: active ? '1px dashed red' : '1px dashed grey',
                }}
                ref={ref}
            >
                <Row
                    id={`${props.id}_row0`}
                    columns={7}
                    onActive={props.onActive}
                />
                <Row
                    id={`${props.id}_row1`}
                    columns={5}
                    columnTemplate={[1, 2, 1, 2, 1]}
                    onActive={props.onActive}
                />
                <Row
                    id={`${props.id}_row2`}
                    columns={5}
                    onActive={props.onActive}
                />
            </div>
        </NavigationContext.Provider>
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
                    outline: active ? '1px dashed red' : '1px dashed grey',
                }}
                ref={ref}
            >
                <div
                    style={{
                        width: 'fit-content',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(10, 100px)',
                        gridTemplateRows: '100px',
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
                            onFocus={(event, element) =>
                                ref.current.scrollTo({
                                    left: element.offsetLeft - padding,
                                    behavior: 'smooth',
                                })
                            }
                            style={{ lineHeight: '100px' }}
                        >
                            {key}
                        </Item>
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

    useEffect(() => assignFocus('nav_page0'), []);

    const handleActivation = (event, element) =>
        ref.current.scrollTo({
            top: element.offsetTop - padding,
            behavior: 'smooth',
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
                    textAlign: 'center',
                }}
            >
                <Nav id="nav" onActive={handleActivation} />
                <Grid id="grid" onActive={handleActivation} />
                {new Array(3).fill(undefined).map((value, key) => (
                    <Rail
                        key={key}
                        id={`rail${key}`}
                        onActive={handleActivation}
                    />
                ))}
            </ScrollView>
        </NavigationContext.Provider>
    );
};

export default App;

ReactDOM.render(<App />, document.getElementById('content'));
