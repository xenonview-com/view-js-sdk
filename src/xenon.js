/**
 * Created by lwoydziak on 09/27/21.
 */
/**
 * xenon.js
 *
 * SDK for interacting with the Xenon View service.
 *
 */
import { UAParser } from 'ua-parser-js';
import JourneyApi from "./api/journey";
import HeartbeatApi from "./api/heartbeat";
import DeanonApi from "./api/deanonymize";
import SampleApi from "./api/sample";
import CountApi from "./api/count";
import ErrorLogApi from "./api/error_log";
import {resetLocal, resetSession, retrieveLocal, retrieveSession, storeLocal, storeSession} from "./storage/storage";

export class _Xenon {
  constructor(apiKey = null, apiUrl = 'https://app.xenonview.com',
              countApiUrl = 'https://counts.xenonlab.ai',
              journeyApi = JourneyApi, deanonApi = DeanonApi, heartbeatApi = HeartbeatApi,
              sampleApi = SampleApi, countApi = CountApi, errorLogApi = ErrorLogApi) {
    this.JourneyApi = journeyApi;
    this.DeanonApi = deanonApi;
    this.HeartbeatApi = heartbeatApi;
    this.SampleApi = sampleApi;
    this.CountApi = countApi;
    this.ErrorLogApi = errorLogApi;
    this.pageURL_ = null;
    this.restoreJourney = [];
    this.apiCallPending = false;
    this.apiUrl = apiUrl;
    this.countApiUrl = countApiUrl;

  }

  version() {
    return 'v0.2.2.1';
  }

  async init(apiKey, apiUrl = 'https://app.xenonview.com', onApiKeyFailure = null) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    await this.id();
    let journey = await this.journey();
    if (!journey) {
      await this.storeJourney([]);
    }
    await this.sampleDecision(null, onApiKeyFailure)
    this.apiCallPending = false;
  }

  async ecomAbandonment() {
    await storeLocal('heartbeat_type', 'ecom');
    await this.heartbeatState(0);
  }

  async customAbandonment(outcome) {
    await storeLocal('heartbeat_type', 'custom');
    await storeLocal('heartbeat_outcome', outcome);
    await this.heartbeatState(0);
  }

  async cancelAbandonment() {
    await storeLocal('heartbeat_type', 'custom');
    await storeLocal('heartbeat_outcome', {
      remove: true
    });
    await this.heartbeatState(0);
  }

  async platform(softwareVersion, deviceModel, operatingSystemName, operatingSystemVersion) {
    const platform = {
      softwareVersion: softwareVersion,
      deviceModel: deviceModel,
      operatingSystemName: operatingSystemName,
      operatingSystemVersion: operatingSystemVersion
    };
    await storeSession('view-platform', platform);
  }

  async removePlatform() {
    await resetSession('view-platform');
  }

  async variant(variantNames) {
    await storeSession('view-tags', variantNames);
  }

  async resetVariants() {
    await resetSession('view-tags');
  }

  async startVariant(variantName) {
    let variantNames = await retrieveSession('view-tags');
    if (!variantNames || !variantNames.includes(variantName)) {
      await this.resetVariants()
      await this.variant([variantName])
    }
  }

  async addVariant(variantName) {
    let variantNames = await retrieveSession('view-tags');
    if (!variantNames || !variantNames.includes(variantName)) {
      (variantNames) ? variantNames.push(variantName) : variantNames = [variantName];
      await this.variant(variantNames);
    }
  }

  // Stock Business Outcomes:
  async leadAttributed(source, identifier = null) {
    await this.count("Attribution");
  }

  async leadUnattributed() {
    await this.count("Attribution");
  }

  async leadCaptured(specifier) {
    const content = {
      superOutcome: 'Lead Capture',
      outcome: specifier,
      result: 'success'
    };
    await this.outcomeAdd(content);
  }

  async leadCaptureDeclined(specifier) {
    const content = {
      superOutcome: 'Lead Capture',
      outcome: specifier,
      result: 'fail'
    };
    await this.outcomeAdd(content);
  }

  async accountSignup(specifier) {
    const content = {
      superOutcome: 'Account Signup',
      outcome: specifier,
      result: 'success'
    };
    await this.outcomeAdd(content);
  }

  async accountSignupDeclined(specifier) {
    const content = {
      superOutcome: 'Account Signup',
      outcome: specifier,
      result: 'fail'
    };
    await this.outcomeAdd(content);
  }

  async applicationInstalled() {
    let content = {
      superOutcome: 'Application Installation',
      outcome: 'Installed',
      result: 'success'
    };
    await this.outcomeAdd(content);
  }

  async applicationNotInstalled() {
    const content = {
      superOutcome: 'Application Installation',
      outcome: 'Not Installed',
      result: 'fail'
    };
    await this.outcomeAdd(content);
  }

  async initialSubscription(tier, method = null, price = null, term = null) {
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
    await this.outcomeAdd(content);
  }

  async subscriptionDeclined(tier, method = null, price = null, term = null) {
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
    await this.outcomeAdd(content);
  }

  async subscriptionRenewed(tier, method = null, price = null, term = null) {
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
    await this.outcomeAdd(content);
  }

  async subscriptionPaused(tier, method = null, price = null, term = null) {
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
    await this.outcomeAdd(content);
  }

  async subscriptionCanceled(tier, method = null, price = null, term = null) {
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
    await this.outcomeAdd(content);
  }

  async subscriptionUpsold(tier, method = null, price = null, term = null) {
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
    await this.outcomeAdd(content);
  }

  async subscriptionUpsellDeclined(tier, method = null, price = null, term = null) {
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
    await this.outcomeAdd(content);
  }

  async subscriptionDownsell(tier, method = null, price = null, term = null) {
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
    await this.outcomeAdd(content);
  }

  async adClicked(provider, id = null, price = null) {
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
    await this.outcomeAdd(content);
  }

  async adIgnored(provider, id = null, price = null) {
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
    await this.outcomeAdd(content);
  }

  async referral(kind, detail = null) {
    const content = {
      superOutcome: 'Referral',
      outcome: 'Referred - ' + kind,
      result: 'success'
    };
    if (detail) {
      content['details'] = detail;
    }
    await this.outcomeAdd(content);
  }

  async referralDeclined(kind, detail = null) {
    const content = {
      superOutcome: 'Referral',
      outcome: 'Declined - ' + kind,
      result: 'fail'
    };
    if (detail) {
      content['details'] = detail;
    }
    await this.outcomeAdd(content);
  }

  async productAddedToCart(product, price = null) {
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
    await this.outcomeAdd(content);
    await this.heartbeatState(1);
    await this.count("Add To Cart", price, [product]);
  }

  async productNotAddedToCart(product) {
    const content = {
      superOutcome: 'Add Product To Cart',
      outcome: 'Ignore - ' + product,
      result: 'fail'
    };
    await this.outcomeAdd(content);
  }

  async upsold(product, price = null) {
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
    await this.outcomeAdd(content);
    await this.count("Upsell", price, [product]);
  }

  async upsellDismissed(product, price = null) {
    const content = {
      superOutcome: 'Upsold Product',
      outcome: 'Dismissed - ' + product,
      result: 'fail'
    };
    if (price) {
      content['price'] = price;
    }
    await this.outcomeAdd(content);
  }

  async checkOut(member = null) {
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
    await this.outcomeAdd(content);
    await this.heartbeatState(2);
    await this.count(countSting);
  }

  async checkoutCanceled() {
    const content = {
      superOutcome: 'Customer Checkout',
      outcome: 'Canceled',
      result: 'fail'
    };
    await this.outcomeAdd(content);
  }

  async productRemoved(product) {
    const content = {
      superOutcome: 'Customer Checkout',
      outcome: 'Product Removed - ' + product,
      result: 'fail'
    };
    await this.outcomeAdd(content);
  }

  async purchase(SKUs, price = null, discount = null, shipping = null, member = null) {
    let outcome = "Purchase";
    let purchaseSting = "Purchase";

    if (member != null) {
      outcome = "Purchase - " + member;
      purchaseSting = "Purchase:" + member
    }

    if (!Array.isArray(SKUs)) {
      const SKUsString = SKUs.toString();
      SKUs = SKUsString.split(",").map(item => item.trim());
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

    await this.outcomeAdd(content);
    await this.heartbeatState(3);
    await this.count(purchaseSting, price, SKUs);
  }

  async purchaseCancel(SKUs = null, price = null) {
    const outcome = 'Canceled' + (SKUs ? ' - ' + SKUs : '');
    const content = {
      superOutcome: 'Customer Purchase',
      outcome: outcome,
      result: 'fail'
    };
    if (price) {
      content['price'] = price;
    }
    await this.outcomeAdd(content);
  }

  async promiseFulfilled() {
    const content = {
      superOutcome: 'Promise Fulfillment',
      outcome: 'Fulfilled',
      result: 'success'
    };
    await this.outcomeAdd(content);
  }

  async promiseUnfulfilled() {
    const content = {
      superOutcome: 'Promise Fulfillment',
      outcome: 'Unfulfilled',
      result: 'fail'
    };
    await this.outcomeAdd(content);
  }

  async productKept(product) {
    const content = {
      superOutcome: 'Product Disposition',
      outcome: 'Kept - ' + product,
      result: 'success'
    };
    await this.outcomeAdd(content);
  }

  async productReturned(product) {
    const content = {
      superOutcome: 'Product Disposition',
      outcome: 'Returned - ' + product,
      result: 'fail'
    };
    await this.outcomeAdd(content);
  }

// Stock Milestones:

  async featureAttempted(name, detail = null) {
    const event = {
      category: 'Feature',
      action: 'Attempted',
      name: name
    };
    if (detail) {
      event['details'] = detail;
    }
    await this.journeyAdd(event);
  }

  async featureCompleted(name, detail = null) {
    const event = {
      category: 'Feature',
      action: 'Completed',
      name: name
    };
    if (detail) {
      event['details'] = detail;
    }
    await this.journeyAdd(event);
  }

  async featureFailed(name, detail = null) {
    const event = {
      category: 'Feature',
      action: 'Failed',
      name: name
    };
    if (detail) {
      event['details'] = detail;
    }
    await this.journeyAdd(event);
  }

  async contentViewed(contentType, identifier = null) {
    const event = {
      category: 'Content',
      action: 'Viewed',
      type: contentType,
    };
    if (identifier) {
      event['identifier'] = identifier;
    }
    await this.journeyAdd(event);
  }

  async contentEdited(contentType, identifier = null, detail = null) {
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
    await this.journeyAdd(event);
  }

  async contentCreated(contentType, identifier = null) {
    const event = {
      category: 'Content',
      action: 'Created',
      type: contentType,
    };
    if (identifier) {
      event['identifier'] = identifier;
    }
    await this.journeyAdd(event);
  }

  async contentDeleted(contentType, identifier = null) {
    const event = {
      category: 'Content',
      action: 'Deleted',
      type: contentType,
    };
    if (identifier) {
      event['identifier'] = identifier;
    }
    await this.journeyAdd(event);
  }

  async contentArchived(contentType, identifier = null) {
    const event = {
      category: 'Content',
      action: 'Archived',
      type: contentType,
    };
    if (identifier) {
      event['identifier'] = identifier;
    }
    await this.journeyAdd(event);
  }

  async contentRequested(contentType, identifier = null) {
    const event = {
      category: 'Content',
      action: 'Requested',
      type: contentType,
    };
    if (identifier) {
      event['identifier'] = identifier;
    }
    await this.journeyAdd(event);
  }

  async contentSearched(contentType) {
    const event = {
      category: 'Content',
      action: 'Searched',
      type: contentType,
    };
    await this.journeyAdd(event);
  }

  async pageLoadTime(loadTime, url) {
    const event = {
      category: 'Webpage Load Time',
      time: loadTime.toString(),
      identifier: url,
    };
    await this.journeyAdd(event);
  }

  // Custom Milestones

  async milestone(category, operation, name, detail) {
    const event = {
      category: category,
      action: operation,
      name: name,
      details: detail
    };
    await this.journeyAdd(event);
  }

  // API Communication:

  async count(outcome, value = 0.0, skus = null, surfaceErrors = false) {
    const attribution = await retrieveSession('view-attribution');
    if (!attribution) return Promise.resolve(true);
    const platform = await retrieveSession('view-platform');
    let params = {
      data: {
        uid: await this.id(),
        token: this.apiKey,
        timestamp: (new Date()).getTime() / 1000,
        outcome: outcome,
        content: attribution,
        platform: platform ? platform : null,
        skus: skus,
        value: value
      }
    };
    let replayLog = await retrieveSession('view-count-replay');
    if (replayLog) {
      replayLog.push(params);
    } else {
      replayLog = [params];
    }
    await storeSession('view-count-replay', replayLog);
    try {
      let result = null;
      while (replayLog.length > 0) {
        const params = replayLog.shift();
        result = await this.CountApi(this.countApiUrl).fetch(params);
        await storeSession('view-count-replay', replayLog);
      }
      return result;
    } catch (error) {
      return (surfaceErrors ? Promise.reject(error) : Promise.resolve(true));
    }
  }

  async heartbeatState(stage = null) {
    const previousStage = await retrieveLocal('heartbeat_stage');
    if (stage && stage > previousStage) {
      await storeLocal('heartbeat_stage', stage);
    }
    if (!stage && !previousStage) {
      await storeLocal('heartbeat_stage', 0);
    }
    return Number(await retrieveLocal('heartbeat_stage'));
  }

  async commit(surfaceErrors = false) {
    if (!await this.sampleDecision() || this.apiCallPending) {
      return Promise.resolve(true);
    }
    this.apiCallPending = true;
    let params = {
      data: {
        id: await this.id(),
        journey: await this.journey(),
        token: this.apiKey,
        timestamp: (new Date()).getTime() / 1000
      }
    };
    const saved = await this.reset();
    try {
      const value = await this.JourneyApi(this.apiUrl).fetch(params);
      this.apiCallPending = false;
      return Promise.resolve(value);
    } catch (error) {
      await this.restore(saved);
      this.apiCallPending = false;
      return (surfaceErrors ? Promise.reject(error) : Promise.resolve(true));
    }
  }

  async heartbeatMessage(type) {
    const stage = await this.heartbeatState();
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
    return await retrieveLocal('heartbeat_outcome')
  }

  async heartbeat(surfaceErrors = false) {
    const platform = await retrieveSession('view-platform');
    const tags = await retrieveSession('view-tags');
    let params = {
      data: {
        id: await this.id(),
        journey: await this.journey(),
        token: this.apiKey,
        platform: platform ? platform : {},
        tags: tags ? tags : [],
        timestamp: (new Date()).getTime() / 1000
      }
    };

    const heartbeatType = await retrieveLocal('heartbeat_type');
    if (heartbeatType) {
      params.data['watchdog'] = await this.heartbeatMessage(heartbeatType);
    }

    if (!await this.sampleDecision() || this.apiCallPending) {
      return Promise.resolve(true);
    }
    this.apiCallPending = true;

    const saved = await this.reset();
    try {
      const value = await this.HeartbeatApi(this.apiUrl).fetch(params);
      if (heartbeatType && Object.keys(params.data['watchdog']).includes('remove')) {
        await resetLocal('heartbeat_stage');
        await resetLocal('heartbeat_type');
        await resetLocal('heartbeat_outcome');
      }
      this.apiCallPending = false;
      return Promise.resolve(value);
    } catch (error) {
      await this.restore(saved);
      this.apiCallPending = false;
      return (surfaceErrors ? Promise.reject(error) : Promise.resolve(true));
    }
  }

  async deanonymize(person) {
    if (!await this.sampleDecision()) {
      return Promise.resolve(true);
    }

    let params = {
      data: {
        id: await this.id(),
        person: person,
        token: this.apiKey,
        timestamp: (new Date()).getTime() / 1000
      }
    };
    return await this.DeanonApi(this.apiUrl).fetch(params);
  }

  async recordError(log) {
    if (!await this.sampleDecision()) {
      return Promise.resolve(true);
    }

    let params = {
      data: {
        log: log,
        token: this.apiKey,
      }
    };
    return await this.ErrorLogApi(this.apiUrl).fetch(params);
  }

  // Internals:

  async id(id) {
    if (id) {
      await storeSession('xenon-view', id);
    }
    id = await retrieveSession('xenon-view');
    if (!id || id === '') {
      return await this.newId();
    }
    return id;
  }

  async newId() {
    await storeSession('xenon-view', crypto.randomUUID());
    return await retrieveSession('xenon-view');
  }

  async sampleDecision(decision = null, onApiKeyFailure = null) {
    if (decision !== null) {
      await storeSession('xenon-will-sample', decision)
    }
    decision = await retrieveSession('xenon-will-sample');
    if (decision === null || decision === '') {
      let params = {data: {id: await this.id(), token: this.apiKey}};
      try {
        const json = await this.SampleApi(this.apiUrl).fetch(params);
        decision = await this.sampleDecision(json['sample'], onApiKeyFailure);
      } catch (error) {
        if (error.authIssue && onApiKeyFailure) {
          onApiKeyFailure(error);
          return;
        }
        decision = await this.sampleDecision(true, onApiKeyFailure);
      }
    }
    decision = Boolean(decision);
    return decision;
  }

  async outcomeAdd(content) {
    let platform = await retrieveSession('view-platform');
    if (platform) content['platform'] = platform;
    let tags = await retrieveSession('view-tags');
    if (tags) content['tags'] = tags;
    await this.journeyAdd(content);
  }

  async journeyAdd(content) {
    let journey = await this.journey();
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
    await this.storeJourney(journey);
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

  async journey() {
    return await retrieveLocal('view-journey');
  }

  async storeJourney(journey) {
    await storeLocal('view-journey', journey);
  }

  async reset() {
    this.restoreJourney = await this.journey();
    await resetLocal('view-journey');
    await this.storeJourney([]);
    return this.restoreJourney
  }

  async restore(journey = null) {
    let currentJourney = await this.journey();
    let restoreJourney = journey ? journey : this.restoreJourney;
    if (currentJourney !== null && currentJourney.length) {
      restoreJourney = restoreJourney.concat(currentJourney);
    }

    function compare(a, b) {
      if (a.timestamp < b.timestamp) {
        return -1;
      }
      if (a.timestamp > b.timestamp) {
        return 1;
      }
      return 0;
    }

    restoreJourney.sort(compare);
    await this.storeJourney(restoreJourney);
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
    if (params.has('sscid')) {
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

  async autodiscoverLeadFrom(queryFromUrl) {
    if (queryFromUrl && queryFromUrl !== '' && queryFromUrl !== '?') {
      const params = new URLSearchParams(queryFromUrl);
      const [source, identifier] = this.decipherParamsPerLibrary(params);
      let attribution = await retrieveSession('view-attribution');
      if (attribution) return queryFromUrl;
      await storeSession('view-attribution', {
        leadSource: source,
        leadCampaign: identifier,
        leadGuid: null
      })
      let variantNames = await retrieveSession('view-tags');
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
        await this.variant(variantNames);
        (source === 'Unattributed') ?
          await this.leadUnattributed() :
          await this.leadAttributed(source, identifier);
      }
      params.delete('xenonId');
      params.delete('xenonSrc');
      let query = "";
      if (params.size) {
        query = "?" + params.toString();
      }
      return query;
    } else {
      let variantNames = await retrieveSession('view-tags');
      const source = 'Unattributed';
      let attribution = await retrieveSession('view-attribution');
      if (attribution) return queryFromUrl;
      await storeSession('view-attribution', {
        leadSource: source,
        leadCampaign: null,
        leadGuid: null
      })
      if (!variantNames || !variantNames.includes(source)) {
        (variantNames) ? variantNames.push(source) : variantNames = [source];
        await this.variant(variantNames);
        await this.leadUnattributed();
      }
      return queryFromUrl;
    }
  }

  pageURL(url) {
    this.pageURL_ = url;
  }

  async setPlatformByUserAgent(userAgent, version){
    const platform = {
      softwareVersion: version,
      deviceModel: null,
      operatingSystemName: null,
      operatingSystemVersion: null
    };
    const userAgentParser = new UAParser(userAgent);
    const browser = userAgentParser.getBrowser();
    const deviceModel = browser.name + ":" + browser.version;
    const os = userAgentParser.getOS();
    const operatingSystemName = os.name;
    const operatingSystemVersion = os.version;
    platform.deviceModel = deviceModel;
    platform.operatingSystemName = operatingSystemName;
    platform.operatingSystemVersion = operatingSystemVersion;
    await this.platform(version, deviceModel, operatingSystemName, operatingSystemVersion);
  }
}

