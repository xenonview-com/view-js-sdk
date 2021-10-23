/**
 * Created by lwoydziak on 09/27/21.
 */
/**
 * view.js
 *
 * SDK for interacting with the Xenon View service.
 *
 */
import JourneyApi from "./api/journey";
import {resetLocal, retrieveLocal, retrieveSession, storeLocal, storeSession} from "./storage/storage";

export class _View {
  constructor(apiKey, apiUrl = 'https://app.xenonview.com',
              journeyApi = JourneyApi, deanonApi = null) {
    storeSession('xenon-view', crypto.randomUUID())
    let journey = this.journey();
    if (!journey) {
      journey = [{
        category: 'Landing',
        action: 'New session started'
      }];
    }
    this.storeJourney(journey);
    this.restoreJourney = [];
    this.JourneyApi = journeyApi;
    this.DeanonApi = deanonApi;
    this.init(apiKey, apiUrl);
  }

  init(apiKey, apiUrl = 'https://app.xenonview.com'){
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  pageView(page) {
    let content = {
      category: 'Page View',
      action: page,
    };
    this.journeyAdd(content);
  }

  event(event) {
    this.journeyAdd(event);
  }

  id(){
    return retrieveSession('xenon-view');
  }

  journeyAdd(content) {
    let journey = this.journey();
    if (journey) {
      let last = journey[journey.length - 1];
      if ((last.hasOwnProperty('funnel') && content.hasOwnProperty('funnel')) ||
        (last.hasOwnProperty('category') && content.hasOwnProperty('category'))) {
        if (last.action !== content.action) {
          journey.push(content);
        }
      } else {
        journey.push(content);
      }
    } else {
      journey = [content];
    }
    this.storeJourney(journey);
  }

  commit() {
    let params = {
      data: {
        id: this.id(),
        journey: this.journey(),
        token: this.apiKey
      }
    };
    this.reset();
    return this.JourneyApi(this.apiUrl)
      .fetch(params)
      .catch((err) =>{
        this.restore();
      });
  }

  deanonymize(person){
    let params = {
      data: {
        id: this.id(),
        person: person,
        token: this.apiKey
      }
    };
    return this.DeanonApi(this.apiUrl)
      .fetch(params);
  }

  storeJourney(journey) {
    storeLocal('view-journey', journey);
  }

  journey() {
    return retrieveLocal('view-journey');
  }

  reset() {
    this.restoreJourney = this.journey();
    resetLocal('view-journey');
  }

  restore() {
    let currentJourney = this.journey();
    let restoreJourney = this.restoreJourney;
    if (currentJourney && currentJourney.length) restoreJourney = restoreJourney.concat(currentJourney);
    this.storeJourney(restoreJourney);
    this.restoreJourney = [];
  }
}
