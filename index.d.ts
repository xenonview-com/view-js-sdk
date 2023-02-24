declare module 'xenon-view-sdk' {
    interface XenonInterface {
        init: (apiKey: string, apiUrl?: string) => void;
        platform: (softwareVersion: string, deviceModel: string, operatingSystemName: string, operatingSystemVersion: string) => void;
        removePlatform: () => void;
        variant: (variantNames: Array<string>) => void;
        resetVariants: () => void;
        // Stock Business Outcomes:
        leadCaptured: (specifier: string) => void;
        leadCaptureDeclined: (specifier: string) => void;
        accountSignup: (specifier: string) => void;
        accountSignupDeclined: (specifier: string) => void;
        applicationInstalled: () => void;
        applicationNotInstalled: () => void;
        initialSubscription: (tier: string, method?: string) => void;
        subscriptionDeclined: (tier: string, method?: string) => void;
        subscriptionRenewed: (tier: string, method?: string) => void;
        subscriptionCanceled: (tier: string, method?: string) => void;
        subscriptionUpsold: (tier: string, method?: string) => void;
        subscriptionUpsellDeclined: (tier: string, method?: string) => void;
        referral: (kind: string, detail?: string) => void;
        referralDeclined: (kind: string, detail?: string) => void;
        productAddedToCart: (product: string) => void;
        productNotAddedToCart: (product: string) => void;
        upsold: (product: string) => void;
        upsellDismissed: (product: string) => void;
        checkedOut: () => void;
        checkoutCanceled: () => void;
        productRemoved: (product: string) => void;
        purchased: (method: string) => void;
        purchaseCanceled: (method?: string) => void;
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
        contentRequested:(contentType: string, identifier?: string) => void;
        contentSearched:(contentType: string) => void;
        // Custom Milestones
        milestone: (category: string, operation: string, name: string, detail: string) => void;
        // API Communication:
        commit: () => Promise<object>;
        heartbeat: () => Promise<object>;
        deanonymize: (person: object) => Promise<object>;
        // Internals:
        id: (id?: string) => string;
        newId: () => void;
    }
    let Xenon: XenonInterface;
    export default Xenon;
}