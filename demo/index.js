import React, { forwardRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {
    initNavigation,
    useNavigation,
    NavigationContext,
    assignFocus,
} from '../src';

initNavigation({ debug: true });

const padding = 30;
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

ScrollView.propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    horizontal: PropTypes.bool,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]),
};

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

Item.propTypes = {
    id: PropTypes.string.isRequired,
    indexRange: PropTypes.array,
    onFocus: PropTypes.func,
    onSelect: PropTypes.func,
    style: PropTypes.object,
    children: PropTypes.node,
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
                    padding: `${padding}px`,
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

Nav.propTypes = {
    id: PropTypes.string.isRequired,
    onActive: PropTypes.func,
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

    const itemHeight = 100;

    return (
        <NavigationContext.Provider value={props.id}>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${numColumns}, ${itemHeight}px)`,
                    gridTemplateRows: `${itemHeight}px`,
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
                                    behavior,
                                })
                            }
                            style={{
                                lineHeight: `${itemHeight}px`,
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

Row.propTypes = {
    id: PropTypes.string.isRequired,
    onActive: PropTypes.func,
    columns: PropTypes.number.isRequired,
    columnTemplate: PropTypes.array,
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

Grid.propTypes = {
    id: PropTypes.string.isRequired,
    onActive: PropTypes.func,
};

const Rail = function (props) {
    const { ref, active } = useNavigation({
        orientation: 'horizontal',
        id: props.id,
        isWrapping: true,
        onActive: props.onActive,
    });

    const itemHeight = 100;

    return (
        <NavigationContext.Provider value={props.id}>
            <ScrollView
                horizontal
                style={{
                    width: '100%',
                    height: `${itemHeight + 2 * padding}px`,
                    boxSizing: 'border-box',
                    outline: active ? '1px dashed red' : '1px dashed grey',
                }}
                ref={ref}
            >
                <div
                    style={{
                        width: 'fit-content',
                        display: 'grid',
                        gridTemplateColumns: `repeat(10, ${itemHeight}px)`,
                        gridTemplateRows: `${itemHeight}px`,
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
                                    behavior,
                                })
                            }
                            style={{ lineHeight: `${itemHeight}px` }}
                        >
                            {key}
                        </Item>
                    ))}
                </div>
            </ScrollView>
        </NavigationContext.Provider>
    );
};

Rail.propTypes = {
    id: PropTypes.string.isRequired,
    onActive: PropTypes.func,
};

const App = function () {
    const id = 'root';

    const { ref } = useNavigation({
        id,
        orientation: 'vertical',
        isFocusable: false,
    });

    useEffect(() => assignFocus('nav_page0'));

    const handleActivation = (event, element) =>
        ref.current.scrollTo({
            top: element.offsetTop - padding,
            behavior,
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
