/**
 * Created by lwoydziak on 09/27/21.
 */
/**
 * xenon.js
 *
 * SDK for interacting with the Xenon View service.
 *
 */
import JourneyApi from "./api/journey";
import HeartbeatApi from "./api/heartbeat";
import DeanonApi from "./api/deanonymize";
import SampleApi from "./api/sample";
import CountApi from "./api/count";
import {resetLocal, resetSession, retrieveLocal, retrieveSession, storeLocal, storeSession} from "./storage/storage";

export class _Xenon {
  constructor(apiKey = null, apiUrl = 'https://app.xenonview.com',
              countApiUrl = 'https://counts.xenonlab.ai',
              journeyApi = JourneyApi, deanonApi = DeanonApi, heartbeatApi = HeartbeatApi,
              sampleApi = SampleApi, countApi = CountApi) {
    this.JourneyApi = journeyApi;
    this.DeanonApi = deanonApi;
    this.HeartbeatApi = heartbeatApi;
    this.SampleApi = sampleApi;
    this.CountApi = countApi;
    this.pageURL_ = null;
    this.id();
    let journey = this.journey();
    if (!journey) {
      this.storeJourney([]);
    }
    this.restoreJourney = [];
    this.apiCallPending = false;
    this.apiUrl = apiUrl;
    this.countApiUrl = countApiUrl;
    if (apiKey) {
      this.init(apiKey, apiUrl);
    }
  }

  version() {
    return 'v0.1.38.10';
  }

  init(apiKey, apiUrl = 'https://app.xenonview.com', onApiKeyFailure = null) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.sampleDecision(null, onApiKeyFailure)
    this.apiCallPending = false;
  }

  ecomAbandonment() {
    storeLocal('heartbeat_type', 'ecom');
    this.heartbeatState(0);
  }

  customAbandonment(outcome) {
    storeLocal('heartbeat_type', 'custom');
    storeLocal('heartbeat_outcome', outcome);
    this.heartbeatState(0);
  }

  cancelAbandonment() {
    storeLocal('heartbeat_type', 'custom');
    storeLocal('heartbeat_outcome', {
      remove: true
    });
    this.heartbeatState(0);
  }

  platform(softwareVersion, deviceModel, operatingSystemName, operatingSystemVersion) {
    const platform = {
      softwareVersion: softwareVersion,
      deviceModel: deviceModel,
      operatingSystemName: operatingSystemName,
      operatingSystemVersion: operatingSystemVersion
    };
    storeSession('view-platform', platform);
  }

  removePlatform() {
    resetSession('view-platform');
  }

  variant(variantNames) {
    storeSession('view-tags', variantNames);
  }

  resetVariants() {
    resetSession('view-tags');
  }

  startVariant(variantName) {
    let variantNames = retrieveSession('view-tags');
    if (!variantNames || !variantNames.includes(variantName)) {
      this.resetVariants()
      this.variant([variantName])
    }
  }

  addVariant(variantName) {
    let variantNames = retrieveSession('view-tags');
    if (!variantNames || !variantNames.includes(variantName)) {
      (variantNames) ? variantNames.push(variantName) : variantNames = [variantName];
      this.variant(variantNames);
    }
  }

  // Stock Business Outcomes:
  leadAttributed(source, identifier=null) {
    const event = {
      category: 'Attribution',
      source: source
    };
    if (identifier) {
      event['campaign'] = identifier;
    }
    this.journeyAdd(event);
    this.count("Attribution");
  }

  leadUnattributed() {
    const event = {
      category: 'Attribution',
      source: 'Unattributed'
    };
    this.journeyAdd(event);
    this.count("Attribution");
  }

  leadCaptured(specifier) {
    const content = {
      superOutcome: 'Lead Capture',
      outcome: specifier,
      result: 'success'
    };
    this.outcomeAdd(content);
  }

  leadCaptureDeclined(specifier) {
    const content = {
      superOutcome: 'Lead Capture',
      outcome: specifier,
      result: 'fail'
    };
    this.outcomeAdd(content);
  }

  accountSignup(specifier) {
    const content = {
      superOutcome: 'Account Signup',
      outcome: specifier,
      result: 'success'
    };
    this.outcomeAdd(content);
  }

  accountSignupDeclined(specifier) {
    const content = {
      superOutcome: 'Account Signup',
      outcome: specifier,
      result: 'fail'
    };
    this.outcomeAdd(content);
  }

  applicationInstalled() {
    let content = {
      superOutcome: 'Application Installation',
      outcome: 'Installed',
      result: 'success'
    };
    this.outcomeAdd(content);
  }

  applicationNotInstalled() {
    const content = {
      superOutcome: 'Application Installation',
      outcome: 'Not Installed',
      result: 'fail'
    };
    this.outcomeAdd(content);
  }

  initialSubscription(tier, method = null, price = null, term = null) {
    const content = {
      superOutcome: 'Initial Subscription',
      outcome: 'Subscribe - ' + tier,
      result: 'success'
    };
    if (method) {
      content['method'] = method;
    }
    if (price) {
      content['price'] = price;
    }
    if (term) {
      content['term'] = term;
    }
    this.outcomeAdd(content);
  }

  subscriptionDeclined(tier, method = null, price = null, term = null) {
    const content = {
      superOutcome: 'Initial Subscription',
      outcome: 'Decline - ' + tier,
      result: 'fail'
    };
    if (method) {
      content['method'] = method;
    }
    if (price) {
      content['price'] = price;
    }
    if (term) {
      content['term'] = term;
    }
    this.outcomeAdd(content);
  }

  subscriptionRenewed(tier, method = null, price = null, term = null) {
    const content = {
      superOutcome: 'Subscription Renewal',
      outcome: 'Renew - ' + tier,
      result: 'success'
    };
    if (method) {
      content['method'] = method;
    }
    if (price) {
      content['price'] = price;
    }
    if (term) {
      content['term'] = term;
    }
    this.outcomeAdd(content);
  }

  subscriptionPaused(tier, method = null, price = null, term = null) {
    const content = {
      superOutcome: 'Subscription Renewal',
      outcome: 'Paused - ' + tier,
      result: 'fail'
    };
    if (method) {
      content['method'] = method;
    }
    if (price) {
      content['price'] = price;
    }
    if (term) {
      content['term'] = term;
    }
    this.outcomeAdd(content);
  }

  subscriptionCanceled(tier, method = null, price = null, term = null) {
    const content = {
      superOutcome: 'Subscription Renewal',
      outcome: 'Cancel - ' + tier,
      result: 'fail'
    };
    if (method) {
      content['method'] = method;
    }
    if (price) {
      content['price'] = price;
    }
    if (term) {
      content['term'] = term;
    }
    this.outcomeAdd(content);
  }

  subscriptionUpsold(tier, method = null, price = null, term = null) {
    const content = {
      superOutcome: 'Subscription Upsold',
      outcome: 'Upsold - ' + tier,
      result: 'success'
    };
    if (method) {
      content['method'] = method;
    }
    if (price) {
      content['price'] = price;
    }
    if (term) {
      content['term'] = term;
    }
    this.outcomeAdd(content);
  }

  subscriptionUpsellDeclined(tier, method = null, price = null, term = null) {
    const content = {
      superOutcome: 'Subscription Upsold',
      outcome: 'Declined - ' + tier,
      result: 'fail'
    };
    if (method) {
      content['method'] = method;
    }
    if (price) {
      content['price'] = price;
    }
    if (term) {
      content['term'] = term;
    }
    this.outcomeAdd(content);
  }

  subscriptionDownsell(tier, method = null, price = null, term = null) {
    const content = {
      superOutcome: 'Subscription Upsold',
      outcome: 'Downsell - ' + tier,
      result: 'fail'
    };
    if (method) {
      content['method'] = method;
    }
    if (price) {
      content['price'] = price;
    }
    if (term) {
      content['term'] = term;
    }
    this.outcomeAdd(content);
  }

  adClicked(provider, id = null, price = null) {
    const content = {
      superOutcome: 'Advertisement',
      outcome: 'Ad Click - ' + provider,
      result: 'success'
    };
    if (id) {
      content['id'] = id;
    }
    if (price) {
      content['price'] = price;
    }
    this.outcomeAdd(content);
  }

  adIgnored(provider, id = null, price = null) {
    const content = {
      superOutcome: 'Advertisement',
      outcome: 'Ad Ignored - ' + provider,
      result: 'fail'
    };
    if (id) {
      content['id'] = id;
    }
    if (price) {
      content['price'] = price;
    }
    this.outcomeAdd(content);
  }

  referral(kind, detail = null) {
    const content = {
      superOutcome: 'Referral',
      outcome: 'Referred - ' + kind,
      result: 'success'
    };
    if (detail) {
      content['details'] = detail;
    }
    this.outcomeAdd(content);
  }

  referralDeclined(kind, detail = null) {
    const content = {
      superOutcome: 'Referral',
      outcome: 'Declined - ' + kind,
      result: 'fail'
    };
    if (detail) {
      content['details'] = detail;
    }
    this.outcomeAdd(content);
  }

  productAddedToCart(product, price = null) {
    const content = {
      superOutcome: 'Add Product To Cart',
      outcome: 'Add - ' + product,
      result: 'success'
    };
    if (price) {
      content['price'] = price;
    } else {
      price = 0.0;
    }
    this.outcomeAdd(content);
    this.heartbeatState(1);
    this.count("Add To Cart", price);
  }

  productNotAddedToCart(product) {
    const content = {
      superOutcome: 'Add Product To Cart',
      outcome: 'Ignore - ' + product,
      result: 'fail'
    };
    this.outcomeAdd(content);
  }

  upsold(product, price = null) {
    const content = {
      superOutcome: 'Upsold Product',
      outcome: 'Upsold - ' + product,
      result: 'success'
    };
    if (price) {
      content['price'] = price;
    } else {
      price = 0.0;
    }
    this.outcomeAdd(content);
    this.count("Upsell", price);
  }

  upsellDismissed(product, price = null) {
    const content = {
      superOutcome: 'Upsold Product',
      outcome: 'Dismissed - ' + product,
      result: 'fail'
    };
    if (price) {
      content['price'] = price;
    }
    this.outcomeAdd(content);
  }

  checkOut(member=null) {
    let outcome = "Check Out";
    let countSting = "Check Out";

    if (member != null) {
      outcome = "Check Out - " + member;
      countSting = "Checkout:" + member;
    }

    const content = {
      superOutcome: 'Customer Checkout',
      outcome: outcome,
      result: 'success'
    };
    this.outcomeAdd(content);
    this.heartbeatState(2);
    this.count(countSting);
  }

  checkoutCanceled() {
    const content = {
      superOutcome: 'Customer Checkout',
      outcome: 'Canceled',
      result: 'fail'
    };
    this.outcomeAdd(content);
  }

  productRemoved(product) {
    const content = {
      superOutcome: 'Customer Checkout',
      outcome: 'Product Removed - ' + product,
      result: 'fail'
    };
    this.outcomeAdd(content);
  }

  purchase(SKUs, price = null, discount=null, shipping=null, member=null) {
    let outcome = "Purchase";
    let purchaseSting = "Purchase";

    if (member != null) {
      outcome = "Purchase - " + member;
      purchaseSting = "Purchase:"+member
    }

    const content = {
      superOutcome: 'Customer Purchase',
      outcome: outcome,
      skus: SKUs,
      result: 'success'
    };
    if (price) {
      content['price'] = price;
    } else {
      price = 0.0;
    }
    if (discount) {
      content['discount'] = discount;
    }
    if (shipping) {
      content['shipping'] = shipping;
    }

    this.outcomeAdd(content);

    this.heartbeatState(3);
    this.count(purchaseSting, price);
  }

  purchaseCancel(SKUs = null, price = null) {
    const outcome = 'Canceled' + (SKUs ? ' - ' + SKUs : '');
    const content = {
      superOutcome: 'Customer Purchase',
      outcome: outcome,
      result: 'fail'
    };
    if (price) {
      content['price'] = price;
    }
    this.outcomeAdd(content);
  }

  promiseFulfilled() {
    const content = {
      superOutcome: 'Promise Fulfillment',
      outcome: 'Fulfilled',
      result: 'success'
    };
    this.outcomeAdd(content);
  }

  promiseUnfulfilled() {
    const content = {
      superOutcome: 'Promise Fulfillment',
      outcome: 'Unfulfilled',
      result: 'fail'
    };
    this.outcomeAdd(content);
  }

  productKept(product) {
    const content = {
      superOutcome: 'Product Disposition',
      outcome: 'Kept - ' + product,
      result: 'success'
    };
    this.outcomeAdd(content);
  }

  productReturned(product) {
    const content = {
      superOutcome: 'Product Disposition',
      outcome: 'Returned - ' + product,
      result: 'fail'
    };
    this.outcomeAdd(content);
  }

// Stock Milestones:

  featureAttempted(name, detail = null) {
    const event = {
      category: 'Feature',
      action: 'Attempted',
      name: name
    };
    if (detail) {
      event['details'] = detail;
    }
    this.journeyAdd(event);
  }

  featureCompleted(name, detail = null) {
    const event = {
      category: 'Feature',
      action: 'Completed',
      name: name
    };
    if (detail) {
      event['details'] = detail;
    }
    this.journeyAdd(event);
  }

  featureFailed(name, detail = null) {
    const event = {
      category: 'Feature',
      action: 'Failed',
      name: name
    };
    if (detail) {
      event['details'] = detail;
    }
    this.journeyAdd(event);
  }

  contentViewed(contentType, identifier = null) {
    const event = {
      category: 'Content',
      action: 'Viewed',
      type: contentType,
    };
    if (identifier) {
      event['identifier'] = identifier;
    }
    this.journeyAdd(event);
  }

  contentEdited(contentType, identifier = null, detail = null) {
    const event = {
      category: 'Content',
      action: 'Edited',
      type: contentType,
    };
    if (identifier) {
      event['identifier'] = identifier;
    }
    if (detail) {
      event['details'] = detail;
    }
    this.journeyAdd(event);
  }

  contentCreated(contentType, identifier = null) {
    const event = {
      category: 'Content',
      action: 'Created',
      type: contentType,
    };
    if (identifier) {
      event['identifier'] = identifier;
    }
    this.journeyAdd(event);
  }

  contentDeleted(contentType, identifier = null) {
    const event = {
      category: 'Content',
      action: 'Deleted',
      type: contentType,
    };
    if (identifier) {
      event['identifier'] = identifier;
    }
    this.journeyAdd(event);
  }

  contentArchived(contentType, identifier = null) {
    const event = {
      category: 'Content',
      action: 'Archived',
      type: contentType,
    };
    if (identifier) {
      event['identifier'] = identifier;
    }
    this.journeyAdd(event);
  }

  contentRequested(contentType, identifier = null) {
    const event = {
      category: 'Content',
      action: 'Requested',
      type: contentType,
    };
    if (identifier) {
      event['identifier'] = identifier;
    }
    this.journeyAdd(event);
  }

  contentSearched(contentType) {
    const event = {
      category: 'Content',
      action: 'Searched',
      type: contentType,
    };
    this.journeyAdd(event);
  }

  pageLoadTime(loadTime, url) {
    const event = {
      category: 'Webpage Load Time',
      time: loadTime.toString(),
      identifier: url,
    };
    this.journeyAdd(event);
  }

  // Custom Milestones

  milestone(category, operation, name, detail) {
    const event = {
      category: category,
      action: operation,
      name: name,
      details: detail
    };
    this.journeyAdd(event);
  }

  // API Communication:

  count(outcome, value= 0.0, surfaceErrors = false) {
    const attribution = retrieveSession('view-attribution');
    if (!attribution) return Promise.resolve(true);
    const replayLog = retrieveSession('view-count-replay');
    if (replayLog) {
      for (const params in replayLog) {
        this.countInternal(params, surfaceErrors);
      }
    }
    let params = {
      data: {
        uid: this.id(),
        token: this.apiKey,
        timestamp: (new Date()).getTime() / 1000,
        outcome: outcome,
        content: attribution,
        value: value
      }
    };
    return this.countInternal(params, surfaceErrors);
  }

  countInternal(params, surfaceErrors) {
    return this.CountApi(this.countApiUrl)
      .fetch(params)
      .catch((err) => {
        const replayLog = retrieveSession('view-count-replay');
        if (replayLog) {
          replayLog.push(params);
          storeSession('view-count-replay', replayLog);
        } else {
          storeSession('view-count-replay', [params]);
        }
        return (surfaceErrors ? Promise.reject(err) : Promise.resolve(true));
      });
  }

  commit(surfaceErrors = false) {
    if (!this.sampleDecision() || this.apiCallPending) {
      return Promise.resolve(true);
    }
    this.apiCallPending = true;
    let params = {
      data: {
        id: this.id(),
        journey: this.journey(),
        token: this.apiKey,
        timestamp: (new Date()).getTime() / 1000
      }
    };
    const saved = this.reset();
    return this.JourneyApi(this.apiUrl)
      .fetch(params)
      .then((value) => {
        this.apiCallPending = false;
        return Promise.resolve(value);
      })
      .catch((err) => {
        this.restore(saved);
        this.apiCallPending = false;
        this.apiCallPending = false
        return (surfaceErrors ? Promise.reject(err) : Promise.resolve(true));
      });
  }

  heartbeatState(stage = null) {
    const previousStage = retrieveLocal('heartbeat_stage');
    if (stage && stage > previousStage) {
      storeLocal('heartbeat_stage', stage);
    }
    if (!stage && !previousStage) {
      storeLocal('heartbeat_stage', 0);
    }
    return Number(retrieveLocal('heartbeat_stage'));
  }

  heartbeatMessage(type) {
    const stage = this.heartbeatState();
    const messages = {
      ecom: {
        0: {
          expires_in_seconds: 600,
          if_abandoned: {
            superOutcome: 'Add Product To Cart',
            outcome: 'Abandoned',
            result: 'fail'
          }
        },
        1: {
          expires_in_seconds: 600,
          if_abandoned: {
            superOutcome: 'Customer Checkout',
            outcome: 'Abandoned',
            result: 'fail'
          }
        },
        2: {
          expires_in_seconds: 600,
          if_abandoned: {
            superOutcome: 'Customer Purchase',
            outcome: 'Abandoned',
            result: 'fail'
          }
        },
        3: {
          remove: true
        },
      }
    };
    if (Object.keys(messages).includes(type)) {
      return messages[type][stage];
    }
    return retrieveLocal('heartbeat_outcome')
  }

  heartbeat(surfaceErrors = false) {
    const platform = retrieveSession('view-platform');
    const tags = retrieveSession('view-tags');
    let params = {
      data: {
        id: this.id(),
        journey: this.journey(),
        token: this.apiKey,
        platform: platform ? platform : {},
        tags: tags ? tags : [],
        timestamp: (new Date()).getTime() / 1000
      }
    };

    const heartbeatType = retrieveLocal('heartbeat_type');
    if (heartbeatType) {
      params.data['watchdog'] = this.heartbeatMessage(heartbeatType);
    }

    if (!this.sampleDecision() || this.apiCallPending) {
      return Promise.resolve(true);
    }
    this.apiCallPending = true;

    const saved = this.reset();
    return this.HeartbeatApi(this.apiUrl)
      .fetch(params)
      .then((value) => {
        if (heartbeatType && Object.keys(params.data['watchdog']).includes('remove')) {
          resetLocal('heartbeat_stage');
          resetLocal('heartbeat_type');
          resetLocal('heartbeat_outcome');
        }
        this.apiCallPending = false;
        return Promise.resolve(value);
      })
      .catch((err) => {
        this.restore(saved);
        this.apiCallPending = false;
        return (surfaceErrors ? Promise.reject(err) : Promise.resolve(true));
      });
  }

  deanonymize(person) {
    if (!this.sampleDecision()) {
      return Promise.resolve(true);
    }

    let params = {
      data: {
        id: this.id(),
        person: person,
        token: this.apiKey,
        timestamp: (new Date()).getTime() / 1000
      }
    };
    return this.DeanonApi(this.apiUrl)
      .fetch(params);
  }

  // Internals:

  id(id) {
    if (id) {
      storeSession('xenon-view', id);
    }
    id = retrieveSession('xenon-view');
    if (!id || id === '') {
      return this.newId();
    }
    return id;
  }

  newId() {
    storeSession('xenon-view', crypto.randomUUID());
    return retrieveSession('xenon-view');
  }

  sampleDecision(decision = null, onApiKeyFailure = null) {
    if (decision !== null) {
      storeSession('xenon-will-sample', decision)
    }
    decision = retrieveSession('xenon-will-sample');
    if (decision === null || decision === '') {
      let params = {data: {id: this.id(), token: this.apiKey}};
      this.SampleApi(this.apiUrl).fetch(params).then((json) => {
        decision = this.sampleDecision(json['sample'], onApiKeyFailure);
      }).catch((error) => {
        if (error.authIssue && onApiKeyFailure) {
          onApiKeyFailure(error);
          return;
        }
        decision = this.sampleDecision(true, onApiKeyFailure);
      });
    }
    decision = (decision !== null) ? Boolean(decision) : null;
    return decision;
  }

  outcomeAdd(content) {
    let platform = retrieveSession('view-platform');
    if (platform) content['platform'] = platform;
    let tags = retrieveSession('view-tags');
    if (tags) content['tags'] = tags;
    this.journeyAdd(content);
  }

  journeyAdd(content) {
    let journey = this.journey();
    content.timestamp = (new Date()).getTime() / 1000;
    if (this.pageURL_) {
      content.url = this.pageURL_;
    }
    if (journey && journey.length) {
      let last = journey[journey.length - 1];
      if (this.isDuplicate(last, content)) {
        let count = last.hasOwnProperty('count') ? last.count : 1;
        last.count = count + 1;
      } else {
        journey.push(content);
      }
    } else {
      journey = [content];
    }
    this.storeJourney(journey);
  }


  isDuplicate(last, content) {
    const lastKeys = Object.keys(last);
    const contentKeys = Object.keys(content);
    const isSuperset = (set, subset) => {
      for (const elem of subset) {
        if (!set.has(elem)) {
          return false;
        }
      }
      return true;
    };
    if (!isSuperset(new Set(lastKeys), new Set(contentKeys))) return false;
    if (!contentKeys.includes('category') || !lastKeys.includes('category')) return false;
    if (content.category !== last.category) return false;
    if (!contentKeys.includes('action') || !lastKeys.includes('action')) return false;
    if (content.action !== last.action) return false;
    return (this.duplicateFeature(last, content, lastKeys, contentKeys) ||
      this.duplicateContent(last, content, lastKeys, contentKeys) ||
      this.duplicateMilestone(last, content, lastKeys, contentKeys));
  }

  duplicateFeature(last, content, lastKeys, contentKeys) {
    if (content.category !== 'Feature' || last.category !== 'Feature') return false;
    return content.name === last.name;
  }

  duplicateContent(last, content, lastKeys, contentKeys) {
    if (content.category !== 'Content' || last.category !== 'Content') return false;
    if (!contentKeys.includes('type') && !lastKeys.includes('type')) return true;
    if (content.type !== last.type) return false;
    if (!contentKeys.includes('identifier') && !lastKeys.includes('identifier')) return true;
    if (content.identifier !== last.identifier) return false;
    if (!contentKeys.includes('details') && !lastKeys.includes('details')) return true;
    return content.details === last.details;
  }

  duplicateMilestone(last, content, lastKeys, contentKeys) {
    if (content.category === 'Feature' || last.category === 'Feature') return false;
    if (content.category === 'Content' || last.category === 'Content') return false;
    if (content.name !== last.name) return false;
    return content.details === last.details;
  }

  journey() {
    return retrieveLocal('view-journey');
  }

  storeJourney(journey) {
    storeLocal('view-journey', journey);
  }

  reset() {
    this.restoreJourney = this.journey();
    resetLocal('view-journey');
    this.storeJourney([]);
    return this.restoreJourney
  }

  restore(journey = null) {
    let currentJourney = this.journey();
    let restoreJourney = journey ? journey : this.restoreJourney;
    if (currentJourney !== null && currentJourney.length) {
      restoreJourney = restoreJourney.concat(currentJourney);
    }

    function compare( a, b ) {
      if ( a.timestamp < b.timestamp ){
        return -1;
      }
      if ( a.timestamp > b.timestamp ){
        return 1;
      }
      return 0;
    }
    restoreJourney.sort( compare );
    this.storeJourney(restoreJourney);
    this.restoreJourney = [];
  }

  hasClassInHierarchy(target, className, maxDepth) {
    const searcher = (node, className, maxDepth, currentDepth) => {
      if (currentDepth >= maxDepth)
        return false;
      if (node.className.toString().includes(className))
        return true;
      if (!node.parentElement)
        return false;
      return searcher(node.parentElement, className, maxDepth, currentDepth + 1);
    };

    return searcher(target, className, maxDepth, 0);
  }

  decipherParamsPerLibrary(params) {
    if (params.has('xenonSrc')) {
      return [params.get('xenonSrc'), params.get('xenonId')];
    }
    if (params.has('cr_campaignid')) {
      return ['Cerebro', params.get('cr_campaignid')];
    }
    if (params.has('utm_source') && params.get('utm_source').toLowerCase() === 'klaviyo') {
      const source = 'Klaviyo' + (params.has('utm_medium') ? ' - ' + params.get('utm_medium') : '');
      return [source, params.get('utm_campaign')];
    }
    if (params.has('g_campaignid')) {
      return ['Google Ad', params.get('g_campaignid')]
    }
    if (params.has('utm_source') && params.get('utm_source').toLowerCase() === 'shareasale') {
      return ['Share-a-sale', params.get('sscid')]
    }
    if (params.has('g_adtype') && params.get('g_adtype') === 'none') {
      return ['Google Organic', params.get('g_campaign')]
    }
    if (params.has('g_adtype') && params.get('g_adtype') === 'search') {
      return ['Google Paid Search', params.get('g_campaign')]
    }
    if (params.has('utm_source') && params.get('utm_source') === 'facebook') {
      return ['Facebook Ad', params.get('utm_campaign')]
    }
    if (params.has('utm_source') && params.get('utm_source').toLowerCase() === 'email-broadcast') {
      return ['Email', params.get('utm_campaign')]
    }
    if (params.has('utm_source') && params.get('utm_source').toLowerCase() === 'youtube') {
      return ['YouTube', params.get('utm_campaign')]
    }
    if (params.has('utm_source')) {
      return [params.get('utm_source'), params.get('utm_campaign')]
    }
    return ['Unattributed']
  }

  autodiscoverLeadFrom(queryFromUrl) {
    if (queryFromUrl && queryFromUrl !== '' && queryFromUrl !== '?') {
      const params = new URLSearchParams(queryFromUrl);
      const [source, identifier] = this.decipherParamsPerLibrary(params);
      let attribution = retrieveSession('view-attribution');
      if (attribution) return queryFromUrl;
      storeSession('view-attribution', {
        leadSource: source,
        leadCampaign: identifier,
        leadGuid: null
      })
      let variantNames = retrieveSession('view-tags');
      if (source && (!variantNames || !variantNames.includes(source))) {
        if (variantNames) {
          variantNames.push(source);
          if (identifier) {
            variantNames.push(identifier);
          }
        } else {
          variantNames = [source];
          if (identifier) {
            variantNames.push(identifier);
          }
        }
        this.variant(variantNames);
        (source === 'Unattributed') ?
          this.leadUnattributed() :
          this.leadAttributed(source, identifier);
      }
      params.delete('xenonId');
      params.delete('xenonSrc');
      let query = "";
      if (params.size) {
        query = "?" + params.toString();
      }
      return query;
    } else {
      let variantNames = retrieveSession('view-tags');
      const source = 'Unattributed';
      let attribution = retrieveSession('view-attribution');
      if (attribution) return queryFromUrl;
      storeSession('view-attribution', {
        leadSource: source,
        leadCampaign: null,
        leadGuid: null
      })
      if (!variantNames || !variantNames.includes(source)) {
        (variantNames) ? variantNames.push(source) : variantNames = [source];
        this.variant(variantNames);
        this.leadUnattributed();
      }
      return queryFromUrl;
    }
  }

  pageURL(url) {
    this.pageURL_ = url;
  }
}

