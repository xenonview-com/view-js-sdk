# xenon-view-sdk
The Xenon View JavaScript SDK is the JavaScript SDK to interact with [XenonView](https://xenonview.com).

**Table of contents:** <a id='contents'></a>

* [What's New](#whats-new)
* [Introduction](#intro)
* [Steps To Get Started](#getting-started)
  * [Identify Business Outcomes](#step-1)
  * [Identify Customer Journey Milestones](#step-2)
  * [Enumerate Technical Stack](#step-3)
  * [Installation](#step-4)
  * [Instrument Business Outcomes](#step-5)
  * [Instrument Customer Journey Milestones](#step-6)
  * [Determine Commit Points](#step-7)
  * [(Optional) Group Customer Journeys](#step-8)
  * [Analysis](#step-9)
  * [Perform Experiments](#step-10)
* [Detailed Usage](#detailed-usage)
  * [Installation](#installation)
  * [Initialization](#instantiation)
  * [Service/Subscription/SaaS Business Outcomes](#saas)
  * [Ecommerce Business Outcomes](#ecom)
  * [Customer Journey Milestones](#milestones)
    * [Features Usage](#feature-usage)
    * [Content Interaction](#content-interaction)
  * [Commit Points](#commiting)
  * [Heartbeats](#heartbeat)
  * [Platforming](#platforming)
  * [Experiments](#experiments)
  * [Customer Journey Grouping](#deanonymizing-journeys)
  * [Other Considerations](#other)
    * [(Optional) Error Handling](#errors)
    * [(Optional) Custom Customer Journey Milestones](#custom)
    * [(Optional) Journey Identification](#cuuid)
* [License](#license)

<br/>

## What's New <a id='whats-new'></a>
* v0.1.8 - Added: Downsell, Ad, Content Archive, Subscription Pause and included price for all subscriptions
* v0.1.7 - Nextjs support 
* v0.1.6 - include minified 
* v0.1.5 - Rename tag to variant
* v0.1.4 - 0.1 typescript support
* v0.1.3 - Readme update
* v0.1.2 - typo fixed
* v0.1.1 - [Install](#installation-html) via HTML as plain JavaScript 
* v0.1.0 - SDK redesign

<br/>


## Introduction <a id='intro'></a>
Everyone should have access to world-class customer telemetry.

You should be able to identify the most pressing problems affecting your business quickly.
You should be able to determine if messaging or pricing, or technical challenges are causing friction for your customers.
You should be able to answer questions like:
1. Is my paywall wording or the price of my subscriptions causing my customers to subscribe less?
2. Is my website performance or my application performance driving retention?
3. Is purchasing a specific product or the product portfolio driving referrals?

With the correct approach to instrumentation coupled with AI-enhanced analytics, you can quickly answer these questions and much more.

<br/>

[back to top](#contents)

## Get Started With The Following Steps: <a id='getting-started'></a>
The Xenon View SDK can be used in your application to provide a new level of customer telemetry. You'll need to embed the instrumentation into your website/application via this SDK.

Instrumentation will vary based on your use case; are you offering a service/subscription (SaaS) or selling products (Ecom)?

In a nutshell, the steps to get started are as follows:
1. Identify Business Outcomes and Customer Journey Milestones leading to those Outcomes.
2. Instrument the Outcomes/Milestones.
3. Analyze the results.

<br/>


### Step 1 - Business Outcomes <a id='step-1'></a>

Regardless of your business model, your first step will be identifying your desired business outcomes.

**Example - Service/Subscription/SaaS**:
1. Lead Capture
2. Account Signup
3. Initial Subscription
4. Renewed Subscription
5. Upsold Subscription
6. Referral

**Example - Ecom**:
1. Place the product in the cart
2. Checkout
3. Upsold
4. Purchase

> :memo: Note: Each outcome has an associated success and failure.

<br/>


### Step 2 - Customer Journey Milestones <a id='step-2'></a>

For each Business Outcome, identify potential customer journey milestones leading up to that business outcome.

**Example - Service/Subscription/SaaS for _Lead Capture_**:
1. View informational content
2. Asks question in the forum
3. Views FAQs
4. Views HowTo
5. Requests info product

**Example - Ecom for _Place product in cart_** :
1. Search for product information
2. Learns about product
3. Read reviews

<br/>

### Step 3 - Enumerate Technical Stack <a id='step-3'></a>

Next, you will want to figure out which SDK to use. We have some of the most popular languages covered.

Start by listing the technologies involved and what languages your company uses. For example:
1. Front end - UI (Javascript - react)
2. Back end - API server (Java)
3. Mobile app - iPhone (Swift)
4. Mobile app - Android (Android Java)

Next, figure out how your outcomes spread across those technologies. Below are pointers to our currently supported languages:
* [React](https://github.com/xenonview-com/view-js-sdk)
* [Next.Js](https://github.com/xenonview-com/view-js-sdk)
* [Angular](https://github.com/xenonview-com/view-js-sdk)
* [HTML](https://github.com/xenonview-com/view-js-sdk)
* [Plain JavaScript](https://github.com/xenonview-com/view-js-sdk)
* [iPhone/iPad](https://github.com/xenonview-com/view-swift-sdk)
* [Mac](https://github.com/xenonview-com/view-swift-sdk)
* [Java](https://github.com/xenonview-com/view-java-sdk)
* [Android Java](https://github.com/xenonview-com/view-java-sdk)
* [Python](https://github.com/xenonview-com/view-python-sdk)

Finally, continue the steps below for each technology and outcome.


### Step 4 - Installation <a id='step-4'></a>

After you have done the prework of [Step 1](#step-1) and [Step 2](#step-2), you are ready to [install Xenon View](#installation).
Once installed, you'll need to [initialize the SDK](#instantiation) and get started instrumenting.


<br/>
<br/>


### Step 5 - Instrument Business Outcomes <a id='step-5'></a>

We have provided several SDK calls to shortcut your instrumentation and map to the outcomes identified in [Step 1](#step-1).  
These calls will roll up into the associated Categories during analysis. These rollups allow you to view each Category in totality.
As you view the categories, you can quickly identify issues (for example, if there are more Failures than Successes for a Category).

**[Service/Subscription/SaaS Related Outcome Calls](#saas)**  (click on a call to see usage)

| Category | Success | Failure | 
| --- | --- | --- |
| Lead Capture | [`leadCaptured()`](#saas-lead-capture) | [`leadCaptureDeclined()`](#saas-lead-capture-fail) | 
| Account Signup | [`accountSignup()`](#saas-account-signup) | [`accountSignupDeclined()`](#saas-account-signup-fail) | 
| Application Installation | [`applicationInstalled()`](#saas-application-install) |  [`applicationNotInstalled()`](#saas-application-install-fail) | 
| Initial Subscription | [`initialSubscription()`](#saas-initial-subscription) | [`subscriptionDeclined()`](#saas-initial-subscription-fail) |
| Subscription Renewed | [`subscriptionRenewed()`](#saas-renewed-subscription) | [`subscriptionCanceled()`](#saas-renewed-subscription-fail) / [`subscriptionPaused()`](#saas-paused-subscription) | 
| Subscription Upsell | [`subscriptionUpsold()`](#saas-upsell-subscription) | [`subscriptionUpsellDeclined()`](#saas-upsell-subscription-fail) / [`subscriptionDownsell()`](#saas-downsell-subscription)| 
| Ad Clicked | [`adClicked()`](#saas-ad-clicked) | [`adIgnored()`](#saas-ad-ignored) |
| Referral | [`referral()`](#saas-referral) | [`referralDeclined()`](#saas-referral-fail) | 


**[Ecom Related Outcome Calls](#ecom)** (click on a call to see usage)

| Category | Success | Failure |
| --- | --- | --- | 
| Lead Capture | [`leadCaptured()`](#ecom-lead-capture) | [`leadCaptureDeclined()`](#ecom-lead-capture-fail) | 
| Account Signup | [`accountSignup()`](#ecom-account-signup) | [`accountSignupDeclined()`](#ecom-account-signup-fail) | 
| Add To Cart | [`productAddedToCart()`](#ecom-product-to-cart) | [`productNotAddedToCart()`](#ecom-product-to-cart-fail) |
| Product Upsell | [`upsold()`](#ecom-upsell) | [`upsellDismissed()`](#ecom-upsell-fail) | 
| Checkout | [`checkedOut()`](#ecom-checkout) | [`checkoutCanceled()`](#ecom-checkout-fail) / [`productRemoved()`](#ecom-checkout-remove) | 
| Purchase | [`purchased()`](#ecom-purchase) | [`purchaseCanceled()`](#ecom-purchase-fail) | 
| Promise Fulfillment | [`promiseFulfilled()`](#ecom-promise-fulfillment) | [`promiseUnfulfilled()`](#ecom-promise-fulfillment-fail) | 
| Product Disposition | [`productKept()`](#ecom-product-outcome) | [`productReturned()`](#ecom-product-outcome-fail) |
| Referral | [`referral()`](#ecom-referral) | [`referralDeclined()`](#ecom-referral-fail) |

<br/>

### Step 6 - Instrument Customer Journey Milestones <a id='step-6'></a>

Next, you will want to instrument your website/application/backend/service for the identified Customer Journey Milestones [Step 2](#step-2).
We have provided several SDK calls to shortcut your instrumentation here as well.  

During analysis, each Milestone is chained together with the proceeding and following Milestones.
That chain terminates with an Outcome (described in [Step 4](#step-4)).
AI/ML is employed to determine Outcome correlation and predictability for the chains and individual Milestones.
During the [analysis step](#step-8), you can view the correlation and predictability as well as the Milestone chains
(called Customer Journeys in this guide).

Milestones break down into two types (click on a call to see usage):

| Features | Content |
| --- | --- |
| [`featureAttempted()`](#feature-started) | [`contentViewed()`](#content-viewed) |
| [`featureFailed()`](#feature-failed) | [`contentCreated()`](#content-created) / [`contentEdited()`](#content-edited) |
| [`featureCompleted()`](#feature-complete) |  [`contentDeleted()`](#content-deleted) / [`contentArchived()`](#content-archived) |
| | [`contentRequested()`](#content-requested)/[`contentSearched()`](#content-searched)|

<br/>

### Step 7 - Commit Points <a id='step-7'></a>


Once instrumented, you'll want to select appropriate [commit points](#commit). Committing will initiate the analysis on your behalf by Xenon View.

<br/>
<br/>

### Step 8 (Optional) - Group Customer Journeys <a id='step-8'></a>

All the customer journeys (milestones and outcomes) are anonymous by default.
For example, if a Customer interacts with your brand in the following way:
1. Starts on your marketing website.
2. Downloads and uses an app.
3. Uses a feature requiring an API call.


*Each of those journeys will be unconnected and not grouped.*

To associate those journeys with each other, you can [deanonymize](#deanonymizing-journeys) the Customer. Deanonymizing will allow for a deeper analysis of a particular user.

Deanonymizing is optional. Basic matching of the customer journey with outcomes is valuable by itself. Deanonymizing will add increased insight as it connects Customer Journeys across devices.

<br/>

### Step 9 - Analysis <a id='step-9'></a>


Once you have released your instrumented code, you can head to [XenonView](https://xenonview.com/) to view the analytics.

<br/>

### Step 10 - Perform Experiments <a id='step-10'></a>

There are multiple ways you can experiment using XenonView. We"ll focus here on three of the most common: time, platform, and variant based cohorts.

#### Time-based cohorts
Each Outcome and Milestone is timestamped. You can use this during the analysis phase to compare timeframes. A typical example is making a feature change.
Knowing when the feature went to production, you can filter in the XenonView UI based on the timeframe before and the timeframe after to observe the results.


#### Variant-based cohorts
You can identify a journey collection as an [experiment](#experiments) before collecting data. This will allow you to run A/B testing-type experiments (of course not limited to two).
As an example, let"s say you have two alternate content/feature variants and you have a way to direct half of the users to Variant A and the other half to Variant B.
You can name each variant before the section of code that performs that journey. After collecting the data, you can filter in the XenonView UI based on each variant to
observe the results.


#### Platform-based cohorts
You can [Platform](#platforming) any journey collection before collecting data. This will allow you to experiment against different platforms:
* Operating System Name
* Operating System version
* Device model (Pixel, iPhone 14, Docker Container, Linux VM, Dell Server, etc.)
* A software version of your application.

As an example, let's say you have an iPhone and Android mobile application and you want to see if an outcome is more successful on one device verse the other.
You can platform before the section of code that performs that flow. After collecting the data, you can filter in the XenonView UI based on each platform to
observe the results.

<br/>
<br/>
<br/>

[back to top](#contents)

## Detailed Usage <a id='detailed-usage'></a>
The following section gives detailed usage instructions and descriptions.
It provides code examples for each of the calls.

<br/>

### Installation <a id='installation'></a>

<br/>

#### Install React/Next.Js/Angular (or other JS framework): <a id='installation-framework'></a>
You can install the Xenon View SDK from [npm](https://www.npmjs.com/package/xenon-view-sdk):

Via npm:
```bash
npm install xenon-view-sdk
```

Via yarn:
```bash
yarn add xenon-view-sdk
```

<br/>

[back to top](#contents)

<br/>

#### Install with HTML: <a id='installation-html'></a>
You can install the Xenon View SDK as plain JavaScript via HTML. Below are a couple examples. 
More are provided for each function.
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <script src="https://cdn.jsdelivr.net/gh/xenonview-com/view-js-sdk@v0.1.8/dist/xenon_view_sdk.min.js"></script>
  <script>
    Xenon.init('<API KEY>')
  </script>
  <title>Sample</title>
</head>
<body>
<script>
  function exampleFeatureOccurred() {
    Xenon.featureAttempted("Example Feature")
    Xenon.commit()
  }

  function exampleReferralOutcomeOccurred() {
    Xenon.referral("From Button")
    Xenon.commit()
  }
</script>

<button onclick="exampleFeatureOccurred()">Example Feature</button>
<button onclick="exampleReferralOutcomeOccurred()">Example Referral Outcome</button>
</body>
</html>
```


<br/>

[back to top](#contents)

### Instantiation <a id='instantiation'></a>

The View SDK is a JS module you'll need to include in your application. After inclusion, you'll need to init the singleton object:

###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

// start by initializing Xenon View
Xenon.init('<API KEY>');
```
###### Nextjs example:
```javascript
"use client";
import Image from 'next/image'
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');
  return (<main className="flex min-h-screen flex-col items-center justify-between p-24"/>);
}
```
###### HTML example:
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <script src="https://cdn.jsdelivr.net/gh/xenonview-com/view-js-sdk@v0.1.8/dist/xenon_view_sdk.min.js"></script>
  <script>
    Xenon.init('<API KEY>')
  </script>
  <title>Sample</title>
</head>
```
Of course, you'll have to make the following modifications to the above code:
- Replace `<API KEY>` with your [api key](https://xenonview.com/api-get)

<br/>

[back to top](#contents)

### Service/Subscription/SaaS Related Business Outcomes <a id='saas'></a>

<br/>

#### Lead Capture  <a id='saas-lead-capture'></a>
Use this call to track Lead Capture (emails, phone numbers, etc.)
You can add a specifier string to the call to differentiate as follows:

<br/>

##### ```leadCaptured()```

###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const emailSpecified = 'Email';
const phoneSpecified = 'Phone Number';

// Successful Lead Capture of an email
Xenon.leadCaptured(emailSpecified);
//...
// Successful Lead Capture of a phone number
Xenon.leadCaptured(phoneSpecified);
```

###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const emailSpecified = 'Email';
  const phoneSpecified = 'Phone Number';

  // Successful Lead Capture of an email
  Xenon.leadCaptured(emailSpecified);
  //...
  // Successful Lead Capture of a phone number
  Xenon.leadCaptured(phoneSpecified);
```

###### HTML example:
```html
<script>
  const emailSpecified = 'Email'
  function leadCapturedOccurred() {
    Xenon.leadCaptured(emailSpecified)
    Xenon.commit()
  }
</script>

<button onclick="leadCapturedOccurred()">Lead Capture</button>
```

<br/>

##### ```leadCaptureDeclined()``` <a id='saas-lead-capture-fail'></a>
> :memo: Note: You want to be consistent between success and failure and match the specifiers
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const emailSpecified = 'Email';
const phoneSpecified = 'Phone Number'; 

// Unsuccessful Lead Capture of an email
Xenon.leadCaptureDeclined(emailSpecified);
// ...
// Unsuccessful Lead Capture of a phone number
Xenon.leadCaptureDeclined(phoneSpecified);
```

###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const emailSpecified = 'Email';
  const phoneSpecified = 'Phone Number'; 
  
  // Unsuccessful Lead Capture of an email
  Xenon.leadCaptureDeclined(emailSpecified);
  // ...
  // Unsuccessful Lead Capture of a phone number
  Xenon.leadCaptureDeclined(phoneSpecified);
```

###### HTML example:
```html
<script>
  const emailSpecified = 'Email'
  function leadCaptureDeclinedOccurred() {
    Xenon.leadCaptureDeclined(emailSpecified)
    Xenon.commit()
  }
</script>

<button onclick="leadCaptureDeclinedOccurred()">Lead Capture Declined</button>
```

<br/>

#### Account Signup  <a id='saas-account-signup'></a>
Use this call to track when customers signup for an account.
You can add a specifier string to the call to differentiate as follows:

<br/>

##### ```accountSignup()```
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const viaFacebook = 'Facebook';
const viaGoogle = 'Facebook';
const viaEmail = 'Email';

// Successful Account Signup with Facebook
Xenon.accountSignup(viaFacebook);
// ...
// Successful Account Signup with Google
Xenon.accountSignup(viaGoogle);
// ...
// Successful Account Signup with an Email
Xenon.accountSignup(viaEmail);
```

###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const viaFacebook = 'Facebook';
  const viaGoogle = 'Facebook';
  const viaEmail = 'Email';
  
  // Successful Account Signup with Facebook
  Xenon.accountSignup(viaFacebook);
  // ...
  // Successful Account Signup with Google
  Xenon.accountSignup(viaGoogle);
  // ...
  // Successful Account Signup with an Email
  Xenon.accountSignup(viaEmail);
```

###### HTML example:
```html
<script>
  const viaFacebook = 'Facebook'
  function accountSignupOccurred() {
    Xenon.accountSignup(viaFacebook)
    Xenon.commit()
  }
</script>

<button onclick="accountSignupOccurred()">Account Signup</button>
```

<br/>

##### ```accountSignupDeclined()``` <a id='saas-account-signup-fail'></a>
> :memo: Note: You want to be consistent between success and failure and match the specifiers
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const viaFacebook = 'Facebook';
const viaGoogle = 'Facebook';
const viaEmail = 'Email';

// Unsuccessful Account Signup with Facebook
Xenon.accountSignupDeclined(viaFacebook);
// ...
// Unsuccessful Account Signup with Google
Xenon.accountSignupDeclined(viaGoogle);
// ...
// Unsuccessful Account Signup with an Email
Xenon.accountSignupDeclined(viaEmail);
```

###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const viaFacebook = 'Facebook';
  const viaGoogle = 'Facebook';
  const viaEmail = 'Email';
  
  // Unsuccessful Account Signup with Facebook
  Xenon.accountSignupDeclined(viaFacebook);
  // ...
  // Unsuccessful Account Signup with Google
  Xenon.accountSignupDeclined(viaGoogle);
  // ...
  // Unsuccessful Account Signup with an Email
  Xenon.accountSignupDeclined(viaEmail);
```

###### HTML example:
```html
<script>
  const viaFacebook = 'Facebook'
  function accountSignupDeclinedOccurred() {
    Xenon.accountSignupDeclined(viaFacebook)
    Xenon.commit()
  }
</script>

<button onclick="accountSignupDeclinedOccurred()">Account Signup Decline</button>
```

<br/>

#### Application Installation  <a id='saas-application-install'></a>
Use this call to track when customers install your application.

<br/>

##### ```applicationInstalled()```
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

// Successful Application Installation
Xenon.applicationInstalled();
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');
  
  // Successful Application Installation
  Xenon.applicationInstalled();
```
###### HTML example:
```html
<script>
  function applicationInstalledOccurred() {
    Xenon.applicationInstalled()
    Xenon.commit()
  }
</script>

<button onclick="applicationInstalledOccurred()">Install Application</button>
```

<br/>

##### ```applicationNotInstalled()``` <a id='saas-application-install-fail'></a>
> :memo: Note: You want consistency between success and failure.
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

// Unsuccessful or not completed Application Installation
Xenon.applicationNotInstalled();
```

###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  // Unsuccessful or not completed Application Installation
  Xenon.applicationNotInstalled();
```

###### HTML example:
```html
<script>
  function applicationNotInstalledOccurred() {
    Xenon.applicationNotInstalled()
    Xenon.commit()
  }
</script>

<button onclick="applicationNotInstalledOccurred()">Application Not Installed</button>
```

<br/>

#### Initial Subscription  <a id='saas-initial-subscription'></a>
Use this call to track when customers initially subscribe.
You can add a specifier string to the call to differentiate as follows:

<br/>

##### ```initialSubscription()```
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const tierSilver = 'Silver Monthly';
const tierGold = 'Gold';
const tierPlatium = 'Platium';
const annualSilver = 'Silver Annual';
const method = 'Stripe'; // optional
const value = '$25'; //optional

// Successful subscription of the lowest tier with Stripe
Xenon.initialSubscription(tierSilver, method);

// Successful subscription of the lowest tier with Stripe for $25
Xenon.initialSubscription(tierSilver, method, value);
// ...
// Successful subscription of the middle tier
Xenon.initialSubscription(tierGold);
// ...
// Successful subscription to the top tier
Xenon.initialSubscription(tierPlatium);
// ...
// Successful subscription of an annual period
Xenon.initialSubscription(annualSilver);
```

###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');
  
  const tierSilver = 'Silver Monthly';
  const tierGold = 'Gold';
  const tierPlatium = 'Platium';
  const annualSilver = 'Silver Annual';
  const method = 'Stripe'; // optional
  const value = '$25'; //optional


  // Successful subscription of the lowest tier with Stripe
  Xenon.initialSubscription(tierSilver, method);

  // Successful subscription of the lowest tier with Stripe for $25
  Xenon.initialSubscription(tierSilver, method, value);
  // ...
  // Successful subscription of the middle tier
  Xenon.initialSubscription(tierGold);
  // ...
  // Successful subscription to the top tier
  Xenon.initialSubscription(tierPlatium);
  // ...
  // Successful subscription of an annual period
  Xenon.initialSubscription(annualSilver);
```

###### HTML example:
```html
<script>
  const annualSilver = 'Silver Annual'
  const method = 'Stripe'
  const value = '$25'
  function initialSubscriptionOccurred() {
    Xenon.initialSubscription(annualSilver, method, value)
    Xenon.commit()
  }
</script>

<button onclick="initialSubscriptionOccurred()">Subscribe</button>
```

<br/>

##### ```subscriptionDeclined()``` <a id='saas-initial-subscription-fail'></a>
> :memo: Note: You want to be consistent between success and failure and match the specifiers
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const tierSilver = 'Silver Monthly';
const tierGold = 'Gold';
const tierPlatium = 'Platium';
const annualSilver = 'Silver Annual';
const method = 'Stripe'; // optional
const value = '$25';

// Unsuccessful subscription of the lowest tier
Xenon.subscriptionDeclined(tierSilver);
// ...
// Unsuccessful subscription of the middle tier
Xenon.subscriptionDeclined(tierGold);
// ...
// Unsuccessful subscription to the top tier
Xenon.subscriptionDeclined(tierPlatium);
// ...
// Unsuccessful subscription of an annual period
Xenon.subscriptionDeclined(annualSilver, method);

// Unsuccessful subscription of an annual period for $25
Xenon.subscriptionDeclined(annualSilver, method, value);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const tierSilver = 'Silver Monthly';
  const tierGold = 'Gold';
  const tierPlatium = 'Platium';
  const annualSilver = 'Silver Annual';
  const method = 'Stripe'; // optional
  const value = '$25';
  
  // Unsuccessful subscription of the lowest tier
  Xenon.subscriptionDeclined(tierSilver);
  // ...
  // Unsuccessful subscription of the middle tier
  Xenon.subscriptionDeclined(tierGold);
  // ...
  // Unsuccessful subscription to the top tier
  Xenon.subscriptionDeclined(tierPlatium);
  // ...
  // Unsuccessful subscription of an annual period
  Xenon.subscriptionDeclined(annualSilver, method);

  // Unsuccessful subscription of an annual period for $25
  Xenon.subscriptionDeclined(annualSilver, method, value);
```
###### HTML example:
```html
<script>
  const annualSilver = 'Silver Annual'
  const method = 'Stripe'
  const value = '$25'
  function subscriptionDeclinedOccurred() {
    Xenon.subscriptionDeclined(annualSilver, method, value)
    Xenon.commit()
  }
</script>

<button onclick="subscriptionDeclinedOccurred()">Don't Subscribe</button>
```

<br/>

#### Subscription Renewal  <a id='saas-renewed-subscription'></a>
Use this call to track when customers renew.
You can add a specifier string to the call to differentiate as follows:

<br/>

##### ```subscriptionRenewed()```
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const tierSilver = 'Silver Monthly';
const tierGold = 'Gold';
const tierPlatium = 'Platium';
const annualSilver = 'Silver Annual';
const method = 'Stripe'; //optional
const value = '$25';

// Successful renewal of the lowest tier with Stripe
Xenon.subscriptionRenewed(tierSilver, method);

// Successful renewal of the lowest tier with Stripe for $25
Xenon.subscriptionRenewed(tierSilver, method, value);
// ...
// Successful renewal of the middle tier
Xenon.subscriptionRenewed(tierGold);
// ...
// Successful renewal of the top tier
Xenon.subscriptionRenewed(tierPlatium);
// ...
// Successful renewal of an annual period
Xenon.subscriptionRenewed(annualSilver);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const tierSilver = 'Silver Monthly';
  const tierGold = 'Gold';
  const tierPlatium = 'Platium';
  const annualSilver = 'Silver Annual';
  const method = 'Stripe'; //optional
  const value = '$25';
  
  // Successful renewal of the lowest tier with Stripe
  Xenon.subscriptionRenewed(tierSilver, method);

  // Successful renewal of the lowest tier with Stripe for $25
  Xenon.subscriptionRenewed(annualSilver, method, value);
  // ...
  // Successful renewal of the middle tier
  Xenon.subscriptionRenewed(tierGold);
  // ...
  // Successful renewal of the top tier
  Xenon.subscriptionRenewed(tierPlatium);
  // ...
  // Successful renewal of an annual period
  Xenon.subscriptionRenewed(annualSilver);
```
###### HTML example:
```html
<script>
  const annualSilver = 'Silver Annual'
  const method = 'Stripe'
  const value = '$25'
  function subscriptionRenewedOccurred() {
    Xenon.subscriptionRenewed(annualSilver, method, value)
    Xenon.commit()
  }
</script>

<button onclick="subscriptionRenewedOccurred()">Renew Subscription</button>
```

<br/>

##### ```subscriptionCanceled()``` <a id='saas-renewed-subscription-fail'></a>
> :memo: Note: You want to be consistent between success and failure and match the specifiers
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const tierSilver = 'Silver Monthly';
const tierGold = 'Gold';
const tierPlatium = 'Platium';
const annualSilver = 'Silver Annual';
const method = 'Stripe'; //optional
const value = '$25'; //optional

// Canceled subscription of the lowest tier
Xenon.subscriptionCanceled(tierSilver);
// ...
// Canceled subscription of the middle tier
Xenon.subscriptionCanceled(tierGold);
// ...
// Canceled subscription of the top tier
Xenon.subscriptionCanceled(tierPlatium);
// ...
// Canceled subscription of an annual period with Stripe
Xenon.subscriptionCanceled(annualSilver, method);

// Canceled subscription of an annual period with Stripe for $25
Xenon.subscriptionCanceled(annualSilver, method, value);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const tierSilver = 'Silver Monthly';
  const tierGold = 'Gold';
  const tierPlatium = 'Platium';
  const annualSilver = 'Silver Annual';
  const method = 'Stripe'; //optional
  const value = '$25'; //optional


  // Canceled subscription of the lowest tier
  Xenon.subscriptionCanceled(tierSilver);
  // ...
  // Canceled subscription of the middle tier
  Xenon.subscriptionCanceled(tierGold);
  // ...
  // Canceled subscription of the top tier
  Xenon.subscriptionCanceled(tierPlatium);
  // ...
  // Canceled subscription of an annual period with Stripe for $25
  Xenon.subscriptionCanceled(annualSilver, method, value);
```
###### HTML example:
```html
<script>
  const annualSilver = 'Silver Annual'
  const method = 'Stripe'
  const value = '$25'
  function subscriptionCanceledOccurred() {
    Xenon.subscriptionCanceled(annualSilver, method, value)
    Xenon.commit()
  }
</script>

<button onclick="subscriptionCanceledOccurred()">Cancel Subscription</button>
```

<br/>

##### ```subscriptionPaused()``` <a id='saas-paused-subscription'></a>

> :memo: Note: You want to be consistent between success and failure and match the specifiers
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const tierSilver = 'Silver Monthly';
const tierGold = 'Gold';
const tierPlatium = 'Platium';
const annualSilver = 'Silver Annual';
const method = 'Stripe'; //optional
const value = '$25'; //optional

// Paused subscription of the lowest tier
Xenon.subscriptionPaused(tierSilver);
// ...
// Paused subscription of the middle tier
Xenon.subscriptionPaused(tierGold);
// ...
// Paused subscription of the top tier
Xenon.subscriptionPaused(tierPlatium);
// ...
// Paused subscription of an annual period with Stripe
Xenon.subscriptionPaused(annualSilver, method);

// Paused subscription of an annual period with Stripe for $25
Xenon.subscriptionPaused(annualSilver, method, value);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const tierSilver = 'Silver Monthly';
  const tierGold = 'Gold';
  const tierPlatium = 'Platium';
  const annualSilver = 'Silver Annual';
  const method = 'Stripe'; //optional
  const value = '$25'; //optional
  
  // Paused subscription of the lowest tier
  Xenon.subscriptionPaused(tierSilver);
  // ...
  // Paused subscription of the middle tier
  Xenon.subscriptionPaused(tierGold);
  // ...
  // Paused subscription of the top tier
  Xenon.subscriptionPaused(tierPlatium);
  // ...
  // Paused subscription of an annual period with Stripe
  Xenon.subscriptionPaused(annualSilver, method);

  // Paused subscription of an annual period with Stripe for $25
  Xenon.subscriptionPaused(annualSilver, method, value);
```
###### HTML example:
```html
<script>
  const annualSilver = 'Silver Annual'
  const method = 'Stripe'
  const value = '$25'
  function subscriptionPausedOccurred() {
    Xenon.subscriptionPaused(annualSilver, method, value)
    Xenon.commit()
  }
</script>

<button onclick="subscriptionPausedOccurred()">Pause Subscription</button>
```

<br/>

#### Subscription Upsold  <a id='saas-upsell-subscription'></a>
Use this call to track when a Customer upgrades their subscription.  
You can add a specifier string to the call to differentiate as follows:

<br/>

##### ```subscriptionUpsold()```
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const tierGold = 'Gold Monthly';
const tierPlatium = 'Platium';
const annualGold = 'Gold Annual';
const method = 'Stripe'; // optional
const value = '$25'; //optional


// Assume already subscribed to Silver

// Successful upsell of the middle tier with Stripe
Xenon.subscriptionUpsold(tierGold, method);

// Successful upsell of the middle tier with Stripe for $25
Xenon.subscriptionUpsold(tierGold, method, value);
// ...
// Successful upsell of the top tier
Xenon.subscriptionUpsold(tierPlatium);
// ...
// Successful upsell of middle tier - annual period
Xenon.subscriptionUpsold(annualGold);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');
  
  const tierGold = 'Gold Monthly';
  const tierPlatium = 'Platium';
  const annualGold = 'Gold Annual';
  const method = 'Stripe'; // optional
  const value = '$25'; //optional


  // Assume already subscribed to Silver
  
  // Successful upsell of the middle tier with Stripe
  Xenon.subscriptionUpsold(tierGold, method);

  // Successful upsell of the middle tier with Stripe for $25
  Xenon.subscriptionUpsold(tierGold, method, value);
  // ...
  // Successful upsell of the top tier
  Xenon.subscriptionUpsold(tierPlatium);
  // ...
  // Successful upsell of middle tier - annual period
  Xenon.subscriptionUpsold(annualGold);
```
###### HTML example:
```html
<script>
  const annualSilver = 'Silver Annual'
  const method = 'Stripe'
  const value = '$25'
  function subscriptionUpsoldOccurred() {
    Xenon.subscriptionUpsold(annualSilver, method, value)
    Xenon.commit()
  }
</script>

<button onclick="subscriptionUpsoldOccurred()">Upsell Subscription</button>
```

<br/>

##### ```subscriptionUpsellDeclined()``` <a id='saas-upsell-subscription-fail'></a>
> :memo: Note: You want to be consistent between success and failure and match the specifiers
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const tierGold = 'Gold Monthly';
const tierPlatium = 'Platium';
const annualGold = 'Gold Annual';
const method = 'Stripe'; //optional
const value = '$25'; //optional


// Assume already subscribed to Silver

// Rejected upsell of the middle tier
Xenon.subscriptionUpsellDeclined(tierGold);
// ...
// Rejected upsell of the top tier
Xenon.subscriptionUpsellDeclined(tierPlatium);
// ...
// Rejected upsell of middle tier - annual period with Stripe
Xenon.subscriptionUpsellDeclined(annualGold, method);

// Rejected upsell of middle tier - annual period with Stripe for $25
Xenon.subscriptionUpsellDeclined(annualGold, method, value);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const tierGold = 'Gold Monthly';
  const tierPlatium = 'Platium';
  const annualGold = 'Gold Annual';
  const method = 'Stripe'; //optional
  const value = '$25'; //optional

  // Assume already subscribed to Silver
  
  // Rejected upsell of the middle tier
  Xenon.subscriptionUpsellDeclined(tierGold);
  // ...
  // Rejected upsell of the top tier
  Xenon.subscriptionUpsellDeclined(tierPlatium);
  // ...
  // Rejected upsell of middle tier - annual period with Stripe
  Xenon.subscriptionUpsellDeclined(annualGold, method);
  
  // Rejected upsell of middle tier - annual period with Stripe for $25
  Xenon.subscriptionUpsellDeclined(annualGold, method, value);
```
###### HTML example:
```html
<script>
  const annualSilver = 'Silver Annual'
  const method = 'Stripe'
  const value = '$25'
  function subscriptionUpsellDeclinedOccurred() {
    Xenon.subscriptionUpsellDeclined(annualSilver, method, value)
    Xenon.commit()
  }
</script>

<button onclick="subscriptionUpsellDeclinedOccurred()">Decline Upsell</button>
```

<br/>

##### ```subscriptionDownsell()``` <a id='saas-downsell-subscription'></a>
> :memo: Note: You want to be consistent between success and failure and match the specifiers
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const tierGold = 'Gold Monthly';
const tierPlatium = 'Platium';
const annualGold = 'Gold Annual';
const method = 'Stripe'; //optional
const value = '$15'; //optional

// Assume already subscribed to Silver

// Downsell to the middle tier
Xenon.subscriptionDownsell(tierGold);
// ...
// Downsell to middle tier - annual period with Stripe
Xenon.subscriptionDownsell(annualGold, method);

// Downsell to middle tier - annual period with Stripe for $15
Xenon.subscriptionDownsell(annualGold, method, value);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const tierGold = 'Gold Monthly';
  const tierPlatium = 'Platium';
  const annualGold = 'Gold Annual';
  const method = 'Stripe'; //optional
  const value = '$15'; //optional
  
  // Assume already subscribed to Silver
  
  // Downsell to the middle tier
  Xenon.subscriptionDownsell(tierGold);
  // ...
  // Downsell to middle tier - annual period with Stripe
  Xenon.subscriptionDownsell(annualGold, method);

  // Downsell to middle tier - annual period with Stripe for $15
  Xenon.subscriptionDownsell(annualGold, method, value);
```
###### HTML example:
```html
<script>
  const annualSilver = 'Silver Annual'
  const method = 'Stripe'
  const value = '$15'
  function subscriptionDownsellOccurred() {
    Xenon.subscriptionDownsell(annualSilver, method, value)
    Xenon.commit()
  }
</script>

<button onclick="subscriptionDownsellOccurred()">Decrease Subscription</button>
```

<br/>

#### Ad Clicked  <a id='saas-ad-clicked'></a>
Use this call to track when customers click on an Advertisement.
You can add a specifier string to the call to differentiate as follows:

<br/>

##### ```adClicked()```
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const provider = 'AdMob';
const id = 'ID-1234'; // optional
const value = '$0.15'; //optional

// Click an Ad from AdMob identfied by ID-1234
Xenon.adClicked(provider, id);

// Click an Ad from AdMob identfied by ID-1234
Xenon.adClicked(provider, id, value);
// ...
// Click an Ad from AdMob
Xenon.adClicked(provider);
```

###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const provider = 'AdMob';
  const id = 'ID-1234'; // optional
  const value = '$0.15'; //optional

  // Click an Ad from AdMob identfied by ID-1234
  Xenon.adClicked(provider, id);

  // Click an Ad from AdMob identfied by ID-1234
  Xenon.adClicked(provider, id, value);
  // ...
  // Click an Ad from AdMob
  Xenon.adClicked(provider);
```

###### HTML example:
```html
<script>
  const provider = 'AdMob'
  const id = 'ID-1234'
  const value = '$0.15'
  
  function adClickedOccurred() {
    Xenon.adClicked(provider, id, value)
    Xenon.commit()
  }
</script>

<button onclick="adClickedOccurred()">Ad Clicked</button>
```

<br/>

##### ```adIgnored()```  <a id='saas-ad-ignored'></a>
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const provider = 'AdMob';
const id = 'ID-1234'; // optional
const value = '$0.15'; //optional

// No action on an Ad from AdMob identfied by ID-1234
Xenon.adIgnored(provider, id);

// No action on an Ad from AdMob identfied by ID-1234 for $0.15
Xenon.adIgnored(provider, id, value);
// ...
// No action on an Ad from AdMob
Xenon.adIgnored(provider);
```

###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const provider = 'AdMob';
  const id = 'ID-1234'; // optional
  const value = '$0.15'; //optional

  // No action on an Ad from AdMob identfied by ID-1234
  Xenon.adIgnored(provider, id);

  // No action on an Ad from AdMob identfied by ID-1234 for $0.15
  Xenon.adIgnored(provider, id, value);
  // ...
  // No action on an Ad from AdMob
  Xenon.adIgnored(provider);
```

###### HTML example:
```html
<script>
  const provider = 'AdMob'
  const id = 'ID-1234'
  const value = '$0.15'
  
  function adIgnored() {
    Xenon.adIgnored(provider, id, value)
    Xenon.commit()
  }
</script>

<button onclick="adIgnored()">Ignore Ad</button>
```

<br/>


#### Referral  <a id='saas-referral'></a>
Use this call to track when customers refer someone to your offering.
You can add a specifier string to the call to differentiate as follows:

<br/>

##### ```referral()```
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const kind = 'Share';
const detail = 'Review'; // optional

// Successful referral by sharing a review
Xenon.referral(kind, detail);
// -OR-
Xenon.referral(kind);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');
  
  const kind = 'Share';
  const detail = 'Review'; // optional
  
  // Successful referral by sharing a review
  Xenon.referral(kind, detail);
  // -OR-
  Xenon.referral(kind);
```
###### HTML example:
```html
<script>
  const kind = 'Share'
  function referralOccurred() {
    Xenon.referral(kind)
    Xenon.commit()
  }
</script>

<button onclick="referralOccurred()">Referral</button>
```

<br/>

##### ```referralDeclined()``` <a id='saas-referral-fail'></a>
> :memo: Note: You want to be consistent between success and failure and match the specifiers
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const kind = 'Share';
const detail = 'Review'; // optional

//Customer declined referral 
Xenon.referralDeclined(kind, detail);
// -OR-
Xenon.referralDeclined(kind);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const kind = 'Share';
  const detail = 'Review'; // optional
  
  //Customer declined referral 
  Xenon.referralDeclined(kind, detail);
  // -OR-
  Xenon.referralDeclined(kind);
```
###### HTML example:
```html
<script>
  const kind = 'Share'
  function referralDeclinedOccurred() {
    Xenon.referralDeclined(kind)
    Xenon.commit()
  }
</script>

<button onclick="referralDeclinedOccurred()">Decline Referral</button>
```

<br/>

[back to top](#contents)

### Ecommerce Related Outcomes <a id='ecom'></a>


<br/>

#### Lead Capture  <a id='ecom-lead-capture'></a>
Use this call to track Lead Capture (emails, phone numbers, etc.)
You can add a specifier string to the call to differentiate as follows:

<br/>

##### ```leadCaptured()```
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const emailSpecified = 'Email';
const phoneSpecified = 'Phone Number';

// Successful Lead Capture of an email
Xenon.leadCaptured(emailSpecified);
// ...
// Successful Lead Capture of a phone number
Xenon.leadCaptured(phoneSpecified);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const emailSpecified = 'Email';
  const phoneSpecified = 'Phone Number';
  
  // Successful Lead Capture of an email
  Xenon.leadCaptured(emailSpecified);
  // ...
  // Successful Lead Capture of a phone number
  Xenon.leadCaptured(phoneSpecified);
```
###### HTML example:
```html
<script>
  const emailSpecified = 'Email'
  function leadCapturedOccurred() {
    Xenon.leadCaptured(emailSpecified)
    Xenon.commit()
  }
</script>

<button onclick="leadCapturedOccurred()">Lead Capture</button>
```

<br/>

##### ```leadCaptureDeclined()``` <a id='ecom-lead-capture-fail'></a>
> :memo: Note: You want to be consistent between success and failure and match the specifiers
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const emailSpecified = 'Email';
const phoneSpecified = 'Phone Number'; 

// Unsuccessful Lead Capture of an email
Xenon.leadCaptureDeclined(emailSpecified);
// ...
// Unsuccessful Lead Capture of a phone number
Xenon.leadCaptureDeclined(phoneSpecified);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const emailSpecified = 'Email';
  const phoneSpecified = 'Phone Number'; 
  
  // Unsuccessful Lead Capture of an email
  Xenon.leadCaptureDeclined(emailSpecified);
  // ...
  // Unsuccessful Lead Capture of a phone number
  Xenon.leadCaptureDeclined(phoneSpecified);
```
###### HTML example:
```html
<script>
  const emailSpecified = 'Email'
  function leadCaptureDeclinedOccurred() {
    Xenon.leadCaptureDeclined(emailSpecified)
    Xenon.commit()
  }
</script>

<button onclick="leadCaptureDeclinedOccurred()">Decline Lead Capture</button>
```

<br/>

#### Account Signup  <a id='ecom-account-signup'></a>
Use this call to track when customers signup for an account.
You can add a specifier string to the call to differentiate as follows:

<br/>

##### ```accountSignup()```
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const viaFacebook = 'Facebook';
const viaGoogle = 'Facebook';
const viaEmail = 'Email';

// Successful Account Signup with Facebook
Xenon.accountSignup(viaFacebook);
// ...
// Successful Account Signup with Google
Xenon.accountSignup(viaGoogle);
// ...
// Successful Account Signup with an Email
Xenon.accountSignup(viaEmail);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const viaFacebook = 'Facebook';
  const viaGoogle = 'Facebook';
  const viaEmail = 'Email';
  
  // Successful Account Signup with Facebook
  Xenon.accountSignup(viaFacebook);
  // ...
  // Successful Account Signup with Google
  Xenon.accountSignup(viaGoogle);
  // ...
  // Successful Account Signup with an Email
  Xenon.accountSignup(viaEmail);
```
###### HTML example:
```html
<script>
  const viaFacebook = 'Facebook'
  function accountSignupOccurred() {
    Xenon.accountSignup(viaFacebook)
    Xenon.commit()
  }
</script>

<button onclick="accountSignupOccurred()">Account Signup</button>
```

<br/>

##### ```accountSignupDeclined()``` <a id='ecom-account-signup-fail'></a>
> :memo: Note: You want to be consistent between success and failure and match the specifiers
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const viaFacebook = 'Facebook';
const viaGoogle = 'Facebook';
const viaEmail = 'Email';

// Unsuccessful Account Signup with Facebook
Xenon.accountSignupDeclined(viaFacebook);
// ...
// Unsuccessful Account Signup with Google
Xenon.accountSignupDeclined(viaGoogle);
// ...
// Unsuccessful Account Signup with an Email
Xenon.accountSignupDeclined(viaEmail);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const viaFacebook = 'Facebook';
  const viaGoogle = 'Facebook';
  const viaEmail = 'Email';
  
  // Unsuccessful Account Signup with Facebook
  Xenon.accountSignupDeclined(viaFacebook);
  // ...
  // Unsuccessful Account Signup with Google
  Xenon.accountSignupDeclined(viaGoogle);
  // ...
  // Unsuccessful Account Signup with an Email
  Xenon.accountSignupDeclined(viaEmail);
```
###### HTML example:
```html
<script>
  const viaFacebook = 'Facebook'
  function accountSignupDeclinedOccurred() {
    Xenon.accountSignupDeclined(viaFacebook)
    Xenon.commit()
  }
</script>

<button onclick="accountSignupDeclinedOccurred()">Decline Account Signup</button>
```

<br/>

#### Add Product To Cart  <a id='ecom-product-to-cart'></a>
Use this call to track when customers add a product to the cart.
You can add a specifier string to the call to differentiate as follows:

<br/>

##### ```productAddedToCart()```
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const laptop = 'Dell XPS';
const keyboard = 'Apple Magic Keyboard';

// Successful adds a laptop to the cart
Xenon.productAddedToCart(laptop);
// ...
// Successful adds a keyboard to the cart
Xenon.productAddedToCart(keyboard);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');
  
  const laptop = 'Dell XPS';
  const keyboard = 'Apple Magic Keyboard';
  
  // Successful adds a laptop to the cart
  Xenon.productAddedToCart(laptop);
  // ...
  // Successful adds a keyboard to the cart
  Xenon.productAddedToCart(keyboard);
```
###### HTML example:
```html
<script>
  const laptop = 'Dell XPS'
  function productAddedToCartOccurred() {
    Xenon.productAddedToCart(laptop)
    Xenon.commit()
  }
</script>

<button onclick="productAddedToCartOccurred()">Add to cart</button>
```

<br/>

##### ```productNotAddedToCart()``` <a id='ecom-product-to-cart-fail'></a>
> :memo: Note: You want to be consistent between success and failure and match the specifiers
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const laptop = 'Dell XPS';
const keyboard = 'Apple Magic Keyboard';

// Doesn't add a laptop to the cart
Xenon.productNotAddedToCart(laptop);
// ...
// Doesn't add a keyboard to the cart
Xenon.productNotAddedToCart(keyboard);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const laptop = 'Dell XPS';
  const keyboard = 'Apple Magic Keyboard';
  
  // Doesn't add a laptop to the cart
  Xenon.productNotAddedToCart(laptop);
  // ...
  // Doesn't add a keyboard to the cart
  Xenon.productNotAddedToCart(keyboard);
```
###### HTML example:
```html
<script>
  const laptop = 'Dell XPS'
  function productNotAddedToCartOccurred() {
    Xenon.productNotAddedToCart(laptop)
    Xenon.commit()
  }
</script>

<button onclick="productNotAddedToCartOccurred()">Remove from cart</button>
```

<br/>

#### Upsold Additional Products  <a id='ecom-upsell'></a>
Use this call to track when you upsell additional product(s) to customers.
You can add a specifier string to the call to differentiate as follows:

<br/>

##### ```upsold()```
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const laptop = 'Dell XPS';
const laptopValue = '$1459'; //optional
const keyboard = 'Apple Magic Keyboard';
const keyboardValue = '$139'; //optional

// upsold a laptop
Xenon.upsold(laptop, laptopValue);
// ...
// upsold a keyboard
Xenon.upsold(keyboard, keyboardValue);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const laptop = 'Dell XPS';
  const laptopValue = '$1459'; //optional
  const keyboard = 'Apple Magic Keyboard';
  const keyboardValue = '$139'; //optional

  // upsold a laptop
  Xenon.upsold(laptop, laptopValue);
  // ...
  // upsold a keyboard
  Xenon.upsold(keyboard, keyboardValue);
```
###### HTML example:
```html
<script>
  const laptop = 'Dell XPS'
  const laptopValue = '$1459'
  function upsoldOccurred() {
    Xenon.upsold(laptop, laptopValue)
    Xenon.commit()
  }
</script>

<button onclick="upsoldOccurred()">Add extra item from cart</button>
```

<br/>

##### ```upsellDismissed()``` <a id='ecom-upsell-fail'></a>
> :memo: Note: You want to be consistent between success and failure and match the specifiers
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const laptop = 'Dell XPS';
const keyboard = 'Apple Magic Keyboard';
const keyboardValue = '$139'; //optional

// Doesn't add a laptop during upsell
Xenon.upsellDismissed(laptop);
// ...
// Doesn't add a keyboard during upsell
Xenon.upsellDismissed(keyboard, keyboardValue);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const laptop = 'Dell XPS';
  const keyboard = 'Apple Magic Keyboard';
  const keyboardValue = '$139'; //optional
  
  // Doesn't add a laptop during upsell
  Xenon.upsellDismissed(laptop);
  // ...
  // Doesn't add a keyboard during upsell
  Xenon.upsellDismissed(keyboard, keyboardValue);
```
###### HTML example:
```html
<script>
  const laptop = 'Dell XPS'
  const laptopValue = '$1459'

  function upsellDismissedOccurred() {
    Xenon.upsellDismissed(laptop, laptopValue)
    Xenon.commit()
  }
</script>

<button onclick="upsellDismissedOccurred()">Remove extra item from cart</button>
```

<br/>

#### Customer Checks Out  <a id='ecom-checkout'></a>
Use this call to track when your Customer is checking out.

<br/>

##### ```checkedOut()```
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

// Successful Checkout
Xenon.checkedOut();
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  // Successful Checkout
  Xenon.checkedOut();
```
###### HTML example:
```html
<script>
  function checkedOutOccurred() {
    Xenon.checkedOut()
    Xenon.commit()
  }
</script>

<button onclick="checkedOutOccurred()">Checkout</button>
```

<br/>

##### ```checkoutCanceled()``` <a id='ecom-checkout-fail'></a>
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

//Customer cancels check out.
Xenon.checkoutCanceled();

```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  //Customer cancels check out.
  Xenon.checkoutCanceled();
```
###### HTML example:
```html
<script>
  function checkoutCanceledOccurred() {
    Xenon.checkoutCanceled()
    Xenon.commit()
  }
</script>

<button onclick="checkoutCanceledOccurred()">Cancel Checkout</button>
```

<br/>

##### ```productRemoved()``` <a id='ecom-checkout-remove'></a>
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const laptop = 'Dell XPS';
const keyboard = 'Apple Magic Keyboard';

// Removes a laptop during checkout
Xenon.productRemoved(laptop);
// ...
// Removes a keyboard during checkout
Xenon.productRemoved(keyboard);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const laptop = 'Dell XPS';
  const keyboard = 'Apple Magic Keyboard';
  
  // Removes a laptop during checkout
  Xenon.productRemoved(laptop);
  // ...
  // Removes a keyboard during checkout
  Xenon.productRemoved(keyboard);
```
###### HTML example:
```html
<script>
  const laptop = 'Dell XPS'
  function productRemovedOccurred() {
    Xenon.productRemoved(laptop)
    Xenon.commit()
  }
</script>

<button onclick="productRemovedOccurred()">Remove product</button>
```

<br/>

#### Customer Completes Purchase  <a id='ecom-purchase'></a>
Use this call to track when your Customer completes a purchase.

<br/>

##### ```purchased()```
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const method = 'Stripe';
const value = '$2011'; // optional

// Successful Purchase
Xenon.purchased(method);

// Successful Purchase for $2011
Xenon.purchased(method, value);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const method = 'Stripe';
  const value = '$2011'; // optional

  // Successful Purchase
  Xenon.purchased(method);

  // Successful Purchase for $2011
  Xenon.purchased(method, value);
```
###### HTML example:
```html
<script>
  const method = 'Stripe'
  const value = '$2011'
  function purchasedOccurred() {
    Xenon.purchased(method, value)
    Xenon.commit()
  }
</script>

<button onclick="purchasedOccurred()">Purchase</button>
```

<br/>

##### ```purchaseCanceled()``` <a id='ecom-purchase-fail'></a>
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const method = 'Stripe'; // optional
const value = '$2011'; // optional

//Customer cancels the purchase.
Xenon.purchaseCanceled();
// -OR-
Xenon.purchaseCanceled(method);
// -OR-
Xenon.purchaseCanceled(method, value);

```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const method = 'Stripe'; // optional
  const value = '$2011'; // optional

  //Customer cancels the purchase.
  Xenon.purchaseCanceled();
  // -OR-
  Xenon.purchaseCanceled(method);
  // -OR-
  Xenon.purchaseCanceled(method, value);

```
###### HTML example:
```html
<script>
  const method = 'Stripe'
  const value = '$2011'

  function purchaseCanceledOccurred() {
    Xenon.purchaseCanceled(method, value)
    Xenon.commit()
  }
</script>

<button onclick="purchaseCanceledOccurred()">Cancel Purchase</button>
```

<br/>

#### Purchase Shipping  <a id='ecom-promise-fulfillment'></a>
Use this call to track when your Customer receives a purchase.

<br/>

##### ```promiseFulfilled()```
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

// Successfully Delivered Purchase
Xenon.promiseFulfilled();
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  // Successfully Delivered Purchase
  Xenon.promiseFulfilled();
```
###### HTML example:
```html
<script>
  function promiseFulfilledOccurred() {
    Xenon.promiseFulfilled()
    Xenon.commit()
  }
</script>

<button onclick="promiseFulfilledOccurred()">Product Delivered</button>
```

<br/>

##### ```promiseUnfulfilled(()``` <a id='ecom-promise-fulfillment-fail'></a>
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

// Problem Occurs During Shipping And No Delivery
Xenon.promiseUnfulfilled();
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  // Problem Occurs During Shipping And No Delivery
  Xenon.promiseUnfulfilled();
```
###### HTML example:
```html
<script>
  function promiseUnfulfilledOccurred() {
    Xenon.promiseUnfulfilled()
    Xenon.commit()
  }
</script>

<button onclick="promiseUnfulfilledOccurred()">Product Delivery Failed</button>
```

<br/>

#### Customer Keeps or Returns Product  <a id='ecom-product-outcome'></a>
Use this call to track if your Customer keeps the product.
You can add a specifier string to the call to differentiate as follows:

<br/>

##### ```productKept()```
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const laptop = 'Dell XPS';
const keyboard = 'Apple Magic Keyboard';

//Customer keeps a laptop
Xenon.productKept(laptop);
// ...
//Customer keeps a keyboard
Xenon.productKept(keyboard);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const laptop = 'Dell XPS';
  const keyboard = 'Apple Magic Keyboard';
  
  //Customer keeps a laptop
  Xenon.productKept(laptop);
  // ...
  //Customer keeps a keyboard
  Xenon.productKept(keyboard);
```
###### HTML example:
```html
<script>
  const laptop = 'Dell XPS'
  function productKeptOccurred() {
    Xenon.productKept(laptop)
    Xenon.commit()
  }
</script>

<button onclick="productKeptOccurred()">Product Kept</button>
```

<br/>

##### ```productReturned()``` <a id='ecom-product-outcome-fail'></a>
> :memo: Note: You want to be consistent between success and failure and match the specifiers
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const laptop = 'Dell XPS';
const keyboard = 'Apple Magic Keyboard';

//Customer returns a laptop
Xenon.productReturned(laptop);
// ...
//Customer returns a keyboard
Xenon.productReturned(keyboard);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const laptop = 'Dell XPS';
  const keyboard = 'Apple Magic Keyboard';
  
  //Customer returns a laptop
  Xenon.productReturned(laptop);
  // ...
  //Customer returns a keyboard
  Xenon.productReturned(keyboard);
```
###### HTML example:
```html
<script>
  const laptop = 'Dell XPS'
  function productReturnedOccurred() {
    Xenon.productReturned(laptop)
    Xenon.commit()
  }
</script>

<button onclick="productReturnedOccurred()">Product Returned</button>
```

<br/>

#### Referrals  <a id='ecom-referral'></a>
Use this call to track when customers refer someone to your offering.
You can add a specifier string to the call to differentiate as follows:

<br/>

##### ```referral()```
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const kind = 'Share Product';
const detail = 'Dell XPS';

// Successful referral by sharing a laptop
Xenon.referral(kind, detail);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const kind = 'Share Product';
  const detail = 'Dell XPS';
  
  // Successful referral by sharing a laptop
  Xenon.referral(kind, detail);
```
###### HTML example:
```html
<script>
  const kind = 'Share Product'
  const detail = 'Dell XPS'
  function referralOccurred() {
    Xenon.referral(kind, detail)
    Xenon.commit()
  }
</script>

<button onclick="referralOccurred()">Share Product</button>
```

<br/>

##### ```referralDeclined()``` <a id='ecom-referral-fail'></a>
> :memo: Note: You want to be consistent between success and failure and match the specifiers
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const kind = 'Share Product';
const detail = 'Dell XPS';

//Customer declined referral 
Xenon.referralDeclined(kind, detail);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const kind = 'Share Product';
  const detail = 'Dell XPS';
  
  //Customer declined referral 
  Xenon.referralDeclined(kind, detail);
```
###### HTML example:
```html
<script>
  const kind = 'Share Product'
  const detail = 'Dell XPS'
  function referralDeclinedOccurred() {
    Xenon.referralDeclined(kind, detail)
    Xenon.commit()
  }
</script>

<button onclick="referralDeclinedOccurred()">Decline Sharing Product</button>
```

<br/>

[back to top](#contents)

### Customer Journey Milestones <a id='milestones'></a>

As a customer interacts with your brand (via Advertisements, Marketing Website, Product/Service, etc.), they journey through a hierarchy of interactions.
At the top level are business outcomes. In between Outcomes, they may achieve other milestones, such as interacting with content and features.
Proper instrumentation of these milestones can establish correlation and predictability of business outcomes.

As of right now, Customer Journey Milestones break down into two categories:
1. [Feature Usage](#feature-usage)
2. [Content Interaction](#content-interaction)

<br/>

#### Feature Usage  <a id='feature-usage'></a>
Features are your product/application/service's traits or attributes that deliver value to your customers.
They differentiate your offering in the market. Typically, they are made up of and implemented by functions.

<br/>

##### ```featureAttempted()``` <a id='feature-started'></a>
Use this function to indicate the start of feature usage.
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const name = 'Scale Recipe';
const detail = 'x2'; // optional

//Customer initiated using a feature 
Xenon.featureAttempted(name, detail);
// -OR-
Xenon.featureAttempted(name);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const name = 'Scale Recipe';
  const detail = 'x2'; // optional
  
  //Customer initiated using a feature 
  Xenon.featureAttempted(name, detail);
  // -OR-
  Xenon.featureAttempted(name);
```
###### HTML example:
```html
<script>
  const name = 'Scale Recipe'
  const detail = 'x2'
  function featureAttemptedOccurred() {
    Xenon.featureAttempted(name, detail)
    Xenon.commit()
  }
</script>

<button onclick="featureAttemptedOccurred()">Feature Scale Recipe</button>
```

<br/>

##### ```featureCompleted()``` <a id='feature-complete'></a>
Use this function to indicate the successful completion of the feature.
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const name = 'Scale Recipe';
const detail = 'x2'; // optional

// ...
// Customer used a feature 
Xenon.featureCompleted(name, detail);

// -OR-

// Customer initiated using a feature 
Xenon.featureAttempted(name, detail);
// ...
// feature code/function calls
// ...
// feature completes successfully 
Xenon.featureCompleted(name, detail);
// -OR-
Xenon.featureCompleted(name);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const name = 'Scale Recipe';
  const detail = 'x2'; // optional
  
  // ...
  // Customer used a feature 
  Xenon.featureCompleted(name, detail);
  
  // -OR-
  
  // Customer initiated using a feature 
  Xenon.featureAttempted(name, detail);
  // ...
  // feature code/function calls
  // ...
  // feature completes successfully 
  Xenon.featureCompleted(name, detail);
  // -OR-
  Xenon.featureCompleted(name);
```
###### HTML example:
```html
<script>
  const name = 'Scale Recipe'
  const detail = 'x2'
  function featureCompletedOccurred() {
    Xenon.featureCompleted(name, detail)
    Xenon.commit()
  }
</script>

<button onclick="featureCompletedOccurred()">Feature Scale Recipe Complete</button>
```

<br/>

##### ```featureFailed()``` <a id='feature-failed'></a>
Use this function to indicate the unsuccessful completion of a feature being used (often in the exception handler).
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';


const name = 'Scale Recipe';
const detail = 'x2'; // optional


//Customer initiated using a feature 
Xenon.featureAttempted(name, detail);
try {
  // feature code that could fail
}
catch(err) {
  //feature completes unsuccessfully 
  Xenon.featureFailed(name, detail);
  // -OR-
  Xenon.featureFailed(name);
}

```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const name = 'Scale Recipe';
  const detail = 'x2'; // optional
  
  
  //Customer initiated using a feature 
  Xenon.featureAttempted(name, detail);
  try {
    // feature code that could fail
  }
  catch(err) {
    //feature completes unsuccessfully 
    Xenon.featureFailed(name, detail);
    // -OR-
    Xenon.featureFailed(name);
  }

```
###### HTML example:
```html
<script>
  const name = 'Scale Recipe'
  const detail = 'x2'
  function featureFailedOccurred() {
    Xenon.featureFailed(name, detail)
    Xenon.commit()
  }
</script>

<button onclick="featureFailedOccurred()">Feature Failed</button>
```

<br/>

[back to top](#contents)

#### Content Interaction  <a id='content-interaction'></a>
Content is created assets/resources for your site/service/product.
It can be static or dynamic. You will want to mark content that contributes to your Customer's experience or buying decision.
Typical examples:
* Blog
* Blog posts
* Video assets
* Comments
* Reviews
* HowTo Guides
* Charts/Graphs
* Product/Service Descriptions
* Surveys
* Informational product

<br/>

##### ```contentViewed()``` <a id='content-viewed'></a>
Use this function to indicate a view of specific content.
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const contentType = 'Blog Post';
const identifier = 'how-to-install-xenon-view'; // optional

// Customer view a blog post 
Xenon.contentViewed(contentType, identifier);
// -OR-
Xenon.contentViewed(contentType);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const contentType = 'Blog Post';
  const identifier = 'how-to-install-xenon-view'; // optional
  
  // Customer view a blog post 
  Xenon.contentViewed(contentType, identifier);
  // -OR-
  Xenon.contentViewed(contentType);
```
###### HTML example:
```html
<script>
  const contentType = 'Blog Post'
  const identifier = 'how-to-install-xenon-view'
  function contentViewedOccurred() {
    Xenon.contentViewed(contentType, identifier)
    Xenon.commit()
  }
</script>

<button onclick="contentViewedOccurred()">Content Viewed</button>
```

<br/>

##### ```contentEdited()``` <a id='content-edited'></a>
Use this function to indicate the editing of specific content.
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const contentType = 'Review';
const identifier = 'Dell XPS'; //optional
const detail = 'Rewrote'; //optional

//Customer edited their review about a laptop
Xenon.contentEdited(contentType, identifier, detail);
// -OR-
Xenon.contentEdited(contentType, identifier);
// -OR-
Xenon.contentEdited(contentType);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const contentType = 'Review';
  const identifier = 'Dell XPS'; //optional
  const detail = 'Rewrote'; //optional
  
  //Customer edited their review about a laptop
  Xenon.contentEdited(contentType, identifier, detail);
  // -OR-
  Xenon.contentEdited(contentType, identifier);
  // -OR-
  Xenon.contentEdited(contentType);
```
###### HTML example:
```html
<script>
  const contentType = 'Blog Post'
  function contentEditedOccurred() {
    Xenon.contentEdited(contentType)
    Xenon.commit()
  }
</script>

<button onclick="contentEditedOccurred()">Content Edited</button>
```

<br/>

##### ```contentCreated()``` <a id='content-created'></a>
Use this function to indicate the creation of specific content.
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const contentType = 'Blog Comment';
const identifier = 'how-to-install-xenon-view'; // optional

//Customer wrote a comment on a blog post
Xenon.contentCreated(contentType, identifier);
// -OR- 
Xenon.contentCreated(contentType);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const contentType = 'Blog Comment';
  const identifier = 'how-to-install-xenon-view'; // optional
  
  //Customer wrote a comment on a blog post
  Xenon.contentCreated(contentType, identifier);
  // -OR- 
  Xenon.contentCreated(contentType);
```
###### HTML example:
```html
<script>
  const contentType = 'Blog Post'
  function contentCreatedOccurred() {
    Xenon.contentCreated(contentType)
    Xenon.commit()
  }
</script>

<button onclick="contentCreatedOccurred()">Content Created</button>
```

<br/>

##### ```contentDeleted()``` <a id='content-deleted'></a>
Use this function to indicate the deletion of specific content.
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const contentType = 'Blog Comment';
const identifier = 'how-to-install-xenon-view'; // optional

//Customer deleted their comment on a blog post 
Xenon.contentDeleted(contentType, identifier);
// -OR- 
Xenon.contentDeleted(contentType);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const contentType = 'Blog Comment';
  const identifier = 'how-to-install-xenon-view'; // optional
  
  //Customer deleted their comment on a blog post 
  Xenon.contentDeleted(contentType, identifier);
  // -OR- 
  Xenon.contentDeleted(contentType);
```
###### HTML example:
```html
<script>
  const contentType = 'Blog Post'
  function contentDeletedOccurred() {
    Xenon.contentDeleted(contentType)
    Xenon.commit()
  }
</script>

<button onclick="contentDeletedOccurred()">Content Created</button>
```

<br/>

##### ```contentArchived()``` <a id='content-archived'></a>
Use this function to indicate archiving specific content.

###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const contentType = 'Blog Comment';
const identifier = 'how-to-install-xenon-view'; // optional

//Customer archived their comment on a blog post 
Xenon.contentArchived(contentType, identifier);
// -OR- 
Xenon.contentArchived(contentType);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const contentType = 'Blog Comment';
  const identifier = 'how-to-install-xenon-view'; // optional
  
  //Customer archived their comment on a blog post 
  Xenon.contentArchived(contentType, identifier);
  // -OR- 
  Xenon.contentArchived(contentType);
```
###### HTML example:
```html
<script>
  const contentType = 'Blog Post'
  function contentArchived() {
    Xenon.contentArchived(contentType)
    Xenon.commit()
  }
</script>

<button onclick="contentArchived()">Archive Post</button>
```

<br/>

##### ```contentRequested()``` <a id='content-requested'></a>
Use this function to indicate the request for specific content.
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const contentType = 'Info Product';
const identifier = 'how-to-efficiently-use-google-ads'; // optional

//Customer requested some content
Xenon.contentRequested(contentType, identifier);
// -OR- 
Xenon.contentRequested(contentType);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const contentType = 'Info Product';
  const identifier = 'how-to-efficiently-use-google-ads'; // optional
  
  //Customer requested some content
  Xenon.contentRequested(contentType, identifier);
  // -OR- 
  Xenon.contentRequested(contentType);
```
###### HTML example:
```html
<script>
  const contentType = 'Blog Post'
  function contentRequestedOccurred() {
    Xenon.contentRequested(contentType)
    Xenon.commit()
  }
</script>

<button onclick="contentRequestedOccurred()">Content Requested</button>
```

<br/>

##### ```contentSearched()``` <a id='content-searched'></a>
Use this function to indicate when a user searches.
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const contentType = 'Info Product';

// Customer searched for some content
Xenon.contentSearched(contentType);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const contentType = 'Info Product';
  
  // Customer searched for some content
  Xenon.contentSearched(contentType);
```
###### HTML example:
```html
<script>
  const contentType = 'Blog Post'
  function contentSearchedOccurred() {
    Xenon.contentSearched(contentType)
    Xenon.commit()
  }
</script>

<button onclick="contentSearchedOccurred()">Search</button>
```

<br/>

[back to top](#contents)

### Commit Points   <a id='commiting'></a>


Business Outcomes and Customer Journey Milestones are tracked locally in memory until you commit them to the Xenon View system.
After you have created (by either calling a milestone or outcome) a customer journey, you can commit it to Xenon View for analysis as follows:

<br/>

#### `commit()`
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

// you can commit a journey to Xenon View
await Xenon.commit();
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  // you can commit a journey to Xenon View
  await Xenon.commit();
```
###### HTML example:
```html
<script>
  const contentType = 'Blog Post'
  function contentSearchedOccurred() {
    Xenon.contentSearched(contentType)
    Xenon.commit()
  }
</script>

<button onclick="contentSearchedOccurred()">Search</button>
```
This call commits a customer journey to Xenon View for analysis.



<br/>

[back to top](#contents)

### Heartbeats   <a id='heartbeat'></a>


Business Outcomes and Customer Journey Milestones are tracked locally in memory until you commit them to the Xenon View system.
You can use the heartbeat call if you want to commit in batch.
Additionally, the heartbeat call will update a last-seen metric for customer journeys that have yet to arrive at Business Outcome. The last-seen metric is useful when analyzing stalled Customer Journeys.

Usage is as follows:

<br/>

#### `heartbeat()`
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

// you can heartbeat to Xenon View
await Xenon.heartbeat();
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  // you can heartbeat to Xenon View
  await Xenon.heartbeat();
```
###### HTML example:
```html
<script>
  const contentType = 'Blog Post'
  function contentSearchedOccurred() {
    Xenon.contentSearched(contentType)
    Xenon.heartbeat()
  }
</script>

<button onclick="contentSearchedOccurred()">Search</button>
```

This call commits any uncommitted journeys to Xenon View for analysis and updates the last accessed time.


<br/>

[back to top](#contents)

### Platforming  <a id='platforming'></a>

After you have initialized Xenon View, you can optionally specify platform details such as:

- Operating System Name
- Operating System version
- Device model (Pixel, Docker Container, Linux VM, Dell Server, etc.)
- A software version of your application.

<br/>

#### `platform()`
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const softwareVersion = '5.1.5';
const deviceModel = 'Pixel 4 XL';
const operatingSystemVersion = '12.0';
const operatingSystemName = 'Android';

// you can add platform details to outcomes
Xenon.platform(softwareVersion, deviceModel, operatingSystemName, operatingSystemVersion);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const softwareVersion = '5.1.5';
  const deviceModel = 'Pixel 4 XL';
  const operatingSystemVersion = '12.0';
  const operatingSystemName = 'Android';
  
  // you can add platform details to outcomes
  Xenon.platform(softwareVersion, deviceModel, operatingSystemName, operatingSystemVersion);
```
This adds platform details for each outcome ([Saas](#saas)/[Ecom](#ecom)). Typically, this would be set once at initialization:
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

Xenon.init('<API KEY>');

const softwareVersion = '5.1.5';
const deviceModel = 'Pixel 4 XL';
const operatingSystemVersion = '12.0';
const operatingSystemName = 'Android';
Xenon.platform(softwareVersion, deviceModel, operatingSystemName, operatingSystemVersion);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');
  
  const softwareVersion = '5.1.5';
  const deviceModel = 'Pixel 4 XL';
  const operatingSystemVersion = '12.0';
  const operatingSystemName = 'Android';
  Xenon.platform(softwareVersion, deviceModel, operatingSystemName, operatingSystemVersion);
```
###### HTML example:
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <script src="https://cdn.jsdelivr.net/gh/xenonview-com/view-js-sdk@v0.1.8/dist/xenon_view_sdk.min.js"></script>
  <script>
    Xenon.init('<API KEY>')
    const softwareVersion = '5.1.5'
    const deviceModel = 'Chrome'
    const operatingSystemVersion = '12.0'
    const operatingSystemName = 'Linux'
    Xenon.platform(softwareVersion, deviceModel, operatingSystemName, operatingSystemVersion)
  </script>
  <title>Sample</title>
</head>
```

<br/>

[back to top](#contents)

### Experiments  <a id="experiments"></a>

After you have initialized Xenon View, you can optionally name variants of customer journeys.
Named variants facilitate running experiments such as A/B or split testing.


> :memo: Note: You are not limited to just 2 (A or B); there can be many. Additionally, you can have multiple variant names.

<br/>

#### `variant()`
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

const variant = 'subscription-variant-A';

// you can name variants for to outcomes
Xenon.variant([variant]);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  const variant = 'subscription-variant-A';
  
  // you can name variants for to outcomes
  Xenon.variant([variant]);
```
###### HTML example:
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <script src="https://cdn.jsdelivr.net/gh/xenonview-com/view-js-sdk@v0.1.8/dist/xenon_view_sdk.min.js"></script>
  <script>
    Xenon.init('<API KEY>')
    Xenon.variant(['subscription-variant-A'])
  </script>
  <title>Sample</title>
</head>
```
This adds variant names to each outcome while the variant in play ([Saas](#saas)/[Ecom](#ecom)).
Typically, you would name a variant once you know the active experiment for this Customer:
```javascript
import Xenon from 'xenon-view-sdk';

Xenon.init('<API KEY>');
let experimentName = getExperiment();
Xenon.variant([experimentName]);
```

<br/>

#### `resetVariants()`
```javascript
import Xenon from 'xenon-view-sdk';

// you can clear all variant names with the resetVariants method
Xenon.resetVariants();
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  // you can clear all variant names with the resetVariants method
  Xenon.resetVariants();
```

<br/>

[back to top](#contents)

### Customer Journey Grouping <a id='deanonymizing-journeys'></a>


Xenon View supports both anonymous and grouped (known) journeys.

All the customer journeys (milestones and outcomes) are anonymous by default.
For example, if a Customer interacts with your brand in the following way:
1. Starts on your marketing website.
2. Downloads and uses an app.
3. Uses a feature requiring an API call.

*Each of those journeys will be unconnected and not grouped.*

To associate those journeys with each other, you can use `deanonymize()`. Deanonymizing will allow for a deeper analysis of a particular user.

Deanonymizing is optional. Basic matching of the customer journey with outcomes is valuable by itself. Deanonymizing will add increased insight as it connects Customer Journeys across devices.

Usage is as follows:

<br/>

#### `deanonymize()`
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

// you can deanonymize before or after you have committed the journey (in this case, after):
let person = {
  name:'JS Test', 
  email:'jstest@example.com'}
;
await Xenon.deanonymize(person);

// you can also deanonymize with a user ID:
let person = {
  UUID: '<some unique ID>'
}
await Xenon.deanonymize(person);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  // you can deanonymize before or after you have committed the journey (in this case, after):
  let person = {
    name:'JS Test', 
    email:'jstest@example.com'}
  ;
  await Xenon.deanonymize(person);
  
  // you can also deanonymize with a user ID:
  let person = {
    UUID: '<some unique ID>'
  }
  await Xenon.deanonymize(person);
```
###### HTML example:
```html
<script>
  let person = {
    name:'JS Test',
    email:'jstest@example.com'}
  function personDetailsAvailable() {
    Xenon.deanonymize(person)
  }
</script>

<button onclick="personDetailsAvailable()">Submit User Details</button>
```
This call deanonymizes every journey committed to a particular user.

> **:memo: Note:** With journeys that span multiple platforms (e.g., Website->Android->API backend), you can group the Customer Journeys by deanonymizing each.


<br/>

[back to top](#contents)

### Other Operations <a id='other'></a>

There are various other operations that you might find helpful:

<br/>
<br/>

#### Error handling <a id='errors'></a>
In the event of an API error when committing, the method returns a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

> **:memo: Note:** The default handling of this situation will restore the journey (appending newly added pageViews, events, etc.) for future committing. If you want to do something special, you can do so like this:

###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

// you can handle errors if necessary
Xenon.commit().catch(
(err) =>{
  // handle error
});
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  // you can handle errors if necessary
  Xenon.commit().catch(
  (err) =>{
    // handle error
  });
```

<br/>

#### Custom Milestones <a id='custom'></a>

You can add custom milestones if you need more than the current Customer Journey Milestones.

<br/>

##### `milestone()`
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';

// you can add a custom milestone to the customer journey
let category = 'Function';
let operation = 'Called';
let name = 'Query Database';
let detail = 'User Lookup';
Xenon.milestone(category, operation, name, detail);
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');

  // you can add a custom milestone to the customer journey
  let category = 'Function';
  let operation = 'Called';
  let name = 'Query Database';
  let detail = 'User Lookup';
  Xenon.milestone(category, operation, name, detail);
```
###### HTML example:
```html
<script>
  let category = 'Function'
  let operation = 'Called'
  let name = 'Query Database'
  let detail = 'User Lookup'
  function customMilestoneOccurred() {
    Xenon.milestone(category, operation, name, detail)
    Xenon.commit()
  }
</script>

<button onclick="customMilestoneOccurred()">Custom Milestone</button>
```
This call adds a custom milestone to the customer journey.

<br/>

#### Journey IDs <a id='cuuid'></a>
Each Customer Journey has an ID akin to a session.
After committing an Outcome, the ID remains the same to link all the Journeys.
If you have a previous Customer Journey in progress and would like to append to that, you can get/set the ID.

>**:memo: Note:** For JavaScript, the Journey ID is a persistent session variable.
> Therefore, subsequent Outcomes will reuse the Journey ID if the Customer had a previous browser session.


After you have initialized the Xenon singleton, you can:
1. Use the default UUID
2. Set the Customer Journey (Session) ID
3. Regenerate a new UUID
4. Retrieve the Customer Journey (Session) ID

<br/>

##### `id()`
###### Framework example:
```javascript
import Xenon from 'xenon-view-sdk';
// by default has Journey ID
expect(Xenon.id()).not.toBeNull();
expect(Xenon.id()).not.toEqual('');

// you can also set the id
let testId = '<some random uuid>';
Xenon.id(testId);
expect(Xenon.id()).toEqual(testId);

// Lastly, you can generate a new Journey ID (useful for serialized async operations that are for different customers)
Xenon.newId();
expect(Xenon.id()).not.toBeNull();
expect(Xenon.id()).not.toEqual('');
```
###### Nextjs example:
```javascript
import {useXenon} from "xenon-view-sdk/useXenon";

export default function Home() {
  const Xenon = useXenon('<API KEY>');
  // by default has Journey ID
  expect(Xenon.id()).not.toBeNull();
  expect(Xenon.id()).not.toEqual('');
  
  // you can also set the id
  let testId = '<some random uuid>';
  Xenon.id(testId);
  expect(Xenon.id()).toEqual(testId);
  
  // Lastly, you can generate a new Journey ID (useful for serialized async operations that are for different customers)
  Xenon.newId();
  expect(Xenon.id()).not.toBeNull();
  expect(Xenon.id()).not.toEqual('');
```


<br/>

[back to top](#contents)

## License  <a name='license'></a>

Apache Version 2.0

See [LICENSE](https://github.com/xenonview-com/view-js-sdk/blob/main/LICENSE)

[back to top](#contents)

