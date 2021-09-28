/**
 * Created by lwoydziak on 09/27/21.
 */
/**
 * view.js
 *
 * SDK for interacting with the Xenon View service.
 *
 */
class View {
  constructor() {
    let journey = this.journey();
    if (!journey) {
      journey = [{
        category: 'Landing',
        action: 'New session started'
      }];
    }
    this.storeJourney(journey);
    this.restoreJourney = null;
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
    this.restoreJourney = null;
    this.storeJourney(journey);
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
    this.storeJourney(this.restoreJourney);
    this.restoreJourney = null;
  }
}

export default View;