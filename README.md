# xenon-view-sdk
The Xenon View JavaScript SDK is the JavaScript SDK to interact with [XenonView](https://xenonview.com).

**Table of contents:**

* [What's New](#whats-new)
* [Installation](#installation)
* [How to use](#how-to-use)
* [License](#license)

## <a name="whats-new"></a>
## What's New
* v0.0.23 - Fix types for platform methods.
* v0.0.22 - Add types for platform methods.
* v0.0.21 - Add new platform method.
* v0.0.20 - Count duplicate steps instead of dropping them
* v0.0.19 - Correct import issue
* v0.0.18 - Correct release issue
* v0.0.17 - Rename View -> Xenon
* v0.0.16 - Event adding follows standard
* v0.0.15 - plumb timestamp through the API call
* v0.0.14 - Timestamp on commit
* v0.0.13 - Timestamps on every addition
* v0.0.12 - Add typescript definitions
* v0.0.11 - Can get and set a Journey ID
* v0.0.10 - Fully operational Outcome and Funnel methods
* v0.0.7 - Fully operational deanonymization
* v0.0.5 - Introduction of deanonymizing journeys
* v0.0.4 - Allow setting the API URL
* v0.0.3 - Basic Functionality

## <a name="installation"></a>
## Installation

You can install the Xenon View SDK from [npm](https://www.npmjs.com/package/xenon-view-sdk):

Via npm:
```bash
npm install xenon-view-sdk
```

Via yarn:
```bash
yarn add xenon-view-sdk
```

## <a name="how-to-use"></a>
## How to use

The Xenon View SDK can be used in your application to provide a whole new level of user analysis and insights. You'll need to embed the instrumentation into your application via this SDK. The basic operation is to create a customer journey by adding steps in the journey like page views, funnel steps and other events. The journey concludes with an outcome. All of this can be committed for analysis on your behalf to Xenon View. From there you can see popular journeys that result in both successful an unsuccessful outcomes. Additionally, you can deanonymize journeys. This will allow for a deeper analysis of a particular user. This is an optional step as just tracking which journey results in what outcome is valuable.   

### Instantiation
The View SDK is a JS module you'll need to include in your application. After inclusion, you'll need to init the singleton object:

```javascript
import Xenon from 'xenon_view_sdk';

// start by initializing Xenon View
Xenon.init('<API KEY>');
```
Of course, you'll have to make the following modifications to the above code:
- Replace `<API KEY>` with your [api key](https://xenonview.com/api-get)

### Platforming
After you have initialized View, you can optionally specify platform details such as:
- Operating System version
- Device model (Pixel, Docker Container, Linux VM, Dell Server, etc.)
- Software version of your application.

```javascript
import Xenon from 'xenon_view_sdk';

const softwareVersion = "5.1.5";
const deviceModel = "Pixel 4 XL";
const operatingSystemVersion = "Android 12.0";

// you can add platform details to outcomes
Xenon.platform(softwareVersion, deviceModel, operatingSystemVersion);
```
This adds platform details for each [outcome](#outcome). Typically, this would be set once at initialization:
```javascript
import Xenon from 'xenon_view_sdk';

Xenon.init('<API KEY>');
const softwareVersion = "5.1.5";
const deviceModel = "Pixel 4 XL";
const operatingSystemVersion = "Android 12.0";
Xenon.platform(softwareVersion, deviceModel, operatingSystemVersion);
```


### Add Journeys
After you have initialized the View singleton, you can start collecting journeys.

There are a few helper methods you can use:
#### <a name="outcome"></a>
#### Outcome
You can use this method to add an outcome to the journey.

```javascript
import Xenon from 'xenon_view_sdk';

// you can add an outcome to journey
let outcome = "<outcome>";
let action = "<custom action>";
Xenon.outcome(outcome, action);
```
This adds an outcome to the journey chain effectively completing it.


#### Page view
You can use this method to add page views to the journey.

```javascript
import Xenon from 'xenon_view_sdk';

// you can add a page view to a journey
let page = "test/page";
it('then adds a page view to journey', () => {
  Xenon.pageView(page);
});
```
This adds a page view step to the journey chain.


#### Funnel Stage
You can use this method to track funnel stages in the journey.

```javascript
import Xenon from 'xenon_view_sdk';

// you can add a funnel stage to a journey
let stage = "<stage in funnel>";
let action = "<custom action>";
Xenon.funnel(stage, action);
```
This adds a funnel stage to the journey chain.


#### Generic events
You can use this method to add generic events to the journey.

```javascript
import Xenon from 'xenon_view_sdk';

// you can add a generic event to journey
let event = {category: 'Event', action: 'test'};
Xenon.event(event);
```
This adds an event step to the journey chain.

### Committing Journeys

Journeys only exist locally until you commit them to the Xenon View system. After you have created and added to a journey, you can commit the journey to Xenon View for analysis as follows:
```javascript
import Xenon from 'xenon_view_sdk';

// you can commit a journey to Xenon View
await Xenon.commit();
```
This commits a journey to Xenon View for analysis.

### Deanonymizing Journeys

Xenon View supports both anonymous and known journeys. By deanonymizing a journey you can compare a user's path to other known paths and gather insights into their progress. This is optional.
```javascript
import Xenon from 'xenon_view_sdk';

// you can deanonymize before or after you have committed journey (in this case after):
let person = {name:'JS Test', email:'jstest@example.com'};
await Xenon.deanonymize();
```
This deanonymizes every journey committed to a particular user.


### Journey IDs
Each Journey has an ID akin to a session. After an Outcome occurs the ID remains the same to link all the Journeys. If you have a previous Journey in progress and would like to append to that, you can set the ID.

*Note: For JavaScript, the Journey is a session persistent variable. If a previous browser session was created, the Journey ID will be reused.* 

After you have initialized the View singleton, you can view or set the Journey (Session) ID:
```javascript
import Xenon from 'xenon_view_sdk';
// by default has Journey id
expect(Xenon.id()).not.toBeNull();
expect(Xenon.id()).not.toEqual('');

// you can also set the id
let testId = '<some random uuid>';
Xenon.id(testId);
expect(Xenon.id()).toEqual(testId);
```


### Error handling
In the event of an API error when committing, the method returns a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). 

Note: The default handling of this situation will restore the journey (appending newly added pageViews, events, etc.) for future committing. If you want to do something special, you can do so like this:

```javascript
import Xenon from 'xenon_view_sdk';

// you can handle errors if necessary
Xenon.commit().catch(
(err) =>{
  // handle error
});
```

## <a name="license"></a>
## License

Apache Version 2.0

See [LICENSE](https://github.com/xenonview-com/view-js-sdk/blob/main/LICENSE)
