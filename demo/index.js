import React, { forwardRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {
    initNavigation,
    useNavigation,
    NavigationContext,
    assignFocus,
    registerTree,
} from '../src';
import {
    HashRouter as Router,
    Redirect,
    useHistory,
    useLocation,
} from 'react-router-dom';
import {
    CacheSwitch,
    CacheRoute,
    useDidCache,
    useDidRecover,
} from 'react-router-cache-route';

initNavigation({ debug: true });

const useCacheNavigation = function (props) {
    const [cachedNode, setCachedNode] = useState(null);

    const navigation = useNavigation(props);

    useDidCache(() => {
        const node = navigation.getNode();

        navigation.setDisabled(true);

        setCachedNode(node);
    });

    useDidRecover(() => {
        registerTree(cachedNode);
        navigation.setDisabled(false);
    });

    return navigation;
};

const padding = 30;
const behavior = 'smooth';

const ScrollView = forwardRef((props, ref) => (
    <div
        ref={ref}
        className={`scroll-view ${props.className ?? ''}`}
        style={{
            ...props.style,
            position: 'relative',
            overflowX: props.horizontal ? 'scroll' : 'hidden',
            overflowY: props.horizontal ? 'hidden' : 'scroll',
        }}
    >
        <div
            style={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '100%',
                boxSizing: 'border-box',
                gap: `${padding}px`,
            }}
        >
            {props.children}
        </div>
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

    const history = useHistory();

    const location = useLocation();

    const currentPage = location.pathname.replace('/', '');

    const effectDeps = !currentPage && currentPage;

    useEffect(
        () => currentPage && assignFocus(`${props.id}_${currentPage}`),
        [effectDeps]
    );

    useEffect(() => {
        const handleKeyEvent = (event) => {
            if (event.code === 'Backspace') {
                event.preventDefault();
                history.goBack();
            }
        };

        document.addEventListener('keydown', handleKeyEvent);
        return () => document.removeEventListener('keydown', handleKeyEvent);
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
                        style={{
                            ...itemStyle,
                            backgroundColor:
                                currentPage === `page${key}` && 'blue',
                            color: currentPage === `page${key}` && 'white',
                        }}
                        onSelect={() => history.push(`/page${key}`)}
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
    const { ref, active } = useCacheNavigation({
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
    const { ref, active } = useCacheNavigation({
        orientation: 'horizontal',
        id: props.id,
        isWrapping: true,
        onActive: props.onActive,
    });

    const itemHeight = 100;

    const history = useHistory();

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
                            onSelect={() => history.push(`/page2`)}
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

const Page0 = function () {
    const id = 'page0';

    const { ref } = useNavigation({
        id,
        orientation: 'vertical',
        isFocusable: false,
    });

    const handleActivation = (event, element) =>
        ref.current.scrollTo({
            top: element.offsetTop - padding,
            behavior,
        });

    return (
        <ScrollView
            ref={ref}
            style={{
                width: '100%',
                height: '500px',
            }}
        >
            <Grid id="grid" onActive={handleActivation} />
        </ScrollView>
    );
};

const Page1 = function () {
    const id = 'page1';

    const { ref } = useNavigation({
        id,
        orientation: 'vertical',
        isFocusable: false,
    });

    const handleActivation = (event, element) =>
        ref.current.scrollTo({
            top: element.offsetTop - padding,
            behavior,
        });

    return (
        <ScrollView
            ref={ref}
            style={{
                width: '100%',
                height: '500px',
            }}
        >
            {new Array(5).fill(undefined).map((value, key) => (
                <Rail key={key} id={`rail${key}`} onActive={handleActivation} />
            ))}
        </ScrollView>
    );
};

const App = function () {
    const id = 'root';

    const { ref } = useNavigation({
        id,
        orientation: 'vertical',
        isFocusable: false,
    });

    return (
        <NavigationContext.Provider value={id}>
            <div
                ref={ref}
                style={{
                    width: '100%',
                    height: '100%',
                    padding: `${padding}px`,
                    display: 'grid',
                    gridTemplateColumns: '100%',
                    gap: `${padding}px`,
                    boxSizing: 'border-box',
                    textAlign: 'center',
                }}
            >
                <Router>
                    <Nav id="nav" />
                    <CacheSwitch>
                        <Redirect exact from="/" to="/page0" />
                        <CacheRoute path="/page0">
                            <Page0 />
                        </CacheRoute>
                        <CacheRoute path="/page1">
                            <Page1 />
                        </CacheRoute>
                        <CacheRoute path="/page2">
                            <div style={{ height: '500px' }}></div>
                        </CacheRoute>
                    </CacheSwitch>
                </Router>
            </div>
        </NavigationContext.Provider>
    );
};

export default App;

ReactDOM.render(<App />, document.getElementById('content'));
