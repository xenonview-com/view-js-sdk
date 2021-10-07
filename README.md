# xenon-view-sdk
The Xenon View Python SDK is the JavaScript SDK to interact with [XenonView](https://xenonview.com).

**Table of contents:**

* [Installation](#installation)
* [How to use](#how-to-use)
* [License](#license)

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

### Instantiation
The View SDK is a JS module you'll need to include in your application. After inclusion, you'll need to init the singleton object:

```javascript
    import View from 'xenon_view_sdk';

    it('then creates Xenon View', () => {
      View.init('<API KEY>');
    });
```
Of course, you'll have to make the following modifications to the above code:
- Replace `<API KEY>` with your [api key](https://xenonview.com/api-get)

### Add Journeys
After you have initialized the View singleton, you can start collecting journeys.

There are a few helper methods you can use:

#### Page view
You can use this method to add page views to the journey.

```javascript
    import View from 'xenon_view_sdk';

    let page = "test page";
    it('then adds a page view to journey', () => {
      View.pageView(page);
    });
```

#### Generic events
You can use this method to add generic events to the journey.

```javascript
    import View from 'xenon_view_sdk';

    let event = {category: 'Event', action: 'test'};
    it('then adds a generic event to journey', () => {
      View.event(event);
    });
```

### Committing Journeys

After you have created and added to a journey, you can commit the journey to Xenon View for analysis as follows:

```javascript
    import View from 'xenon_view_sdk';

    it('then commits journey to Xenon View', () => {
      View.commit();
    });
```

### Error handling
In the event of an API error when committing, the method returns a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). 

Note: The default handling of this situation will restore the journey (appending newly added pageViews, events, etc.) for future committing. If you want to do something special, you can do so like this:

```javascript
    import View from 'xenon_view_sdk';

    it('then commits journey to Xenon View and handles errors', () => {
      View.commit().catch(
        (err) =>{
          // handle error
        }
      );
    });
```

## <a name="license"></a>
## License

Apache Version 2.0

See [LICENSE](https://github.com/xenonview-com/view-js-sdk/blob/main/LICENSE)
