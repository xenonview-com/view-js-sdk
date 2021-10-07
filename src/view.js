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

export class _View {
  constructor(apiKey, apiUrl = 'https://app.xenonview.com',
              journeyApi = JourneyApi) {
    let journey = this.journey();
    if (!journey) {
      journey = [{
        category: 'Landing',
        action: 'New session started'
      }];
    }
    this.storeJourney(journey);
    this.restoreJourney = null;
    this.JourneyApi = journeyApi;
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

  storeJourney(journey) {
    localStorage.setItem('view-journey', JSON.stringify(journey));
  }

  journey() {
    let journey = JSON.parse(localStorage.getItem('view-journey'));
    return journey;
  }

  reset() {
    this.restoreJourney = this.journey();
    localStorage.removeItem('view-journey');
  }

  restore() {
    let currentJourney = this.journey();
    let restoreJourney = this.restoreJourney;
    if (currentJourney && currentJourney.length) restoreJourney = restoreJourney.concat(currentJourney);
    this.storeJourney(restoreJourney);
    this.restoreJourney = null;
  }
}
