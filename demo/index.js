import React, { forwardRef, createRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { initNavigation, useNavigation, assignFocus } from '../src';

initNavigation({ debug: true });

const padding = 50;
const behavior = 'smooth';

const ScrollView = forwardRef(function (props, ref) {
    return (
        <div
            className="scroll-view"
            style={{
                ...props.style,
                overflowX: props.horizontal ? 'scroll' : 'hidden',
                overflowY: props.horizontal ? 'hidden' : 'scroll',
            }}
            ref={ref}
        >
            {props.children}
        </div>
    );
});

// ScrollView.displayName = 'ScrollView';

// const Item = function (props) {
//     const { ref, focused } = useFocusable({
//         focusKey: props.focusKey,
//         onFocus: props.onFocus,
//     });

//     return (
//         <div
//             ref={ref}
//             style={{
//                 height: '100%',
//                 outline: focused ? '3px solid red' : '1px solid black',
//             }}
//         >
//             {props.number}
//         </div>
//     );
// };

const Rail = function (props) {
    const ref = createRef();

    const { focused } = useNavigation({
        id: props.id,
        parent: 'root',
        isFocusable: true,
    });

    return (
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
                {/* {props.items.map((value, itemKey) => (
                    <Item
                        key={itemKey}
                        number={itemKey + 1}
                        focusKey={`${props.focusKey}item${itemKey}`}
                        onFocus={(element) => {
                            ref.current?.scrollTo({
                                left: element.x - padding,
                                behavior,
                            });
                            props.onFocus({ node: ref.current });
                        }}
                    />
                ))} */}
            </div>
        </ScrollView>
    );
};

const App = function () {
    const { focused } = useNavigation({
        id: 'root',
        orientation: 'vertical',
        isFocusable: false,
    });

    useEffect(() => assignFocus('rail0'), []);

    return (
        <ScrollView
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
    );
};

export default App;

ReactDOM.render(<App />, document.getElementById('content'));
