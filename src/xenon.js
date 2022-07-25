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
import DeanonApi from "./api/deanonymize";
import {resetLocal, retrieveLocal, retrieveSession, storeLocal, storeSession} from "./storage/storage";

export class _Xenon {
  constructor(apiKey, apiUrl = 'https://app.xenonview.com',
              journeyApi = JourneyApi, deanonApi = DeanonApi) {
    let discoveredId = this.id()
    if (!discoveredId || discoveredId === '') {
        storeSession('xenon-view', crypto.randomUUID())
    }
    let journey = this.journey();
    if (!journey) {
      this.event({
        category: 'Landing',
        action: 'New session started'
      });
    }
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

  funnel(stage, action) {
    let content = {
      funnel: stage,
      action: action,
    };
    this.journeyAdd(content);
  }

  outcome(name, action) {
    let content = {
      outcome: name,
      action: action,
    };
    this.journeyAdd(content);
  }

  event(event) {
    let keys = Object.keys(event);
    if (!keys.includes('action')) {
      event = {action: event};
    }
    if (!keys.includes('category') && !keys.includes('funnel') && !keys.includes('outcome')  ){
      event.category = 'Event';
    }
    this.journeyAdd(event);
  }

  id(id){
    if (id) {
        storeSession('xenon-view', id)
    }
    return retrieveSession('xenon-view');
  }

  journeyAdd(content) {
    let journey = this.journey();
    content.timestamp = (new Date()).getTime()/1000;
    if (journey) {
      let last = journey[journey.length - 1];
      if ((last.hasOwnProperty('funnel') && content.hasOwnProperty('funnel')) ||
        (last.hasOwnProperty('category') && content.hasOwnProperty('category'))) {
        if (last.action !== content.action) {
          journey.push(content);
        } else {
          let count = last.hasOwnProperty('count') ? last['count'] : 1;
          last['count'] = count+1;
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
        token: this.apiKey,
        timestamp: (new Date()).getTime()/1000
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
        token: this.apiKey,
        timestamp: (new Date()).getTime()/1000
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
