# Tracking an Affiliate with a Custom Xenon URL

Use a custom Xenon URL when you want visits, leads, and later customer-journey activity to be associated with a specific affiliate. Each affiliate receives a unique URL containing two query parameters:

- `xenonSrc` identifies the channel, such as `affiliate`.
- `xenonId` uniquely identifies the affiliate, such as `acme-media`.

## Create the affiliate URL

Start with the page where the affiliate should send visitors, then append the Xenon parameters:

```text
https://www.example.com/offer?xenonSrc=affiliate&xenonId=acme-media
```

Give each affiliate a stable, unique `xenonId`:

```text
https://www.example.com/offer?xenonSrc=affiliate&xenonId=acme-media
https://www.example.com/offer?xenonSrc=affiliate&xenonId=northstar-partners
https://www.example.com/offer?xenonSrc=affiliate&xenonId=creator-1042
```

Use short URL-safe identifiers and keep an internal record mapping each identifier to the affiliate. Do not put email addresses, names, or other personal information in the URL. If values are generated dynamically, encode them with `encodeURIComponent`.

If the landing page already has query parameters, add Xenon's parameters with `&` instead of a second `?`:

```text
https://www.example.com/offer?plan=pro&xenonSrc=affiliate&xenonId=acme-media
```

## Detect the affiliate on the landing page

After initializing Xenon, pass the page's query string to `autodiscoverLeadFrom`. Run this automatically and early on the landing page—not in response to a button click.

```javascript
import Xenon from 'xenon-view-sdk';

async function initializeXenon() {
  await Xenon.init('<YOUR XENON API KEY>');

  const filteredQuery = await Xenon.autodiscoverLeadFrom(
    window.location.search
  );

  // Remove Xenon's tracking parameters from the visible URL after capture.
  window.history.replaceState(
    {},
    document.title,
    window.location.pathname + filteredQuery + window.location.hash
  );
}

initializeXenon();
```

Continue using `Xenon.commit()` or `Xenon.heartbeat()` as your site normally does. The call above records the lead source as `affiliate` and the lead campaign as the affiliate's unique ID. Xenon also adds both values as journey variants so later activity in the session can be associated with that affiliate.

## Verify the setup

1. Open the affiliate URL in a new browser tab or private window.
2. Confirm that the page loads normally and the `xenonSrc` and `xenonId` parameters disappear from the address bar.
3. In Xenon, confirm that an Attribution outcome was recorded with `leadSource: affiliate` and `leadCampaign: acme-media`.
4. Repeat with a second affiliate URL and confirm that its distinct `xenonId` is reported.

Xenon keeps the first attribution detected in a browser tab's session. Test each affiliate URL in a fresh tab or private window, and initialize detection before other code can record the visit as unattributed.
