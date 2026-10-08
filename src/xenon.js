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

import ProductMetadata from './product_metadata';
import Fields from './fields';
import Attribution from './attribution';

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
    return 'v0.2.12';
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
    if (!Fields.fallback(variantNames, []).includes(variantName)) {
      await this.resetVariants()
      await this.variant([variantName])
    }
  }

  async addVariant(variantName) {
    let variantNames = await retrieveSession('view-tags');
    if (!Fields.fallback(variantNames, []).includes(variantName)) {
      variantNames = Fields.fallback(variantNames, []);
      variantNames.push(variantName);
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
    Object.assign(content, Fields.truthy({method: method, price: price, term: term}));
    await this.outcomeAdd(content);
  }

  async subscriptionDeclined(tier, method = null, price = null, term = null) {
    const content = {
      superOutcome: 'Initial Subscription',
      outcome: 'Decline - ' + tier,
      result: 'fail'
    };
    Object.assign(content, Fields.truthy({method: method, price: price, term: term}));
    await this.outcomeAdd(content);
  }

  async subscriptionRenewed(tier, method = null, price = null, term = null) {
    const content = {
      superOutcome: 'Subscription Renewal',
      outcome: 'Renew - ' + tier,
      result: 'success'
    };
    Object.assign(content, Fields.truthy({method: method, price: price, term: term}));
    await this.outcomeAdd(content);
  }

  async subscriptionPaused(tier, method = null, price = null, term = null) {
    const content = {
      superOutcome: 'Subscription Renewal',
      outcome: 'Paused - ' + tier,
      result: 'fail'
    };
    Object.assign(content, Fields.truthy({method: method, price: price, term: term}));
    await this.outcomeAdd(content);
  }

  async subscriptionCanceled(tier, method = null, price = null, term = null) {
    const content = {
      superOutcome: 'Subscription Renewal',
      outcome: 'Cancel - ' + tier,
      result: 'fail'
    };
    Object.assign(content, Fields.truthy({method: method, price: price, term: term}));
    await this.outcomeAdd(content);
  }

  async subscriptionUpsold(tier, method = null, price = null, term = null) {
    const content = {
      superOutcome: 'Subscription Upsold',
      outcome: 'Upsold - ' + tier,
      result: 'success'
    };
    Object.assign(content, Fields.truthy({method: method, price: price, term: term}));
    await this.outcomeAdd(content);
  }

  async subscriptionUpsellDeclined(tier, method = null, price = null, term = null) {
    const content = {
      superOutcome: 'Subscription Upsold',
      outcome: 'Declined - ' + tier,
      result: 'fail'
    };
    Object.assign(content, Fields.truthy({method: method, price: price, term: term}));
    await this.outcomeAdd(content);
  }

  async subscriptionDownsell(tier, method = null, price = null, term = null) {
    const content = {
      superOutcome: 'Subscription Upsold',
      outcome: 'Downsell - ' + tier,
      result: 'fail'
    };
    Object.assign(content, Fields.truthy({method: method, price: price, term: term}));
    await this.outcomeAdd(content);
  }

  async adClicked(provider, id = null, price = null) {
    const content = {
      superOutcome: 'Advertisement',
      outcome: 'Ad Click - ' + provider,
      result: 'success'
    };
    Object.assign(content, Fields.truthy({id: id, price: price}));
    await this.outcomeAdd(content);
  }

  async adIgnored(provider, id = null, price = null) {
    const content = {
      superOutcome: 'Advertisement',
      outcome: 'Ad Ignored - ' + provider,
      result: 'fail'
    };
    Object.assign(content, Fields.truthy({id: id, price: price}));
    await this.outcomeAdd(content);
  }

  async referral(kind, detail = null) {
    const content = {
      superOutcome: 'Referral',
      outcome: 'Referred - ' + kind,
      result: 'success'
    };
    Object.assign(content, Fields.truthy({details: detail}));
    await this.outcomeAdd(content);
  }

  async referralDeclined(kind, detail = null) {
    const content = {
      superOutcome: 'Referral',
      outcome: 'Declined - ' + kind,
      result: 'fail'
    };
    Object.assign(content, Fields.truthy({details: detail}));
    await this.outcomeAdd(content);
  }

  async productAddedToCart(product, price = null, productName = null, brand = null) {
    const metadata = new ProductMetadata([product], productName, brand).values();
    const content = {
      ...metadata,
      superOutcome: 'Add Product To Cart',
      outcome: 'Add - ' + product,
      result: 'success'
    };
    Object.assign(content, Fields.truthy({price}));
    price = Fields.fallback(price, 0.0);
    await this.outcomeAdd(content);
    await this.heartbeatState(1);
    await this.count("Add To Cart", price, [product], false, metadata.productNames, metadata.brands);
  }

  async productNotAddedToCart(product, productName = null, brand = null) {
    const metadata = new ProductMetadata([product], productName, brand).values();
    const content = {
      ...metadata,
      superOutcome: 'Add Product To Cart',
      outcome: 'Ignore - ' + product,
      result: 'fail'
    };
    await this.outcomeAdd(content);
  }

  async upsold(product, price = null, productName = null, brand = null) {
    const metadata = new ProductMetadata([product], productName, brand).values();
    const content = {
      ...metadata,
      superOutcome: 'Upsold Product',
      outcome: 'Upsold - ' + product,
      result: 'success'
    };
    Object.assign(content, Fields.truthy({price}));
    price = Fields.fallback(price, 0.0);
    await this.outcomeAdd(content);
    await this.count("Upsell", price, [product], false, metadata.productNames, metadata.brands);
  }

  async upsellDismissed(product, price = null, productName = null, brand = null) {
    const metadata = new ProductMetadata([product], productName, brand).values();
    const content = {
      ...metadata,
      superOutcome: 'Upsold Product',
      outcome: 'Dismissed - ' + product,
      result: 'fail'
    };
    Object.assign(content, Fields.truthy({price: price}));
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

  async productRemoved(product, productName = null, brand = null) {
    const metadata = new ProductMetadata([product], productName, brand).values();
    const content = {
      ...metadata,
      superOutcome: 'Customer Checkout',
      outcome: 'Product Removed - ' + product,
      result: 'fail'
    };
    await this.outcomeAdd(content);
  }

  async purchase(SKUs, price = null, discount = null, shipping = null, member = null, productNames = null, brands = null) {
    const metadata = new ProductMetadata(SKUs, productNames, brands).values();
    let outcome = "Purchase";
    let purchaseSting = "Purchase";

    if (member != null) {
      outcome = "Purchase - " + member;
      purchaseSting = "Purchase:" + member
    }

    SKUs = ProductMetadata.identifiers(SKUs);

    const content = {
      superOutcome: 'Customer Purchase',
      outcome: outcome,
      ...metadata,
      skus: SKUs,
      result: 'success'
    };
    Object.assign(content, Fields.truthy({price}));
    price = Fields.fallback(price, 0.0);
    Object.assign(content, Fields.truthy({discount: discount, shipping: shipping}));

    await this.outcomeAdd(content);
    await this.heartbeatState(3);
    await this.count(purchaseSting, price, SKUs, false, metadata.productNames, metadata.brands);
  }

  async purchaseCancel(SKUs = null, price = null, productNames = null, brands = null) {
    const metadata = new ProductMetadata(SKUs, productNames, brands).withSkus();
    const outcome = 'Canceled' + Fields.fallback(SKUs && ' - ' + SKUs, '');
    const content = {
      ...metadata,
      superOutcome: 'Customer Purchase',
      outcome: outcome,
      result: 'fail'
    };
    Object.assign(content, Fields.truthy({price: price}));
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

  async productKept(product, productName = null, brand = null) {
    const metadata = new ProductMetadata([product], productName, brand).values();
    const content = {
      ...metadata,
      superOutcome: 'Product Disposition',
      outcome: 'Kept - ' + product,
      result: 'success'
    };
    await this.outcomeAdd(content);
  }

  async productReturned(product, productName = null, brand = null) {
    const metadata = new ProductMetadata([product], productName, brand).values();
    const content = {
      ...metadata,
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
    Object.assign(event, Fields.truthy({details: detail}));
    await this.journeyAdd(event);
  }

  async featureCompleted(name, detail = null) {
    const event = {
      category: 'Feature',
      action: 'Completed',
      name: name
    };
    Object.assign(event, Fields.truthy({details: detail}));
    await this.journeyAdd(event);
  }

  async featureFailed(name, detail = null) {
    const event = {
      category: 'Feature',
      action: 'Failed',
      name: name
    };
    Object.assign(event, Fields.truthy({details: detail}));
    await this.journeyAdd(event);
  }

  async contentViewed(contentType, identifier = null) {
    const event = {
      category: 'Content',
      action: 'Viewed',
      type: contentType,
    };
    Object.assign(event, Fields.truthy({identifier: identifier}));
    await this.journeyAdd(event);
  }

  async contentEdited(contentType, identifier = null, detail = null) {
    const event = {
      category: 'Content',
      action: 'Edited',
      type: contentType,
    };
    Object.assign(event, Fields.truthy({identifier: identifier, details: detail}));
    await this.journeyAdd(event);
  }

  async contentCreated(contentType, identifier = null) {
    const event = {
      category: 'Content',
      action: 'Created',
      type: contentType,
    };
    Object.assign(event, Fields.truthy({identifier: identifier}));
    await this.journeyAdd(event);
  }

  async contentDeleted(contentType, identifier = null) {
    const event = {
      category: 'Content',
      action: 'Deleted',
      type: contentType,
    };
    Object.assign(event, Fields.truthy({identifier: identifier}));
    await this.journeyAdd(event);
  }

  async contentArchived(contentType, identifier = null) {
    const event = {
      category: 'Content',
      action: 'Archived',
      type: contentType,
    };
    Object.assign(event, Fields.truthy({identifier: identifier}));
    await this.journeyAdd(event);
  }

  async contentRequested(contentType, identifier = null) {
    const event = {
      category: 'Content',
      action: 'Requested',
      type: contentType,
    };
    Object.assign(event, Fields.truthy({identifier: identifier}));
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

  async count(outcome, value = 0.0, skus = null, surfaceErrors = false, productNames = null, brands = null) {
    const metadata = new ProductMetadata(skus, productNames, brands).values();
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
        platform: Fields.fallback(platform, null),
        skus: skus,
        ...metadata,
        value: value
      }
    };
    const replayLog = Fields.fallback(await retrieveSession('view-count-replay'), []);
    replayLog.push(params);
    await storeSession('view-count-replay', replayLog);
    return this.replayCounts(replayLog, surfaceErrors);
  }

  async replayCounts(replayLog, surfaceErrors) {
    try {
      return await this.sendCounts(replayLog);
    } catch (error) {
      return this.handleApiError(error, surfaceErrors);
    }
  }

  async sendCounts(replayLog) {
    let result = null;
    while (replayLog.length > 0) {
      result = await this.CountApi(this.countApiUrl).fetch(replayLog.shift());
      await storeSession('view-count-replay', replayLog);
    }
    return result;
  }

  handleApiError(error, surfaceErrors) {
    return surfaceErrors ? Promise.reject(error) : Promise.resolve(true);
  }

  async heartbeatState(stage = null) {
    const previousStage = await retrieveLocal('heartbeat_stage');
    await this.advanceHeartbeat(stage, previousStage);
    await this.initializeHeartbeat(stage, previousStage);
    return Number(await retrieveLocal('heartbeat_stage'));
  }

  async advanceHeartbeat(stage, previousStage) {
    if (Fields.all([() => stage, () => stage > previousStage])) {
      await storeLocal('heartbeat_stage', stage);
    }
  }

  async initializeHeartbeat(stage, previousStage) {
    if (![stage, previousStage].some(Boolean)) await storeLocal('heartbeat_stage', 0);
  }

  async commit(surfaceErrors = false) {
    const sampled = await this.sampleDecision();
    if (![sampled, !this.apiCallPending].every(Boolean)) return Promise.resolve(true);
    this.apiCallPending = true;
    const params = {data: await this.journeyData()};
    return this.sendJourney(this.JourneyApi(this.apiUrl), params, surfaceErrors);
  }

  async journeyData() {
    return {
      id: await this.id(), journey: await this.journey(), token: this.apiKey,
      timestamp: (new Date()).getTime() / 1000
    };
  }

  async sendJourney(api, params, surfaceErrors) {
    const saved = await this.reset();
    try {
      const value = await api.fetch(params);
      await this.finishHeartbeat(params);
      this.apiCallPending = false;
      return Promise.resolve(value);
    } catch (error) {
      await this.restore(saved);
      this.apiCallPending = false;
      return this.handleApiError(error, surfaceErrors);
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
    const data = {...await this.journeyData(), platform: Fields.fallback(platform, {}), tags: Fields.fallback(tags, [])};
    await this.addWatchdog(data);
    const sampled = await this.sampleDecision();
    if (![sampled, !this.apiCallPending].every(Boolean)) return Promise.resolve(true);
    this.apiCallPending = true;
    return this.sendJourney(this.HeartbeatApi(this.apiUrl), {data}, surfaceErrors);
  }

  async addWatchdog(data) {
    const heartbeatType = await retrieveLocal('heartbeat_type');
    if (heartbeatType) data.watchdog = await this.heartbeatMessage(heartbeatType);
  }

  async finishHeartbeat({data}) {
    if (!Fields.all([() => data.watchdog, () => Object.keys(data.watchdog).includes('remove')])) return;
    await resetLocal('heartbeat_stage');
    await resetLocal('heartbeat_type');
    await resetLocal('heartbeat_outcome');
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
    await this.storeId(id);
    id = await retrieveSession('xenon-view');
    if (!id) return await this.newId();
    return id;
  }

  async storeId(id) {
    if (id) await storeSession('xenon-view', id);
  }

  async newId() {
    await storeSession('xenon-view', crypto.randomUUID());
    return await retrieveSession('xenon-view');
  }

  async sampleDecision(decision = null, onApiKeyFailure = null) {
    await this.storeSampleDecision(decision);
    decision = await retrieveSession('xenon-will-sample');
    if ([null, ''].includes(decision)) return this.fetchSampleDecision(onApiKeyFailure);
    return Boolean(decision);
  }

  async storeSampleDecision(decision) {
    if (decision !== null) await storeSession('xenon-will-sample', decision);
  }

  async fetchSampleDecision(onApiKeyFailure) {
    const params = {data: {id: await this.id(), token: this.apiKey}};
    try {
      const json = await this.SampleApi(this.apiUrl).fetch(params);
      return await this.sampleDecision(json.sample, onApiKeyFailure);
    } catch (error) {
      return this.handleSampleError(error, onApiKeyFailure);
    }
  }

  async handleSampleError(error, onApiKeyFailure) {
    if ([error.authIssue, onApiKeyFailure].every(Boolean)) {
      onApiKeyFailure(error);
      return;
    }
    return this.sampleDecision(true, onApiKeyFailure);
  }

  async outcomeAdd(content) {
    Object.assign(content, Fields.truthy({
      platform: await retrieveSession('view-platform'), tags: await retrieveSession('view-tags')
    }));
    await this.journeyAdd(content);
  }

  async journeyAdd(content) {
    const journey = Fields.fallback(await this.journey(), []);
    content.timestamp = (new Date()).getTime() / 1000;
    Object.assign(content, Fields.truthy({url: this.pageURL_}));
    this.appendJourney(journey, content);
    await this.storeJourney(journey);
  }

  appendJourney(journey, content) {
    if (journey.length) return this.appendOrCount(journey, content);
    journey.push(content);
  }

  appendOrCount(journey, content) {
    const last = journey[journey.length - 1];
    if (!this.isDuplicate(last, content)) return journey.push(content);
    this.incrementJourney(last);
  }

  incrementJourney(last) {
    const count = Object.prototype.hasOwnProperty.call(last, 'count') ? last.count : 1;
    last.count = count + 1;
  }

  isDuplicate(last, content) {
    return Fields.all([
      () => Object.keys(content).every(key => Object.prototype.hasOwnProperty.call(last, key)),
      () => ['category', 'action'].every(key => Object.prototype.hasOwnProperty.call(content, key)),
      () => content.category === last.category,
      () => content.action === last.action,
      () => Fields.any([
        () => this.duplicateFeature(last, content),
        () => this.duplicateContent(last, content),
        () => this.duplicateMilestone(last, content)
      ])
    ]);
  }

  duplicateFeature(last, content) {
    return Fields.all([
      () => [content.category, last.category].every(category => category === 'Feature'),
      () => content.name === last.name
    ]);
  }

  duplicateContent(last, content) {
    return Fields.all([
      () => [content.category, last.category].every(category => category === 'Content'),
      () => this.matchContentFields(last, content, ['type', 'identifier', 'details'])
    ]);
  }

  matchContentFields(last, content, keys) {
    if (!keys.length) return true;
    return this.matchContentField(last, content, keys);
  }

  matchContentField(last, content, [key, ...remaining]) {
    if (![last, content].some(value => Object.prototype.hasOwnProperty.call(value, key))) return true;
    return Fields.all([() => last[key] === content[key], () => this.matchContentFields(last, content, remaining)]);
  }

  duplicateMilestone(last, content) {
    return Fields.all([
      () => ![content.category, last.category].some(category => ['Feature', 'Content'].includes(category)),
      () => content.name === last.name,
      () => content.details === last.details
    ]);
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
    let restoreJourney = Fields.fallback(journey, this.restoreJourney);
    if (Fields.fallback(currentJourney, []).length) {
      restoreJourney = restoreJourney.concat(currentJourney);
    }

    function compare(a, b) {
      return Math.sign(a.timestamp - b.timestamp);
    }

    restoreJourney.sort(compare);
    await this.storeJourney(restoreJourney);
    this.restoreJourney = [];
  }

  hasClassInHierarchy(target, className, maxDepth) {
    if (maxDepth <= 0) return false;
    return this.findClassInHierarchy(target, className, maxDepth);
  }

  findClassInHierarchy(target, className, remainingDepth) {
    if (target.className.toString().includes(className)) return true;
    return this.findClassInParent(target.parentElement, className, remainingDepth - 1);
  }

  findClassInParent(parent, className, remainingDepth) {
    if (!parent) return false;
    return this.hasClassInHierarchy(parent, className, remainingDepth);
  }

  async decipherParamsPerLibrary(params) {
    if (params.has('xenon_euid')) await this.id(params.get('xenon_euid'));
    return new Attribution(params).values();
  }

  async autodiscoverLeadFrom(queryFromUrl) {
    if (Fields.all([() => queryFromUrl, () => queryFromUrl !== '?'])) return this.discoverQuery(queryFromUrl);
    return this.discoverUnattributed(queryFromUrl);
  }

  async discoverQuery(queryFromUrl) {
    const params = new URLSearchParams(queryFromUrl);
    const [source, identifier] = await this.decipherParamsPerLibrary(params);
    if (await retrieveSession('view-attribution')) return queryFromUrl;
    await this.saveAttribution(source, identifier);
    ['xenonId', 'xenonSrc', 'xenon_euid'].forEach(key => params.delete(key));
    return this.remainingQuery(params);
  }

  remainingQuery(params) {
    return params.size ? '?' + params.toString() : '';
  }

  async discoverUnattributed(queryFromUrl) {
    if (await retrieveSession('view-attribution')) return queryFromUrl;
    await this.saveAttribution('Unattributed', null);
    return queryFromUrl;
  }

  async saveAttribution(source, identifier) {
    await storeSession('view-attribution', {leadSource: source, leadCampaign: identifier, leadGuid: null});
    const variantNames = Fields.fallback(await retrieveSession('view-tags'), []);
    if (Fields.all([() => source, () => !variantNames.includes(source)])) {
      await this.tagAttribution(variantNames, source, identifier);
    }
  }

  async tagAttribution(variantNames, source, identifier) {
    await this.variant([...variantNames, source, ...[identifier].filter(Boolean)]);
    if (source === 'Unattributed') return this.leadUnattributed();
    return this.leadAttributed(source, identifier);
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
    return platform;
  }
}
