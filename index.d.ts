declare module 'xenon-view-sdk' {
    export interface XenonInterface {
        init: (apiKey: string, apiUrl?: string) => void;
        ecomAbandonment: () => void;
        customAbandonment: (outcome: Map<string,object>) => void;
        cancelAbandonment: () => void;
        platform: (softwareVersion: string, deviceModel: string, operatingSystemName: string, operatingSystemVersion: string) => void;
        removePlatform: () => void;
        variant: (variantNames: Array<string>) => void;
        resetVariants: () => void;
        // Stock Business Outcomes:
        leadAttributed: (source: string, identifier: string) => void;
        leadCaptured: (specifier: string) => void;
        leadCaptureDeclined: (specifier: string) => void;
        accountSignup: (specifier: string) => void;
        accountSignupDeclined: (specifier: string) => void;
        applicationInstalled: () => void;
        applicationNotInstalled: () => void;
        initialSubscription: (tier: string, method?: string, price?: string, term?: string) => void;
        subscriptionDeclined: (tier: string, method?: string, price?: string, term?: string) => void;
        subscriptionRenewed: (tier: string, method?: string, price?: string, term?: string) => void;
        subscriptionPause: (tier: string, method?: string, price?: string, term?: string) => void;
        subscriptionCanceled: (tier: string, method?: string, price?: string, term?: string) => void;
        subscriptionUpsold: (tier: string, method?: string, price?: string, term?: string) => void;
        subscriptionUpsellDeclined: (tier: string, method?: string, price?: string, term?: string) => void;
        subscriptionDownsell: (tier: string, method?: string, price?: string, term?: string) => void;
        adClicked: (provider: string, id?: string, price?: string) => void;
        adIgnored: (provider: string, id?: string, price?: string) => void;
        referral: (kind: string, detail?: string) => void;
        referralDeclined: (kind: string, detail?: string) => void;
        productAddedToCart: (product: string) => void;
        productNotAddedToCart: (product: string) => void;
        upsold: (product: string, price?: string) => void;
        upsellDismissed: (product: string, price?: string) => void;
        checkOut: () => void;
        checkoutCanceled: () => void;
        productRemoved: (product: string) => void;
        purchase: (SKUs: Array<string>, price?: string) => void;
        purchaseCancel: (SKUs: Array<string>, price?: string) => void;
        promiseFulfilled: () => void;
        promiseUnfulfilled: () => void;
        productKept: (product: string) => void;
        productReturned: (product: string) => void;
        // Stock Milestones:
        featureAttempted: (name: string, detail?: string) => void;
        featureCompleted: (name: string, detail?: string) => void;
        featureFailed: (name: string, detail?: string) => void;
        contentViewed:(contentType: string, identifier?: string) => void;
        contentEdited:(contentType: string, identifier?: string, detail?: string) => void;
        contentCreated:(contentType: string, identifier?: string) => void;
        contentDeleted:(contentType: string, identifier?: string) => void;
        contentArchived:(contentType: string, identifier?: string) => void;
        contentRequested:(contentType: string, identifier?: string) => void;
        contentSearched:(contentType: string) => void;
        pageLoadTime:(loadTime: string, url: string) => void;
        // Custom Milestones
        milestone: (category: string, operation: string, name: string, detail: string) => void;
        // API Communication:
        commit: (surfaceErrors?: boolean) => Promise<object>;
        heartbeat: (surfaceErrors?: boolean) => Promise<object>;
        deanonymize: (person: object) => Promise<object>;
        // Internals:
        id: (id?: string) => string;
        newId: () => void;
        hasClassInHierarchy: (target: string, className: string, maxDepth: number) => boolean
    }
    let Xenon: XenonInterface;
    export default Xenon;
}