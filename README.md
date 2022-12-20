# xenon-view-sdk
The Xenon View JavaScript SDK is the JavaScript SDK to interact with [XenonView](https://xenonview.com).

**Table of contents:** <a id='contents'></a>

* [What's New](#whats-new)
* [Introduction](#intro)
* [Steps To Get Started](#getting-started)
  * [Identify Business Outcomes](#step-1)
  * [Identify Customer Journey Milestones](#step-2)
  * [Installation](#step-3)
  * [Instrument Business Outcomes](#step-4)
  * [Instrument Customer Journey Milestones](#step-5)
  * [Determine Commit Points](#step-6)
  * [(Optional) Group Customer Journeys](#step-7)
  * [Analysis](#step-8)
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
  * [Tagging](#tagging)
  * [Customer Journey Grouping](#deanonymizing-journeys)
  * [Other Considerations](#other)
    * [(Optional) Error Handling](#errors)
    * [(Optional) Custom Customer Journey Milestones](#custom)
    * [(Optional) Journey Identification](#cuuid)
* [License](#license)

## What's New <a id='whats-new'></a>
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

### Step 3 - Installation <a id='step-3'></a>

After you have done the prework of [Step 1](#step-1) and [Step 2](#step-2), you are ready to [install Xenon View](#installation).
Once installed, you'll need to [initialize the SDK](#instantiation) and get started instrumenting.


<br/>
<br/>


### Step 4 - Instrument Business Outcomes <a id='step-4'></a>

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
| Subscription Renewed | [`subscriptionRenewed()`](#saas-renewed-subscription) | [`subscriptionCanceled()`](#saas-renewed-subscription-fail) | 
| Subscription Upsell | [`subscriptionUpsold()`](#saas-upsell-subscription) | [`subscriptionUpsellDeclined()`](#saas-upsell-subscription-fail) | 
| Referral | [`referral()`](#saas-referral) | [`referralDeclined()`](#saas-referral-fail) | 


**[Ecom Related Outcome Calls](#ecom)** (click on a call to see usage)

| Category | Success | Failure |
| --- | --- | --- | 
| Lead Capture | [`leadCaptured()`](#ecom-lead-capture) | [`leadCaptureDeclined()`](#ecom-lead-capture-fail) | 
| Account Signup | [`accountSignup()`](#ecom-account-signup) | [`accountSignupDeclined()`](#ecom-account-signup-fail) | 
| Add To Cart | [`productAddedToCart()`](#ecom-product-to-cart) | [`productNotAddedToCart()`](#ecom-product-to-cart-fail) |
| Product Upsell | [`upsold()`](#ecom-upsell) | [`upsellDismissed()`](#ecom-upsell-fail) | 
| Checkout | [`checkedOut()`](#ecom-checkout) | [`checkoutCanceled()`](#ecom-checkout-fail)/[`productRemoved()`](#ecom-checkout-remove) | 
| Purchase | [`purchased()`](#ecom-purchase) | [`purchaseCanceled()`](#ecom-purchase-fail) | 
| Promise Fulfillment | [`promiseFulfilled()`](#ecom-promise-fulfillment) | [`promiseUnfulfilled()`](#ecom-promise-fulfillment-fail) | 
| Product Disposition | [`productKept()`](#ecom-product-outcome) | [`productReturned()`](#ecom-product-outcome-fail) |
| Referral | [`referral()`](#ecom-referral) | [`referralDeclined()`](#ecom-referral-fail) |

<br/>

### Step 5 - Instrument Customer Journey Milestones <a id='step-5'></a>

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
| [`featureFailed()`](#feature-failed) | [`contentEdited()`](#content-edited) |
| [`featureCompleted()`](#feature-complete) | [`contentCreated()`](#content-created) |
| | [`contentDeleted()`](#content-deleted) |
| | [`contentRequested()`](#content-requested)|
| | [`contentSearched()`](#content-searched)|

<br/>

### Step 6 - Commit Points <a id='step-6'></a>


Once instrumented, you'll want to select appropriate [commit points](#commit). Committing will initiate the analysis on your behalf by Xenon View.

<br/>
<br/>

### Step 7 (Optional) - Group Customer Journeys <a id='step-7'></a>

All the customer journeys (milestones and outcomes) are anonymous by default.
For example, if a Customer interacts with your brand in the following way:
1. Starts on your marketing website.
2. Downloads and uses an app.
3. Uses a feature requiring an API call.


*Each of those journeys will be unconnected and not grouped.*

To associate those journeys with each other, you can [deanonymize](#deanonymizing-journeys) the Customer. Deanonymizing will allow for a deeper analysis of a particular user.

Deanonymizing is optional. Basic matching of the customer journey with outcomes is valuable by itself. Deanonymizing will add increased insight as it connects Customer Journeys across devices.

<br/>

### Step 8 - Analysis <a id='step-8'></a>


Once you have released your instrumented code, you can head to [XenonView](https://xenonview.com/) to view the analytics.

<br/>
<br/>
<br/>

[back to top](#contents)

## Detailed Usage <a id='detailed-usage'></a>
The following section gives detailed usage instructions and descriptions.
It provides code examples for each of the calls.

<br/>

### Installation <a id='installation'></a>

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

### Instantiation <a id='instantiation'></a>

The View SDK is a JS module you'll need to include in your application. After inclusion, you'll need to init the singleton object:

```javascript
import Xenon from 'xenon_view_sdk';

// start by initializing Xenon View
Xenon.init('<API KEY>');
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
```javascript
import Xenon from 'xenon_view_sdk';

const emailSpecified = 'Email';
const phoneSpecified = 'Phone Number';

// Successful Lead Capture of an email
Xenon.leadCaptured(emailSpecified);
//...
// Successful Lead Capture of a phone number
Xenon.leadCaptured(phoneSpecified);
```
<br/>

##### ```leadCaptureDeclined()``` <a id='saas-lead-capture-fail'></a>
> :memo: Note: You want to be consistent between success and failure and match the specifiers
```javascript
import Xenon from 'xenon_view_sdk';

const emailSpecified = 'Email';
const phoneSpecified = 'Phone Number'; 

// Unsuccessful Lead Capture of an email
Xenon.leadCaptureDeclined(emailSpecified);
// ...
// Unsuccessful Lead Capture of a phone number
Xenon.leadCaptureDeclined(phoneSpecified);
```

<br/>

#### Account Signup  <a id='saas-account-signup'></a>
Use this call to track when customers signup for an account.
You can add a specifier string to the call to differentiate as follows:

<br/>

##### ```accountSignup()```
```javascript
import Xenon from 'xenon_view_sdk';

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

<br/>

##### ```accountSignupDeclined()``` <a id='saas-account-signup-fail'></a>
> :memo: Note: You want to be consistent between success and failure and match the specifiers
```javascript
import Xenon from 'xenon_view_sdk';

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

<br/>

#### Application Installation  <a id='saas-application-install'></a>
Use this call to track when customers install your application.

<br/>

##### ```applicationInstalled()```
```javascript
import Xenon from 'xenon_view_sdk';

// Successful Application Installation
Xenon.applicationInstalled();
```

<br/>

##### ```applicationNotInstalled()``` <a id='saas-application-install-fail'></a>
> :memo: Note: You want consistency between success and failure.
```javascript
import Xenon from 'xenon_view_sdk';

// Unsuccessful or not completed Application Installation
Xenon.applicationNotInstalled();
```

<br/>

#### Initial Subscription  <a id='saas-initial-subscription'></a>
Use this call to track when customers initially subscribe.
You can add a specifier string to the call to differentiate as follows:

<br/>

##### ```initialSubscription()```
```javascript
import Xenon from 'xenon_view_sdk';

const tierSilver = 'Silver Monthly';
const tierGold = 'Gold';
const tierPlatium = 'Platium';
const annualSilver = 'Silver Annual';
const method = 'Stripe'; // optional

// Successful subscription of the lowest tier with Stripe
Xenon.initialSubscription(tierSilver, method);
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

<br/>

##### ```subscriptionDeclined()``` <a id='saas-initial-subscription-fail'></a>
> :memo: Note: You want to be consistent between success and failure and match the specifiers
```javascript
import Xenon from 'xenon_view_sdk';

const tierSilver = 'Silver Monthly';
const tierGold = 'Gold';
const tierPlatium = 'Platium';
const annualSilver = 'Silver Annual';
const method = 'Stripe'; // optional

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
```

<br/>

#### Subscription Renewal  <a id='saas-renewed-subscription'></a>
Use this call to track when customers renew.
You can add a specifier string to the call to differentiate as follows:

<br/>

##### ```subscriptionRenewed()```
```javascript
import Xenon from 'xenon_view_sdk';

const tierSilver = 'Silver Monthly';
const tierGold = 'Gold';
const tierPlatium = 'Platium';
const annualSilver = 'Silver Annual';
const method = 'Stripe'; //optional

// Successful renewal of the lowest tier with Stripe
Xenon.subscriptionRenewed(tierSilver, method);
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

<br/>

##### ```subscriptionCanceled()``` <a id='saas-renewed-subscription-fail'></a>
> :memo: Note: You want to be consistent between success and failure and match the specifiers
```javascript
import Xenon from 'xenon_view_sdk';

const tierSilver = 'Silver Monthly';
const tierGold = 'Gold';
const tierPlatium = 'Platium';
const annualSilver = 'Silver Annual';
const method = 'Stripe'; //optional

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
```

<br/>

#### Subscription Upsold  <a id='saas-upsell-subscription'></a>
Use this call to track when a Customer upgrades their subscription.  
You can add a specifier string to the call to differentiate as follows:

<br/>

##### ```subscriptionUpsold()```
```javascript
import Xenon from 'xenon_view_sdk';

const tierGold = 'Gold Monthly';
const tierPlatium = 'Platium';
const annualGold = 'Gold Annual';
const method = 'Stripe'; // optional

// Assume already subscribed to Silver

// Successful upsell of the middle tier with Stripe
Xenon.subscriptionUpsold(tierGold, method);
// ...
// Successful upsell of the top tier
Xenon.subscriptionUpsold(tierPlatium);
// ...
// Successful upsell of middle tier - annual period
Xenon.subscriptionUpsold(annualGold);
```

<br/>

##### ```subscriptionUpsellDeclined()``` <a id='saas-upsell-subscription-fail'></a>
> :memo: Note: You want to be consistent between success and failure and match the specifiers
```javascript
import Xenon from 'xenon_view_sdk';

const tierGold = 'Gold Monthly';
const tierPlatium = 'Platium';
const annualGold = 'Gold Annual';
const method = 'Stripe'; //optional

// Assume already subscribed to Silver

// Rejected upsell of the middle tier
Xenon.subscriptionUpsellDeclined(tierGold);
// ...
// Rejected upsell of the top tier
Xenon.subscriptionUpsellDeclined(tierPlatium);
// ...
// Rejected upsell of middle tier - annual period with Stripe
Xenon.subscriptionUpsellDeclined(annualGold, method);
```

<br/>

#### Referrals  <a id='saas-referral'></a>
Use this call to track when customers refer someone to your offering.
You can add a specifier string to the call to differentiate as follows:

<br/>

##### ```referral()```
```javascript
import Xenon from 'xenon_view_sdk';

const kind = 'Share';
const detail = 'Review'; // optional

// Successful referral by sharing a review
Xenon.referral(kind, detail);
// -OR-
Xenon.referral(kind);
```

<br/>

##### ```referralDeclined()``` <a id='saas-referral-fail'></a>
> :memo: Note: You want to be consistent between success and failure and match the specifiers
```javascript
import Xenon from 'xenon_view_sdk';

const kind = 'Share';
const detail = 'Review'; // optional

//Customer declined referral 
Xenon.referralDeclined(kind, detail);
// -OR-
Xenon.referralDeclined(kind);
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
```javascript
import Xenon from 'xenon_view_sdk';

const emailSpecified = 'Email';
const phoneSpecified = 'Phone Number';

// Successful Lead Capture of an email
Xenon.leadCaptured(emailSpecified);
// ...
// Successful Lead Capture of a phone number
Xenon.leadCaptured(phoneSpecified);
```

<br/>

##### ```leadCaptureDeclined()``` <a id='ecom-lead-capture-fail'></a>
> :memo: Note: You want to be consistent between success and failure and match the specifiers
```javascript
import Xenon from 'xenon_view_sdk';

const emailSpecified = 'Email';
const phoneSpecified = 'Phone Number'; 

// Unsuccessful Lead Capture of an email
Xenon.leadCaptureDeclined(emailSpecified);
// ...
// Unsuccessful Lead Capture of a phone number
Xenon.leadCaptureDeclined(phoneSpecified);
```

<br/>

#### Account Signup  <a id='ecom-account-signup'></a>
Use this call to track when customers signup for an account.
You can add a specifier string to the call to differentiate as follows:

<br/>

##### ```accountSignup()```
```javascript
import Xenon from 'xenon_view_sdk';

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

<br/>

##### ```accountSignupDeclined()``` <a id='ecom-account-signup-fail'></a>
> :memo: Note: You want to be consistent between success and failure and match the specifiers
```javascript
import Xenon from 'xenon_view_sdk';

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

<br/>

#### Add Product To Cart  <a id='ecom-product-to-cart'></a>
Use this call to track when customers add a product to the cart.
You can add a specifier string to the call to differentiate as follows:

<br/>

##### ```productAddedToCart()```
```javascript
import Xenon from 'xenon_view_sdk';

const laptop = 'Dell XPS';
const keyboard = 'Apple Magic Keyboard';

// Successful adds a laptop to the cart
Xenon.productAddedToCart(laptop);
// ...
// Successful adds a keyboard to the cart
Xenon.productAddedToCart(keyboard);
```

<br/>

##### ```productNotAddedToCart()``` <a id='ecom-product-to-cart-fail'></a>
> :memo: Note: You want to be consistent between success and failure and match the specifiers
```javascript
import Xenon from 'xenon_view_sdk';

const laptop = 'Dell XPS';
const keyboard = 'Apple Magic Keyboard';

// Doesn't add a laptop to the cart
Xenon.productNotAddedToCart(laptop);
// ...
// Doesn't add a keyboard to the cart
Xenon.productNotAddedToCart(keyboard);
```

<br/>

#### Upsold Additional Products  <a id='ecom-upsell'></a>
Use this call to track when you upsell additional product(s) to customers.
You can add a specifier string to the call to differentiate as follows:

<br/>

##### ```upsold()```
```javascript
import Xenon from 'xenon_view_sdk';

const laptop = 'Dell XPS';
const keyboard = 'Apple Magic Keyboard';

// upsold a laptop
Xenon.upsold(laptop);
// ...
// upsold a keyboard
Xenon.upsold(keyboard);
```

<br/>

##### ```upsellDismissed()``` <a id='ecom-upsell-fail'></a>
> :memo: Note: You want to be consistent between success and failure and match the specifiers
```javascript
import Xenon from 'xenon_view_sdk';

const laptop = 'Dell XPS';
const keyboard = 'Apple Magic Keyboard';

// Doesn't add a laptop during upsell
Xenon.upsellDismissed(laptop);
// ...
// Doesn't add a keyboard during upsell
Xenon.upsellDismissed(keyboard);
```

<br/>

#### Customer Checks Out  <a id='ecom-checkout'></a>
Use this call to track when your Customer is checking out.

<br/>

##### ```checkedOut()```
```javascript
import Xenon from 'xenon_view_sdk';

// Successful Checkout
Xenon.checkedOut();
```

<br/>

##### ```checkoutCanceled()``` <a id='ecom-checkout-fail'></a>
```javascript
import Xenon from 'xenon_view_sdk';

//Customer cancels check out.
Xenon.checkoutCanceled();

```

<br/>

##### ```productRemoved()``` <a id='ecom-checkout-remove'></a>
```javascript
import Xenon from 'xenon_view_sdk';

const laptop = 'Dell XPS';
const keyboard = 'Apple Magic Keyboard';

// Removes a laptop during checkout
Xenon.productRemoved(laptop);
// ...
// Removes a keyboard during checkout
Xenon.productRemoved(keyboard);
```

<br/>

#### Customer Completes Purchase  <a id='ecom-purchase'></a>
Use this call to track when your Customer completes a purchase.

<br/>

##### ```purchased()```
```javascript
import Xenon from 'xenon_view_sdk';

const method = 'Stripe';

// Successful Purchase
Xenon.purchased(method);
```

<br/>

##### ```purchaseCanceled()``` <a id='ecom-purchase-fail'></a>
```javascript
import Xenon from 'xenon_view_sdk';

const method = 'Stripe'; // optional

//Customer cancels the purchase.
Xenon.purchaseCanceled();
// -OR-
Xenon.purchaseCanceled(method);

```

<br/>

#### Purchase Shipping  <a id='ecom-promise-fulfillment'></a>
Use this call to track when your Customer receives a purchase.

<br/>

##### ```promiseFulfilled()```
```javascript
import Xenon from 'xenon_view_sdk';

// Successfully Delivered Purchase
Xenon.promiseFulfilled();
```

<br/>

##### ```promiseUnfulfilled(()``` <a id='ecom-promise-fulfillment-fail'></a>
```javascript
import Xenon from 'xenon_view_sdk';

// Problem Occurs During Shipping And No Delivery
Xenon.promiseUnfulfilled();
```

<br/>

#### Customer Keeps or Returns Product  <a id='ecom-product-outcome'></a>
Use this call to track if your Customer keeps the product.
You can add a specifier string to the call to differentiate as follows:

<br/>

##### ```productKept()```
```javascript
import Xenon from 'xenon_view_sdk';

const laptop = 'Dell XPS';
const keyboard = 'Apple Magic Keyboard';

//Customer keeps a laptop
Xenon.productKept(laptop);
// ...
//Customer keeps a keyboard
Xenon.productKept(keyboard);
```

<br/>

##### ```productReturned()``` <a id='ecom-product-outcome-fail'></a>
> :memo: Note: You want to be consistent between success and failure and match the specifiers
```javascript
import Xenon from 'xenon_view_sdk';

const laptop = 'Dell XPS';
const keyboard = 'Apple Magic Keyboard';

//Customer returns a laptop
Xenon.productReturned(laptop);
// ...
//Customer returns a keyboard
Xenon.productReturned(keyboard);
```

<br/>

#### Referrals  <a id='ecom-referral'></a>
Use this call to track when customers refer someone to your offering.
You can add a specifier string to the call to differentiate as follows:

<br/>

##### ```referral()```
```javascript
import Xenon from 'xenon_view_sdk';

const kind = 'Share Product';
const detail = 'Dell XPS';

// Successful referral by sharing a laptop
Xenon.referral(kind, detail);
```

<br/>

##### ```referralDeclined()``` <a id='ecom-referral-fail'></a>
> :memo: Note: You want to be consistent between success and failure and match the specifiers
```javascript
import Xenon from 'xenon_view_sdk';

const kind = 'Share Product';
const detail = 'Dell XPS';

//Customer declined referral 
Xenon.referralDeclined(kind, detail);
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
```javascript
import Xenon from 'xenon_view_sdk';

const name = 'Scale Recipe';
const detail = 'x2'; // optional

//Customer initiated using a feature 
Xenon.featureAttempted(name, detail);
// -OR-
Xenon.featureAttempted(name);
```

<br/>

##### ```featureCompleted()``` <a id='feature-complete'></a>
Use this function to indicate the successful completion of the feature.
```javascript
import Xenon from 'xenon_view_sdk';

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

<br/>

##### ```featureFailed()``` <a id='feature-failed'></a>
Use this function to indicate the unsuccessful completion of a feature being used (often in the exception handler).
```javascript
import Xenon from 'xenon_view_sdk';


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
```javascript
import Xenon from 'xenon_view_sdk';

const contentType = 'Blog Post';
const identifier = 'how-to-install-xenon-view'; // optional

// Customer view a blog post 
Xenon.contentViewed(contentType, identifier);
// -OR-
Xenon.contentViewed(contentType);
```

<br/>

##### ```contentEdited()``` <a id='content-edited'></a>
Use this function to indicate the editing of specific content.
```javascript
import Xenon from 'xenon_view_sdk';

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

<br/>

##### ```contentCreated()``` <a id='content-created'></a>
Use this function to indicate the creation of specific content.
```javascript
import Xenon from 'xenon_view_sdk';

const contentType = 'Blog Comment';
const identifier = 'how-to-install-xenon-view'; // optional

//Customer wrote a comment on a blog post
Xenon.contentCreated(contentType, identifier);
// -OR- 
Xenon.contentCreated(contentType);
```

<br/>

##### ```contentDeleted()``` <a id='content-deleted'></a>
Use this function to indicate the deletion of specific content.
```javascript
import Xenon from 'xenon_view_sdk';

const contentType = 'Blog Comment';
const identifier = 'how-to-install-xenon-view'; // optional

//Customer deleted their comment on a blog post 
Xenon.contentDeleted(contentType, identifier);
// -OR- 
Xenon.contentDeleted(contentType);
```

<br/>

##### ```contentRequested()``` <a id='content-requested'></a>
Use this function to indicate the request for specific content.
```javascript
import Xenon from 'xenon_view_sdk';

const contentType = 'Info Product';
const identifier = 'how-to-efficiently-use-google-ads'; // optional

//Customer requested some content
Xenon.contentRequested(contentType, identifier);
// -OR- 
Xenon.contentRequested(contentType);
```

<br/>

##### ```contentSearched()``` <a id='content-searched'></a>
Use this function to indicate when a user searches.
```javascript
import Xenon from 'xenon_view_sdk';

const contentType = 'Info Product';

// Customer searched for some content
Xenon.contentSearched(contentType);
```

<br/>

[back to top](#contents)

### Commit Points   <a id='commiting'></a>


Business Outcomes and Customer Journey Milestones are tracked locally in memory until you commit them to the Xenon View system.
After you have created (by either calling a milestone or outcome) a customer journey, you can commit it to Xenon View for analysis as follows:

<br/>

#### `commit()`
```javascript
import Xenon from 'xenon_view_sdk';

// you can commit a journey to Xenon View
await Xenon.commit();
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
```javascript
import Xenon from 'xenon_view_sdk';

// you can heartbeat to Xenon View
await Xenon.heartbeat();
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
```javascript
import Xenon from 'xenon_view_sdk';

const softwareVersion = '5.1.5';
const deviceModel = 'Pixel 4 XL';
const operatingSystemVersion = '12.0';
const operatingSystemName = 'Android';

// you can add platform details to outcomes
Xenon.platform(softwareVersion, deviceModel, operatingSystemName, operatingSystemVersion);
```
This adds platform details for each outcome ([Saas](#saas)/[Ecom](#ecom)). Typically, this would be set once at initialization:
```javascript
import Xenon from 'xenon_view_sdk';

Xenon.init('<API KEY>');

const softwareVersion = '5.1.5';
const deviceModel = 'Pixel 4 XL';
const operatingSystemVersion = '12.0';
const operatingSystemName = 'Android';
Xenon.platform(softwareVersion, deviceModel, operatingSystemName, operatingSystemVersion);
```
<br/>

[back to top](#contents)

### Tagging  <a id='tagging'></a>

After you have initialized Xenon View, you can optionally tag customer journeys.
Tagging helps when running experiments such as A/B testing.

> :memo: Note: You are not limited to just 2 (A or B); there can be many. Additionally, you can add multiple tags.

<br/>

#### `tag()`
```javascript
import Xenon from 'xenon_view_sdk';

const tag = 'subscription-variant-A';

// you can add tag details to outcomes
Xenon.tag([tag]);
```
This adds tags to each outcome ([Saas](#saas)/[Ecom](#ecom)).
Typically, you would Tag once you know the active experiment for this Customer:
```javascript
import Xenon from 'xenon_view_sdk';

Xenon.init('<API KEY>');
let experimentTag = getExperiment();
Xenon.tag([experimentTag]);
```
<br/>

#### `untag()`
```javascript
import Xenon from 'xenon_view_sdk';

// you can clear all tags with the untag method
Xenon.untag();
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
```javascript
import Xenon from 'xenon_view_sdk';

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

```javascript
import Xenon from 'xenon_view_sdk';

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
```javascript
import Xenon from 'xenon_view_sdk';

// you can add a custom milestone to the customer journey
let category = 'Function';
let operation = 'Called';
let name = 'Query Database';
let detail = 'User Lookup';
Xenon.milestone(category, operation, name, detail);
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
```javascript
import Xenon from 'xenon_view_sdk';
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

