declare module 'xenon-view-sdk' {
    export interface XenonInterface {
        version: () => string;
        init: (apiKey: string, apiUrl?: string, onApiKeyFailure?: Function) => Promise<void>;
        ecomAbandonment: () => Promise<void>;
        customAbandonment: (outcome: Map<string,object>) => Promise<void>;
        cancelAbandonment: () => Promise<void>;
        platform: (softwareVersion: string, deviceModel: string, operatingSystemName: string, operatingSystemVersion: string) => Promise<void>;
        removePlatform: () => Promise<void>;
        variant: (variantNames: Array<string>) => Promise<void>;
        resetVariants: () => Promise<void>;
        startVariant: (variantName: string) => Promise<void>;
        addVariant: (variantName: string) => Promise<void>;
        // Stock Business Outcomes:
        leadAttributed: (source: string, identifier: string) => Promise<void>;
        leadUnattributed: () => Promise<void>;
        leadCaptured: (specifier: string) => Promise<void>;
        leadCaptureDeclined: (specifier: string) => Promise<void>;
        accountSignup: (specifier: string) => Promise<void>;
        accountSignupDeclined: (specifier: string) => Promise<void>;
        applicationInstalled: () => Promise<void>;
        applicationNotInstalled: () => Promise<void>;
        initialSubscription: (tier: string, method?: string, price?: string, term?: string) => Promise<void>;
        subscriptionDeclined: (tier: string, method?: string, price?: string, term?: string) => Promise<void>;
        subscriptionRenewed: (tier: string, method?: string, price?: string, term?: string) => Promise<void>;
        subscriptionPause: (tier: string, method?: string, price?: string, term?: string) => Promise<void>;
        subscriptionCanceled: (tier: string, method?: string, price?: string, term?: string) => Promise<void>;
        subscriptionUpsold: (tier: string, method?: string, price?: string, term?: string) => Promise<void>;
        subscriptionUpsellDeclined: (tier: string, method?: string, price?: string, term?: string) => Promise<void>;
        subscriptionDownsell: (tier: string, method?: string, price?: string, term?: string) => Promise<void>;
        adClicked: (provider: string, id?: string, price?: string) => Promise<void>;
        adIgnored: (provider: string, id?: string, price?: string) => Promise<void>;
        referral: (kind: string, detail?: string) => Promise<void>;
        referralDeclined: (kind: string, detail?: string) => Promise<void>;
        productAddedToCart: (product: string) => Promise<void>;
        productNotAddedToCart: (product: string) => Promise<void>;
        upsold: (product: string, price?: string) => Promise<void>;
        upsellDismissed: (product: string, price?: string) => Promise<void>;
        checkOut: () => Promise<void>;
        checkoutCanceled: () => Promise<void>;
        productRemoved: (product: string) => Promise<void>;
        purchase: (SKUs: Array<string>, price?: string) => Promise<void>;
        purchaseCancel: (SKUs: Array<string>, price?: string) => Promise<void>;
        promiseFulfilled: () => Promise<void>;
        promiseUnfulfilled: () => Promise<void>;
        productKept: (product: string) => Promise<void>;
        productReturned: (product: string) => Promise<void>;
        // Stock Milestones:
        featureAttempted: (name: string, detail?: string) => Promise<void>;
        featureCompleted: (name: string, detail?: string) => Promise<void>;
        featureFailed: (name: string, detail?: string) => Promise<void>;
        contentViewed:(contentType: string, identifier?: string) => Promise<void>;
        contentEdited:(contentType: string, identifier?: string, detail?: string) => Promise<void>;
        contentCreated:(contentType: string, identifier?: string) => Promise<void>;
        contentDeleted:(contentType: string, identifier?: string) => Promise<void>;
        contentArchived:(contentType: string, identifier?: string) => Promise<void>;
        contentRequested:(contentType: string, identifier?: string) => Promise<void>;
        contentSearched:(contentType: string) => Promise<void>;
        pageLoadTime:(loadTime: string, url: string) => Promise<void>;
        // Custom Milestones
        milestone: (category: string, operation: string, name: string, detail: string) => Promise<void>;
        // API Communication:
        count: (outcome: string, value: number, surfaceErrors?: boolean) => Promise<void>;
        commit: (surfaceErrors?: boolean) => Promise<object>;
        heartbeat: (surfaceErrors?: boolean) => Promise<object>;
        deanonymize: (person: object) => Promise<object>;
        recordError: (log: Array<string>) => Promise<void>;
        // Internals:
        id: (id?: string) => Promise<string>;
        newId: () => Promise<string>;
        hasClassInHierarchy: (target: string, className: string, maxDepth: number) => boolean
        autodiscoverLeadFrom: (queryFromUrl: string) => Promise<string>
        pageURL: (url: string) => void
    }
    let Xenon: XenonInterface;
    export default Xenon;
}