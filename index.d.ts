declare module 'xenon-view-sdk' {
    interface XenonInterface {
        init: (apiKey: string, apiUrl?: string) => void;
        pageView: (page: string) => void;
        funnel: (stage: string, action: string | object) => void;
        outcome: (name:string, action: string | object) => void;
        event: (event: object) =>void;
        id: (id?: string) => string;
        commit: () => Promise<object>;
        deanonymize: (person: object) => Promise<object>;

    }
    let Xenon: XenonInterface;
    export default Xenon;
}