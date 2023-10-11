import {useEffect, useState} from "react";

function NullFunction() {return null;}

const NullXenon = new Proxy({}, {
    get() {
        return NullFunction;
    }
});

export const useXenon = (apiKey) => {
    const [xenonObject, setXenonObject] = useState(NullXenon);
    useEffect(()=> {
        if(typeof window !== 'undefined'){
            (async () => {
                const imported = (await import('./src/xenon'));
                const {_Xenon} = imported;
                const Xenon = new _Xenon();
                Xenon.init(apiKey);
                setXenonObject(new Proxy(Xenon, {
                    get(target, name) {
                        return Xenon[name];
                    }
                }));
            })();
        }
    }, [apiKey]);
    return xenonObject;
};
