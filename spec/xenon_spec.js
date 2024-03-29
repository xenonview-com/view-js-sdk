/**
 * Created by lwoydziak on 09/27/21.
 */
/**
 * xenon_spec.js
 *
 * Testing: SDK for interacting with the Xenon View service.
 *
 */
import {_Xenon} from '../src/xenon';
import './helper/api_helper';
import {UnblockPromises} from './helper/api_helper';
import {retrieveLocal} from "../src/storage/storage";



describe('View SDK', () => {
  let unit = null;
  let unit2 = null;
  let journeyApi = jasmine.createSpyObj('MyJourneyApi', ['fetch']);
  let JourneyApi = jasmine.createSpy('constructor').and.returnValue(journeyApi);
  let deanonApi = jasmine.createSpyObj('MyDeanonApi', ['fetch']);
  let DeanonApi = jasmine.createSpy('constructor').and.returnValue(deanonApi);
  let heartbeatApi = jasmine.createSpyObj('MyHeartbeatApi', ['fetch']);
  let HeartbeatApi = jasmine.createSpy('constructor').and.returnValue(heartbeatApi);
  let apiKey = '<token>';
  let apiUrl = 'https://localhost';
  // Platforming, Tagging and Init tests
  describe('when initialized', () => {
    it('then has default journey', () => {
      expect(unit.journey()).toEqual([]);
    });
    it('then has default id', () => {
      expect(unit.id()).not.toBeNull();
      expect(unit.id()).not.toEqual('');
    });
    it('then has default id when storage cleared', () => {
      sessionStorage.removeItem('xenon-view');
      expect(unit.id()).not.toBeNull();
      expect(unit.id()).not.toEqual('');
    });
    describe('when id set', () => {
      let testId = '<some random uuid>';
      beforeEach(() => {
        unit.id(testId);
      });
      it('then has set id', () => {
        expect(unit.id()).toEqual(testId);
      });
      it('then persists id', () => {
        expect(sessionStorage.getItem('xenon-view')).toEqual(JSON.stringify(testId));
      });
    });
  });
  describe('when initialized and previous journey', () => {
    it('then has previous journey', () => {
      let journeyStr = JSON.stringify(unit.journey()[0]);
      expect(journeyStr).toContain('{"superOutcome":"Lead Capture","outcome":"Phone Number","result":"success","timestamp":');
    });
    beforeEach(() => {
      unit.leadCaptured('Phone Number');
      unit = new _Xenon();
    });
  });
  describe('when initialized with a previous id', () => {
    let testId = '<some random uuid>';
    it('then has previous id', () => {
      expect(unit.id()).toEqual(testId);
    });
    beforeEach(() => {
      unit.id(testId);
      unit = new _Xenon();
    });
  });
  describe('when regenerating an ID', () => {
    let previousId = null;
    it('then has previous id', () => {
      expect(unit.id()).not.toEqual(previousId);
    });
    beforeEach(() => {
      previousId = unit.id();
      unit = new _Xenon();
      unit.newId();
    });
  });
  describe('when adding outcome after platform reset', () => {
    it('then journey doesn\'t contain platform', () => {
      const journey = unit.journey()[0];
      expect(Object.keys(journey)).not.toContain('platform')
    });
    beforeEach(() => {
      const softwareVersion = '5.1.5';
      const deviceModel = 'Pixel 4 XL';
      const operatingSystemName = 'Android';
      const operatingSystemVersion = '12.0';
      unit.platform(softwareVersion, deviceModel, operatingSystemName, operatingSystemVersion);
      unit.removePlatform();
      unit.applicationInstalled()
    });
  });
  describe('when adding outcome after platform set', () => {
    it('then journey contains platform', () => {
      const journey = unit.journey()[0];
      expect(journey.platform.softwareVersion).toEqual('5.1.5');
      expect(journey.platform.deviceModel).toEqual('Pixel 4 XL');
      expect(journey.platform.operatingSystemName).toEqual('Android');
      expect(journey.platform.operatingSystemVersion).toEqual('12.0');
    });
    beforeEach(() => {
      const softwareVersion = '5.1.5';
      const deviceModel = 'Pixel 4 XL';
      const operatingSystemName = 'Android';
      const operatingSystemVersion = '12.0';
      unit.platform(softwareVersion, deviceModel, operatingSystemName, operatingSystemVersion);
      unit.applicationInstalled()
    });
  });
  describe('when adding outcome after tags reset', () => {
    it('then journey doesn\'t contain tags', () => {
      const journey = unit.journey()[0];
      expect(Object.keys(journey)).not.toContain('tags')
    });
    beforeEach(() => {
      const tags = ['tag'];
      unit.variant(tags);
      unit.resetVariants();
      unit.applicationInstalled()
    });
  });
  describe('when adding outcome after tags', () => {
    it('then journey contains tags', () => {
      const journey = unit.journey()[0];
      expect(journey.tags).toEqual(['tag'])
    });
    beforeEach(() => {
      const tags = ['tag'];
      unit.variant(tags);
      unit.applicationInstalled()
    });
    afterEach(() => {
      unit.resetVariants()
    });
  });
  // Stock Business Outcomes tests
  describe('when leadAttributed', () => {
    const source = 'Google Ad';
    const identifier = 'Search';
    describe('when has id', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.superOutcome).toEqual('Lead Attributed');
        expect(journey.outcome).toEqual(source);
        expect(journey.id).toEqual(identifier);
        expect(journey.result).toEqual('success');
      });
      beforeEach(() => {
        unit.leadAttributed(source, identifier)
      });
    });
    describe('when no id', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.superOutcome).toEqual('Lead Attributed');
        expect(journey.outcome).toEqual(source);
        expect(journey.result).toEqual('success');
      });
      beforeEach(() => {
        unit.leadAttributed(source)
      });
    });
  });
  describe('when leadCaptured', () => {
    const phone = 'Phone Number';
    it('then creates journey with outcome', () => {
      const journey = unit.journey()[0];
      expect(journey.superOutcome).toEqual('Lead Capture');
      expect(journey.outcome).toEqual(phone);
      expect(journey.result).toEqual('success');
    });
    beforeEach(() => {
      unit.leadCaptured(phone)
    });
  });
  describe('when leadCaptureDeclined', () => {
    const phone = 'Phone Number';
    it('then creates journey with outcome', () => {
      const journey = unit.journey()[0];
      expect(journey.superOutcome).toEqual('Lead Capture');
      expect(journey.outcome).toEqual(phone);
      expect(journey.result).toEqual('fail');
    });
    beforeEach(() => {
      unit.leadCaptureDeclined(phone)
    });
  });
  describe('when accountSignup', () => {
    const viaFacebook = 'Facebook';
    it('then creates journey with outcome', () => {
      const journey = unit.journey()[0];
      expect(journey.superOutcome).toEqual('Account Signup');
      expect(journey.outcome).toEqual(viaFacebook);
      expect(journey.result).toEqual('success');
    });
    beforeEach(() => {
      unit.accountSignup(viaFacebook)
    });
  });
  describe('when accountSignupDeclined', () => {
    const viaFacebook = 'Facebook';
    it('then creates journey with outcome', () => {
      const journey = unit.journey()[0];
      expect(journey.superOutcome).toEqual('Account Signup');
      expect(journey.outcome).toEqual(viaFacebook);
      expect(journey.result).toEqual('fail');
    });
    beforeEach(() => {
      unit.accountSignupDeclined(viaFacebook)
    });
  });
  describe('when applicationInstalled', () => {
    it('then creates journey with outcome', () => {
      const journey = unit.journey()[0];
      expect(journey.superOutcome).toEqual('Application Installation');
      expect(journey.outcome).toEqual('Installed');
      expect(journey.result).toEqual('success');
    });
    beforeEach(() => {
      unit.applicationInstalled()
    });
  });
  describe('when applicationNotInstalled', () => {
    it('then creates journey with outcome', () => {
      const journey = unit.journey()[0];
      expect(journey.superOutcome).toEqual('Application Installation');
      expect(journey.outcome).toEqual('Not Installed');
      expect(journey.result).toEqual('fail');
    });
    beforeEach(() => {
      unit.applicationNotInstalled()
    });
  });
  describe('when initialSubscription', () => {
    const tierSilver = 'Silver Monthly';
    const method = 'Stripe'; // optional
    const price = '$25'; // optional
    const term = '30d'; // optional
    describe('when has method, price and term', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.term).toEqual(term);
      });
      beforeEach(() => {
        unit.initialSubscription(tierSilver, method, price, term)
      });
    });
    describe('when has method and price', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.price).toEqual(price);
      });
      beforeEach(() => {
        unit.initialSubscription(tierSilver, method, price)
      });
    });
    describe('when has method', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.method).toEqual(method);
      });
      beforeEach(() => {
        unit.initialSubscription(tierSilver, method)
      });
    });
    describe('when no method', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.superOutcome).toEqual('Initial Subscription');
        expect(journey.outcome).toEqual('Subscribe - ' + tierSilver);
        expect(journey.result).toEqual('success');
      });
      beforeEach(() => {
        unit.initialSubscription(tierSilver)
      });
    });
  });
  describe('when subscriptionDeclined', () => {
    const tierSilver = 'Silver Monthly';
    const method = 'Stripe'; // optional
    const price = '$25'; // optional
    const term = '30d'; // optional
    describe('when has method, price, and term', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.term).toEqual(term);
      });
      beforeEach(() => {
        unit.subscriptionDeclined(tierSilver, method, price, term)
      });
    });
    describe('when has method and price', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.price).toEqual(price);
      });
      beforeEach(() => {
        unit.subscriptionDeclined(tierSilver, method, price)
      });
    });
    describe('when has method', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.method).toEqual(method);
      });
      beforeEach(() => {
        unit.subscriptionDeclined(tierSilver, method)
      });
    });
    describe('when no method', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.superOutcome).toEqual('Initial Subscription');
        expect(journey.outcome).toEqual('Decline - ' + tierSilver);
        expect(journey.result).toEqual('fail');
      });
      beforeEach(() => {
        unit.subscriptionDeclined(tierSilver)
      });
    });
  });
  describe('when subscriptionRenewed', () => {
    const tierSilver = 'Silver Monthly';
    const method = 'Stripe'; // optional
    const price = '$25'; // optional
    const term = '30d'; // optional

    describe('when has method, price and term', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.term).toEqual(term);
      });
      beforeEach(() => {
        unit.subscriptionRenewed(tierSilver, method, price, term)
      });
    });
    describe('when has method and price', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.price).toEqual(price);
      });
      beforeEach(() => {
        unit.subscriptionRenewed(tierSilver, method, price)
      });
    });
    describe('when has method', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.method).toEqual(method);
      });
      beforeEach(() => {
        unit.subscriptionRenewed(tierSilver, method)
      });
    });
    describe('when no method', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.superOutcome).toEqual('Subscription Renewal');
        expect(journey.outcome).toEqual('Renew - ' + tierSilver);
        expect(journey.result).toEqual('success');
      });
      beforeEach(() => {
        unit.subscriptionRenewed(tierSilver)
      });
    });

  });
  describe('when subscriptionPaused', () => {
    const tierSilver = 'Silver Monthly';
    const method = 'Stripe'; // optional
    const price = '$25'; // optional
    const term = '30d'; // optional

    describe('when has method, price, and term', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.term).toEqual(term);
      });
      beforeEach(() => {
        unit.subscriptionPaused(tierSilver, method, price, term)
      });
    });
    describe('when has method and price', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.price).toEqual(price);
      });
      beforeEach(() => {
        unit.subscriptionPaused(tierSilver, method, price)
      });
    });
    describe('when has method', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.method).toEqual(method);
      });
      beforeEach(() => {
        unit.subscriptionPaused(tierSilver, method)
      });
    });
    describe('when no method', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.superOutcome).toEqual('Subscription Renewal');
        expect(journey.outcome).toEqual('Paused - ' + tierSilver);
        expect(journey.result).toEqual('fail');
      });
      beforeEach(() => {
        unit.subscriptionPaused(tierSilver)
      });
    });
  });
  describe('when subscriptionCanceled', () => {
    const tierSilver = 'Silver Monthly';
    const method = 'Stripe'; // optional
    const price = '$25'; // optional
    const term = '30d'; // optional

    describe('when has method, price, and term', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.term).toEqual(term);
      });
      beforeEach(() => {
        unit.subscriptionCanceled(tierSilver, method, price, term)
      });
    });
    describe('when has method and price', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.price).toEqual(price);
      });
      beforeEach(() => {
        unit.subscriptionCanceled(tierSilver, method, price)
      });
    });
    describe('when has method', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.method).toEqual(method);
      });
      beforeEach(() => {
        unit.subscriptionCanceled(tierSilver, method)
      });
    });
    describe('when no method', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.superOutcome).toEqual('Subscription Renewal');
        expect(journey.outcome).toEqual('Cancel - ' + tierSilver);
        expect(journey.result).toEqual('fail');
      });
      beforeEach(() => {
        unit.subscriptionCanceled(tierSilver)
      });
    });

  });
  describe('when subscriptionUpsold', () => {
    const tierSilver = 'Silver Monthly';
    const method = 'Stripe'; // optional
    const price = '$25'; // optional
    const term = '30d'; // optional
    describe('when has method, price and term', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.term).toEqual(term);
      });
      beforeEach(() => {
        unit.subscriptionUpsold(tierSilver, method, price, term)
      });
    });
    describe('when has method and price', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.price).toEqual(price);
      });
      beforeEach(() => {
        unit.subscriptionUpsold(tierSilver, method, price)
      });
    });
    describe('when has method', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.method).toEqual(method);
      });
      beforeEach(() => {
        unit.subscriptionUpsold(tierSilver, method)
      });
    });
    describe('when no method', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.superOutcome).toEqual('Subscription Upsold');
        expect(journey.outcome).toEqual('Upsold - ' + tierSilver);
        expect(journey.result).toEqual('success');
      });
      beforeEach(() => {
        unit.subscriptionUpsold(tierSilver)
      });
    });
  });
  describe('when subscriptionUpsellDeclined', () => {
    const tierSilver = 'Silver Monthly';
    const method = 'Stripe'; // optional
    const price = '$25'; // optional
    const term = '30d'; // optional

    describe('when has method, price and term', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.term).toEqual(term);
      });
      beforeEach(() => {
        unit.subscriptionUpsellDeclined(tierSilver, method, price, term);
      });
    });
    describe('when has method, and price', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.price).toEqual(price);
      });
      beforeEach(() => {
        unit.subscriptionUpsellDeclined(tierSilver, method, price);
      });
    });
    describe('when has method', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.method).toEqual(method);
      });
      beforeEach(() => {
        unit.subscriptionUpsellDeclined(tierSilver, method);
      });
    });
    describe('when no method', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.superOutcome).toEqual('Subscription Upsold');
        expect(journey.outcome).toEqual('Declined - ' + tierSilver);
        expect(journey.result).toEqual('fail');
      });
      beforeEach(() => {
        unit.subscriptionUpsellDeclined(tierSilver);
      });
    });

  });
  describe('when subscriptionDownsell', () => {
    const tierSilver = 'Silver Monthly';
    const method = 'Stripe'; // optional
    const price = '$25'; // optional
    const term = '30d'; // optional
    describe('when has method, price and term', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.term).toEqual(term);
      });
      beforeEach(() => {
        unit.subscriptionDownsell(tierSilver, method, price, term);
      });
    });
    describe('when has method and price', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.price).toEqual(price);
      });
      beforeEach(() => {
        unit.subscriptionDownsell(tierSilver, method, price);
      });
    });
    describe('when has method', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.method).toEqual(method);
      });
      beforeEach(() => {
        unit.subscriptionDownsell(tierSilver, method);
      });
    });
    describe('when no method', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.superOutcome).toEqual('Subscription Upsold');
        expect(journey.outcome).toEqual('Downsell - ' + tierSilver);
        expect(journey.result).toEqual('fail');
      });
      beforeEach(() => {
        unit.subscriptionDownsell(tierSilver);
      });
    });
  });
  describe('when adCicked', () => {
    const provider = 'AdMob';
    const id = 'ID-1234'; // optional
    const price = '$0.225'; // optional

    describe('when has id and price', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.superOutcome).toEqual('Advertisement');
        expect(journey.outcome).toEqual('Ad Click - ' + provider);
        expect(journey.result).toEqual('success');
        expect(journey.id).toEqual(id);
        expect(journey.price).toEqual(price);
      });
      beforeEach(() => {
        unit.adClicked(provider, id, price);
      });
    });
    describe('when has id', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.superOutcome).toEqual('Advertisement');
        expect(journey.outcome).toEqual('Ad Click - ' + provider);
        expect(journey.result).toEqual('success');
        expect(journey.id).toEqual(id);
      });
      beforeEach(() => {
        unit.adClicked(provider, id);
      });
    });
    describe('when no method', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.superOutcome).toEqual('Advertisement');
        expect(journey.outcome).toEqual('Ad Click - ' + provider);
        expect(journey.result).toEqual('success');
      });
      beforeEach(() => {
        unit.adClicked(provider);
      });
    });
  });
  describe('when adIgnored', () => {
    const provider = 'AdMob';
    const id = 'ID-1234'; // optional
    const price = '$0.225'; // optional

    describe('when has id and price', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.superOutcome).toEqual('Advertisement');
        expect(journey.outcome).toEqual('Ad Ignored - ' + provider);
        expect(journey.result).toEqual('fail');
        expect(journey.id).toEqual(id);
        expect(journey.price).toEqual(price);
      });
      beforeEach(() => {
        unit.adIgnored(provider, id, price);
      });
    });
    describe('when has id', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.superOutcome).toEqual('Advertisement');
        expect(journey.outcome).toEqual('Ad Ignored - ' + provider);
        expect(journey.result).toEqual('fail');
        expect(journey.id).toEqual(id);
      });
      beforeEach(() => {
        unit.adIgnored(provider, id);
      });
    });
    describe('when no method', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.superOutcome).toEqual('Advertisement');
        expect(journey.outcome).toEqual('Ad Ignored - ' + provider);
        expect(journey.result).toEqual('fail');
      });
      beforeEach(() => {
        unit.adIgnored(provider);
      });
    });
  });
  describe('when referral', () => {
    const kind = 'Share';
    const detail = 'Review'; // optional
    describe('when has detail', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.superOutcome).toEqual('Referral');
        expect(journey.outcome).toEqual('Referred - ' + kind);
        expect(journey.result).toEqual('success');
      });
      beforeEach(() => {
        unit.referral(kind, detail)
      });
    });
    describe('when no detail', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.superOutcome).toEqual('Referral');
        expect(journey.outcome).toEqual('Referred - ' + kind);
        expect(journey.result).toEqual('success');
      });
      beforeEach(() => {
        unit.referral(kind)
      });
    });

  });
  describe('when referralDeclined', () => {
    const kind = 'Share';
    const detail = 'Review'; // optional
    describe('when has detail', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.superOutcome).toEqual('Referral');
        expect(journey.outcome).toEqual('Declined - ' + kind);
        expect(journey.result).toEqual('fail');
      });
      beforeEach(() => {
        unit.referralDeclined(kind, detail)
      });
    });
    describe('when no detail', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.superOutcome).toEqual('Referral');
        expect(journey.outcome).toEqual('Declined - ' + kind);
        expect(journey.result).toEqual('fail');
      });
      beforeEach(() => {
        unit.referralDeclined(kind)
      });
    });

  });
  // Ecommerce Related Outcomes tests
  describe('when productAddedToCart', () => {
    const laptop = 'Dell XPS';
    it('then creates journey with outcome', () => {
      const journey = unit.journey()[0];
      expect(journey.superOutcome).toEqual('Add Product To Cart');
      expect(journey.outcome).toEqual('Add - ' + laptop);
      expect(journey.result).toEqual('success');
    });
    beforeEach(() => {
      unit.productAddedToCart(laptop)
    });
  });
  describe('when productNotAddedToCart', () => {
    const laptop = 'Dell XPS';
    it('then creates journey with outcome', () => {
      const journey = unit.journey()[0];
      expect(journey.superOutcome).toEqual('Add Product To Cart');
      expect(journey.outcome).toEqual('Ignore - ' + laptop);
      expect(journey.result).toEqual('fail');
    });
    beforeEach(() => {
      unit.productNotAddedToCart(laptop)
    });
  });
  describe('when upsold', () => {
    const laptop = 'Dell XPS';
    const price = '$25'; // optional

    describe('when has price', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.superOutcome).toEqual('Upsold Product');
        expect(journey.outcome).toEqual('Upsold - ' + laptop);
        expect(journey.result).toEqual('success');
        expect(journey.price).toEqual(price);
      });
      beforeEach(() => {
        unit.upsold(laptop, price)
      });
    });
    describe('when no price', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.superOutcome).toEqual('Upsold Product');
        expect(journey.outcome).toEqual('Upsold - ' + laptop);
        expect(journey.result).toEqual('success');
      });
      beforeEach(() => {
        unit.upsold(laptop)
      });
    });
  });
  describe('when upsellDismissed', () => {
    const laptop = 'Dell XPS';
    const price = '$25'; // optional

    describe('when price', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.superOutcome).toEqual('Upsold Product');
        expect(journey.outcome).toEqual('Dismissed - ' + laptop);
        expect(journey.result).toEqual('fail');
        expect(journey.price).toEqual(price);
      });
      beforeEach(() => {
        unit.upsellDismissed(laptop, price)
      });
    });
    describe('when no price', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.superOutcome).toEqual('Upsold Product');
        expect(journey.outcome).toEqual('Dismissed - ' + laptop);
        expect(journey.result).toEqual('fail');
      });
      beforeEach(() => {
        unit.upsellDismissed(laptop)
      });
    });
  });
  describe('when checkOut', () => {
    it('then creates journey with outcome', () => {
      const journey = unit.journey()[0];
      expect(journey.superOutcome).toEqual('Customer Checkout');
      expect(journey.outcome).toEqual('Check Out');
      expect(journey.result).toEqual('success');
    });
    beforeEach(() => {
      unit.checkOut()
    });
  });
  describe('when checkoutCanceled', () => {
    it('then creates journey with outcome', () => {
      const journey = unit.journey()[0];
      expect(journey.superOutcome).toEqual('Customer Checkout');
      expect(journey.outcome).toEqual('Canceled');
      expect(journey.result).toEqual('fail');
    });
    beforeEach(() => {
      unit.checkoutCanceled()
    });
  });
  describe('when productRemoved', () => {
    const laptop = 'Dell XPS';
    it('then creates journey with outcome', () => {
      const journey = unit.journey()[0];
      expect(journey.superOutcome).toEqual('Customer Checkout');
      expect(journey.outcome).toEqual('Product Removed - ' + laptop);
      expect(journey.result).toEqual('fail');
    });
    beforeEach(() => {
      unit.productRemoved(laptop)
    });
  });
  describe('when purchased', () => {
    const SKUs = '12345, 6789-b';
    const price = '$25'; // optional
    describe('when price', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.superOutcome).toEqual('Customer Purchase');
        expect(journey.outcome).toEqual('Purchase - ' + SKUs);
        expect(journey.result).toEqual('success');
        expect(journey.price).toEqual(price);
      });
      beforeEach(() => {
        unit.purchase(SKUs, price)
      });
    });
    describe('when no price', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.superOutcome).toEqual('Customer Purchase');
        expect(journey.outcome).toEqual('Purchase - ' + SKUs);
        expect(journey.result).toEqual('success');
      });
      beforeEach(() => {
        unit.purchase(SKUs)
      });
    });
  });
  describe('when purchaseCanceled', () => {
    const SKUs = '12345, 6789-b';
    const price = '$25'; // optional

    describe('when SKUs and price', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.superOutcome).toEqual('Customer Purchase');
        expect(journey.outcome).toEqual('Canceled - ' + SKUs);
        expect(journey.result).toEqual('fail');
        expect(journey.price).toEqual(price);
      });
      beforeEach(() => {
        unit.purchaseCancel(SKUs, price)
      });
    });
    describe('when SKUs', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.superOutcome).toEqual('Customer Purchase');
        expect(journey.outcome).toEqual('Canceled - ' + SKUs);
        expect(journey.result).toEqual('fail');
      });
      beforeEach(() => {
        unit.purchaseCancel(SKUs)
      });
    });
    describe('when without SKUs', () => {
      it('then creates journey with outcome', () => {
        const journey = unit.journey()[0];
        expect(journey.superOutcome).toEqual('Customer Purchase');
        expect(journey.outcome).toEqual('Canceled');
        expect(journey.result).toEqual('fail');
      });
      beforeEach(() => {
        unit.purchaseCancel()
      });
    });
  });
  describe('when promiseFulfilled', () => {
    it('then creates journey with outcome', () => {
      const journey = unit.journey()[0];
      expect(journey.superOutcome).toEqual('Promise Fulfillment');
      expect(journey.outcome).toEqual('Fulfilled');
      expect(journey.result).toEqual('success');
    });
    beforeEach(() => {
      unit.promiseFulfilled()
    });
  });
  describe('when promiseUnfulfilled', () => {
    it('then creates journey with outcome', () => {
      const journey = unit.journey()[0];
      expect(journey.superOutcome).toEqual('Promise Fulfillment');
      expect(journey.outcome).toEqual('Unfulfilled');
      expect(journey.result).toEqual('fail');
    });
    beforeEach(() => {
      unit.promiseUnfulfilled()
    });
  });
  describe('when productKept', () => {
    const laptop = 'Dell XPS';
    it('then creates journey with outcome', () => {
      const journey = unit.journey()[0];
      expect(journey.superOutcome).toEqual('Product Disposition');
      expect(journey.outcome).toEqual('Kept - ' + laptop);
      expect(journey.result).toEqual('success');
    });
    beforeEach(() => {
      unit.productKept(laptop)
    });
  });
  describe('when productReturned', () => {
    const laptop = 'Dell XPS';
    it('then creates journey with outcome', () => {
      const journey = unit.journey()[0];
      expect(journey.superOutcome).toEqual('Product Disposition');
      expect(journey.outcome).toEqual('Returned - ' + laptop);
      expect(journey.result).toEqual('fail');
    });
    beforeEach(() => {
      unit.productReturned(laptop)
    });
  });
  // Stock Milestones tests
  describe('when featureAttempted', () => {
    const name = 'Scale Recipe';
    const detail = 'x2'; // optional
    describe('when has detail', () => {
      it('then has a milestone', () => {
        const journey = unit.journey()[0];
        expect(journey.category).toEqual('Feature');
        expect(journey.action).toEqual('Attempted');
        expect(journey.name).toEqual(name);
        expect(journey.details).toEqual(detail);
      });
      beforeEach(() => {
        unit.featureAttempted(name, detail);
      });
    });
    describe('when has no detail', () => {
      it('then has a milestone', () => {
        const journey = unit.journey()[0];
        expect(journey.category).toEqual('Feature');
        expect(journey.action).toEqual('Attempted');
        expect(journey.name).toEqual(name);
        expect(journey.details).toBe(undefined);
      });
      beforeEach(() => {
        unit.featureAttempted(name);
      });
    });

  });
  describe('when featureCompleted', () => {
    const name = 'Scale Recipe';
    const detail = 'x2'; // optional
    describe('when has detail', () => {
      it('then has a milestone', () => {
        const journey = unit.journey()[0];
        expect(journey.category).toEqual('Feature');
        expect(journey.action).toEqual('Completed');
        expect(journey.name).toEqual(name);
        expect(journey.details).toEqual(detail);
      });
      beforeEach(() => {
        unit.featureCompleted(name, detail);
      });
    });
    describe('when has no detail', () => {
      it('then has a milestone', () => {
        const journey = unit.journey()[0];
        expect(journey.category).toEqual('Feature');
        expect(journey.action).toEqual('Completed');
        expect(journey.name).toEqual(name);
        expect(journey.details).toBe(undefined);
      });
      beforeEach(() => {
        unit.featureCompleted(name);
      });
    });
  });
  describe('when featureFailed', () => {
    const name = 'Scale Recipe';
    const detail = 'x2'; // optional
    describe('when has detail', () => {
      it('then has a milestone', () => {
        const journey = unit.journey()[0];
        expect(journey.category).toEqual('Feature');
        expect(journey.action).toEqual('Failed');
        expect(journey.name).toEqual(name);
        expect(journey.details).toEqual(detail);
      });
      beforeEach(() => {
        unit.featureFailed(name, detail);
      });
    });
    describe('when has no detail', () => {
      it('then has a milestone', () => {
        const journey = unit.journey()[0];
        expect(journey.category).toEqual('Feature');
        expect(journey.action).toEqual('Failed');
        expect(journey.name).toEqual(name);
        expect(journey.details).toBe(undefined);
      });
      beforeEach(() => {
        unit.featureFailed(name);
      });
    });
  });
  describe('when contentViewed', () => {
    const contentType = 'Blog Post';
    const identifier = 'how-to-install-xenon-view'; // optional
    describe('when has identifier', () => {
      it('then has a milestone', () => {
        const journey = unit.journey()[0];
        expect(journey.category).toEqual('Content');
        expect(journey.action).toEqual('Viewed');
        expect(journey.type).toEqual(contentType);
        expect(journey.identifier).toEqual(identifier);
      });
      beforeEach(() => {
        unit.contentViewed(contentType, identifier);
      });
    });
    describe('when has no identifier', () => {
      it('then has a milestone', () => {
        const journey = unit.journey()[0];
        expect(journey.category).toEqual('Content');
        expect(journey.action).toEqual('Viewed');
        expect(journey.type).toEqual(contentType);
        expect(journey.identifier).toBe(undefined);
      });
      beforeEach(() => {
        unit.contentViewed(contentType);
      });
    });
  });
  describe('when contentEdited', () => {
    const contentType = 'Blog Post';
    const identifier = 'how-to-install-xenon-view'; // optional
    const detail = 'Rewrote'; //optional
    describe('when has details', () => {
      it('then has a milestone', () => {
        const journey = unit.journey()[0];
        expect(journey.category).toEqual('Content');
        expect(journey.action).toEqual('Edited');
        expect(journey.type).toEqual(contentType);
        expect(journey.details).toEqual(detail);
      });
      beforeEach(() => {
        unit.contentEdited(contentType, identifier, detail);
      });
    });
    describe('when has identifier', () => {
      it('then has a milestone', () => {
        const journey = unit.journey()[0];
        expect(journey.category).toEqual('Content');
        expect(journey.action).toEqual('Edited');
        expect(journey.type).toEqual(contentType);
        expect(journey.identifier).toEqual(identifier);
      });
      beforeEach(() => {
        unit.contentEdited(contentType, identifier);
      });
    });
    describe('when has no identifier', () => {
      it('then has a milestone', () => {
        const journey = unit.journey()[0];
        expect(journey.category).toEqual('Content');
        expect(journey.action).toEqual('Edited');
        expect(journey.type).toEqual(contentType);
        expect(journey.identifier).toBe(undefined);
        expect(journey.details).toBe(undefined);
      });
      beforeEach(() => {
        unit.contentEdited(contentType);
      });
    });
  });
  describe('when contentCreated', () => {
    const contentType = 'Blog Post';
    const identifier = 'how-to-install-xenon-view'; // optional
    describe('when has identifier', () => {
      it('then has a milestone', () => {
        const journey = unit.journey()[0];
        expect(journey.category).toEqual('Content');
        expect(journey.action).toEqual('Created');
        expect(journey.type).toEqual(contentType);
        expect(journey.identifier).toEqual(identifier);
      });
      beforeEach(() => {
        unit.contentCreated(contentType, identifier);
      });
    });
    describe('when has no identifier', () => {
      it('then has a milestone', () => {
        const journey = unit.journey()[0];
        expect(journey.category).toEqual('Content');
        expect(journey.action).toEqual('Created');
        expect(journey.type).toEqual(contentType);
        expect(journey.identifier).toBe(undefined);
      });
      beforeEach(() => {
        unit.contentCreated(contentType);
      });
    });
  });
  describe('when contentDeleted', () => {
    const contentType = 'Blog Post';
    const identifier = 'how-to-install-xenon-view'; // optional
    describe('when has identifier', () => {
      it('then has a milestone', () => {
        const journey = unit.journey()[0];
        expect(journey.category).toEqual('Content');
        expect(journey.action).toEqual('Deleted');
        expect(journey.type).toEqual(contentType);
        expect(journey.identifier).toEqual(identifier);
      });
      beforeEach(() => {
        unit.contentDeleted(contentType, identifier);
      });
    });
    describe('when has no identifier', () => {
      it('then has a milestone', () => {
        const journey = unit.journey()[0];
        expect(journey.category).toEqual('Content');
        expect(journey.action).toEqual('Deleted');
        expect(journey.type).toEqual(contentType);
        expect(journey.identifier).toBe(undefined);
      });
      beforeEach(() => {
        unit.contentDeleted(contentType);
      });
    });
  });
  describe('when contentArchived', () => {
    const contentType = 'Blog Post';
    const identifier = 'how-to-install-xenon-view'; // optional
    describe('when has identifier', () => {
      it('then has a milestone', () => {
        const journey = unit.journey()[0];
        expect(journey.category).toEqual('Content');
        expect(journey.action).toEqual('Archived');
        expect(journey.type).toEqual(contentType);
        expect(journey.identifier).toEqual(identifier);
      });
      beforeEach(() => {
        unit.contentArchived(contentType, identifier);
      });
    });
    describe('when has no identifier', () => {
      it('then has a milestone', () => {
        const journey = unit.journey()[0];
        expect(journey.category).toEqual('Content');
        expect(journey.action).toEqual('Archived');
        expect(journey.type).toEqual(contentType);
        expect(journey.identifier).toBe(undefined);
      });
      beforeEach(() => {
        unit.contentArchived(contentType);
      });
    });
  });
  describe('when contentRequested', () => {
    const contentType = 'Blog Post';
    const identifier = 'how-to-install-xenon-view'; // optional
    describe('when has identifier', () => {
      it('then has a milestone', () => {
        const journey = unit.journey()[0];
        expect(journey.category).toEqual('Content');
        expect(journey.action).toEqual('Requested');
        expect(journey.type).toEqual(contentType);
        expect(journey.identifier).toEqual(identifier);
      });
      beforeEach(() => {
        unit.contentRequested(contentType, identifier);
      });
    });
    describe('when has no identifier', () => {
      it('then has a milestone', () => {
        const journey = unit.journey()[0];
        expect(journey.category).toEqual('Content');
        expect(journey.action).toEqual('Requested');
        expect(journey.type).toEqual(contentType);
        expect(journey.identifier).toBe(undefined);
      });
      beforeEach(() => {
        unit.contentRequested(contentType);
      });
    });
  });
  describe('when contentSearched', () => {
    const contentType = 'Blog Post';
    it('then has a milestone', () => {
      const journey = unit.journey()[0];
      expect(journey.category).toEqual('Content');
      expect(journey.action).toEqual('Searched');
      expect(journey.type).toEqual(contentType);
    });
    beforeEach(() => {
      unit.contentSearched(contentType);
    });
  });
  // Custom Milestones tests
  describe('when custom milestone', () => {
    let category = 'Function';
    let operation = 'Called';
    let name = 'Query Database';
    let detail = 'User Lookup';
    it('then has a milestone', () => {
      const journey = unit.journey()[0];
      expect(journey.category).toEqual(category);
      expect(journey.action).toEqual(operation);
      expect(journey.name).toEqual(name);
      expect(journey.details).toEqual(detail);
    });
    beforeEach(() => {
      unit.milestone(category, operation, name, detail);
    });
  });
  // Internals
  describe('when adding duplicate feature', () => {
    const feature = 'duplicate';
    it('then has a journey with a single event', () => {
      const journey = unit.journey()[0];
      expect(journey.count).toEqual(2);
      expect(unit.journey().length).toEqual(1);
    });
    describe('when adding third duplicate', () => {
      it('then has a count of 3', () => {
        const journey = unit.journey()[0];
        expect(journey.count).toEqual(3);
        expect(unit.journey().length).toEqual(1);
      });
      beforeEach(() => {
        unit.featureAttempted(feature);
      });
    });
    describe('when adding new milestone', () => {
      it('then has a count of 2', () => {
        const journey = unit.journey()[0];
        expect(journey.count).toEqual(2);
        expect(unit.journey().length).toEqual(2);
      });
      beforeEach(() => {
        unit.milestone('category', 'operation', 'name', 'detail');
      });
    });
    beforeEach(() => {
      unit.featureAttempted(feature);
      unit.featureAttempted(feature);
    });
  });
  describe('when adding duplicate content', () => {
    const name = 'duplicate';
    it('then has a journey with a single event', () => {
      const journey = unit.journey()[0];
      expect(journey.count).toEqual(2);
      expect(unit.journey().length).toEqual(1);
    });
    beforeEach(() => {
      unit.contentSearched(name);
      unit.contentSearched(name);
    });
  });
  describe('when adding duplicate content with identifier', () => {
    const name = 'duplicate';
    it('then has a journey with a single event', () => {
      const journey = unit.journey()[0];
      expect(journey.count).toEqual(2);
      expect(unit.journey().length).toEqual(1);
    });
    beforeEach(() => {
      unit.contentEdited(name, 'identifier');
      unit.contentEdited(name, 'identifier');
    });
  });
  describe('when adding duplicate content with detail', () => {
    const name = 'duplicate';
    it('then has a journey with a single event', () => {
      const journey = unit.journey()[0];
      expect(journey.count).toEqual(2);
      expect(unit.journey().length).toEqual(1);
    });
    beforeEach(() => {
      unit.contentEdited(name, 'identifier', 'detail');
      unit.contentEdited(name, 'identifier', 'detail');
    });
  });
  describe('when adding duplicate milestone', () => {
    const category = 'Function';
    const operation = 'Called';
    const name = 'Query Database';
    const detail = 'User Lookup';
    it('then has a journey with a single event', () => {
      const journey = unit.journey()[0];
      expect(journey.count).toEqual(2);
      expect(unit.journey().length).toEqual(1);
    });
    beforeEach(() => {
      unit.milestone(category, operation, name, detail);
      unit.milestone(category, operation, name, detail);
    });
  });
  describe('when adding almost duplicate feature', () => {
    const feature = 'almostDup';
    it('then has a journey with a 2 events', () => {
      expect(unit.journey().length).toEqual(2);
    });
    beforeEach(() => {
      unit.featureAttempted(feature);
      unit.featureCompleted(feature);
    });
  });
  describe('when adding almost duplicate content', () => {
    const name = 'Scale Recipe';
    it('then has a journey with a 2 events', () => {
      expect(unit.journey().length).toEqual(2);
    });
    beforeEach(() => {
      unit.contentViewed(name);
      unit.contentSearched(name);
    });
  });
  describe('when adding almost duplicate content with identifier', () => {
    const name = 'Scale Recipe';
    it('then has a journey with a 2 events', () => {
      expect(unit.journey().length).toEqual(2);
    });
    beforeEach(() => {
      unit.contentEdited(name, 'identifier');
      unit.contentEdited(name, 'identifier2');
    });
  });
  describe('when adding almost duplicate content with detail', () => {
    const name = 'Scale Recipe';
    it('then has a journey with a 2 events', () => {
      expect(unit.journey().length).toEqual(2);
    });
    beforeEach(() => {
      unit.contentEdited(name, 'identifier', 'detail');
      unit.contentEdited(name, 'identifier', 'detail2');
    });
  });
  describe('when adding almost duplicate milestone', () => {
    const category = 'Function';
    const operation = 'Called';
    const name = 'Query Database';
    const detail = 'User Lookup';
    it('then has a journey with a single event', () => {
      const journey = unit.journey()[0];
      expect(unit.journey().length).toEqual(2);
    });
    beforeEach(() => {
      unit.milestone(category, operation, name, detail);
      unit.milestone(category, operation, name, detail + '2');
    });
  });
  describe('when resetting', () => {
    const feature = 'resetting';
    describe('when restoring', () => {
      beforeEach(() => {
        unit.restore();
      });
      it('then has a journey with added event', () => {
        expect(unit.journey().length).toEqual(1);
        const journey = unit.journey()[0];
        expect(journey.name).toEqual(feature);
      });
    });
    describe('when restoring after another event was added', () => {
      const anotherFeature = 'resetting2';
      it('then adds new event at end of previous journey', () => {
        expect(unit.journey().length).toEqual(2);
        const journey = unit.journey()[1];
        expect(journey.name).toEqual(anotherFeature);
      });
      beforeEach(() => {
        unit.featureAttempted(anotherFeature);
        unit.restore();
      });
    });
    beforeEach(() => {
      unit.featureAttempted(feature);
      unit.reset();
    });
  });
  describe('when adding an event after reset', () => {
    const feature = 'postreset';
    it('then has a journey with only event', () => {
      expect(unit.journey().length).toEqual(1);
      const journey = unit.journey()[0];
      expect(journey.name).toEqual(feature);
    });
    beforeEach(() => {
      unit.reset();
      unit.featureAttempted(feature);
    });
  });
  describe('isDuplicate', () => {
    describe('when same keys no category', () => {
      it('then is not dup', () => {
        expect(unit.isDuplicate({test: '1'}, {test: '2'})).toBeFalse();
      });
    });
    describe('when categories are not equal', () => {
      it('then is not dup', () => {
        expect(unit.isDuplicate({category: '1'}, {category: '2'})).toBeFalse();
      });
    });
    describe('when category without action', () => {
      it('then is not dup', () => {
        expect(unit.isDuplicate({category: '1'}, {category: '1'})).toBeFalse();
      });
    });
  });
  describe('duplicateContent', () => {
    describe('when content with no type', () => {
      it('then is not dup', () => {
        const noType = {category: 'Content'};
        const noTypeKey = [];
        expect(unit.duplicateContent(noType, noType, noTypeKey, noTypeKey)).toBeTrue();
      });
    });
    describe('when content with mismatch type', () => {
      it('then is not dup', () => {
        const type1 = {category: 'Content', type: '1'};
        const type2 = {category: 'Content', type: '2'};
        const noTypeKey = ['type'];
        expect(unit.duplicateContent(type1, type2, noTypeKey, noTypeKey)).toBeFalse();
      });
    });
  });
  describe('duplicateMilestone', () => {
    describe('when feature', () => {
      it('then is not dup', () => {
        expect(unit.duplicateMilestone({category: 'Feature'}, {category: 'Feature'})).toBeFalse();
      });
    });
    describe('when content', () => {
      it('then is not dup', () => {
        expect(unit.duplicateMilestone({category: 'Content'}, {category: 'Content'})).toBeFalse();
      });
    });
    describe('when name mismatch', () => {
      it('then is not dup', () => {
        expect(unit.duplicateMilestone({category: '1', name: '1'}, {category: '1', name: '2'})).toBeFalse();
      });
    });
  });
  describe('hasClassInHierarchy', () => {
    const classAtTopLevel = {className: "class"};
    const classAtSecondLevel = {
        className: "",
        parentElement: {
          className: "class"
        }
    };
    it('then catches class at first level', () => {
      expect(unit.hasClassInHierarchy(classAtTopLevel, 'class', 1)).toBeTrue()
    });
    it('then doesn\'t have class at first level', () => {
      expect(unit.hasClassInHierarchy(classAtTopLevel, 'other', 1)).toBeFalse()
    });
    it('then catches class at second level', () => {
      expect(unit.hasClassInHierarchy(classAtSecondLevel, 'class', 2)).toBeTrue()
    });
    it('then doesn\'t have class at second level', () => {
      expect(unit.hasClassInHierarchy(classAtSecondLevel, 'other', 2)).toBeFalse()
    });
    it('then doesn\'t go to deep', () => {
      expect(unit.hasClassInHierarchy(classAtSecondLevel, 'other', 1)).toBeFalse()
    });
  });
  // API Communication tests
  describe('when committing a journey', () => {
    const feature = 'committing';
    describe('when default', () => {
      let resolvePromise = null;
      let rejectPromise = null;
      let caughtError = null;
      describe('when normal', () => {
        it('then calls the view journey API', () => {
          expect(JourneyApi).toHaveBeenCalledWith(apiUrl);
          expect(journeyApi.fetch).toHaveBeenCalledWith({
            data: {
              id: jasmine.any(String),
              journey: [
                {category: 'Feature', action: 'Attempted', name: feature, timestamp: jasmine.any(Number)}
              ],
              token: apiKey,
              timestamp: jasmine.any(Number)
            }
          });
        });
        it('then resets journey', () => {
          expect(unit.journey()).toEqual([]);
        });
        describe('when API fails', () => {
          it('then restores journey', () => {
            expect(unit.journey().length).toEqual(1);
            const journey = unit.journey()[0];
            expect(journey.name).toEqual(feature);
          });
          beforeEach(() => {
            rejectPromise(new Error('failure'));
            UnblockPromises();
          });
        });
        beforeEach(() => {
          let promise = new Promise(function (resolve, reject) {
            resolvePromise = resolve;
            rejectPromise = reject;
          });
          journeyApi.fetch.and.returnValue(promise);
          unit.commit();
        });
      });
      describe('when surfacing', () => {
        describe('when API fails', () => {
          it('then rethrows', () => {
            expect(caughtError.toString()).toEqual('Error: failure');
          });
          beforeEach(() => {
            rejectPromise(new Error('failure'));
            UnblockPromises();
          });
        });
        beforeEach(() => {
          let promise = new Promise(function (resolve, reject) {
            resolvePromise = resolve;
            rejectPromise = reject;
          });
          journeyApi.fetch.and.returnValue(promise);
          unit.commit(true).catch((err) => caughtError = err);
        });
      });
    });
    describe('when custom key', () => {
      let customKey = '<custom>';
      it('then calls the view journey API', () => {
        expect(journeyApi.fetch).toHaveBeenCalledWith({
          data: {
            id: jasmine.any(String),
            journey: [
              {category: 'Feature', action: 'Attempted', name: feature, timestamp: jasmine.any(Number)}
            ],
            token: customKey,
            timestamp: jasmine.any(Number)
          }
        });
      });
      beforeEach(() => {
        let promise = new Promise(function (resolve, reject) {
        });
        journeyApi.fetch.and.returnValue(promise);
        unit.init(apiKey = customKey);
        unit.commit();
      });
    });
    beforeEach(() => {
      unit.featureAttempted(feature);
    });
  });
  describe('when heartbeating', () => {
    const feature = 'heartbeating';
    describe('when default', () => {
      let resolvePromise = null;
      let rejectPromise = null;
      let caughtError = null;
      describe('when default failure', () => {
        it('then calls the view heartbeat API', () => {
          expect(HeartbeatApi).toHaveBeenCalledWith(apiUrl);
          expect(heartbeatApi.fetch).toHaveBeenCalledWith({
            data: {
              id: jasmine.any(String),
              journey: [
                {category: 'Feature', action: 'Attempted', name: feature, timestamp: jasmine.any(Number)}
              ],
              token: apiKey,
              tags: [],
              platform: {},
              timestamp: jasmine.any(Number)
            }
          });
        });
        it('then resets journey', () => {
          expect(unit.journey()).toEqual([]);
        });

        describe('when API fails', () => {
          it('then restores journey', () => {
            expect(unit.journey().length).toEqual(1);
            const journey = unit.journey()[0];
            expect(journey.name).toEqual(feature);
          });
          beforeEach(() => {
            rejectPromise(new Error('failure'));
            UnblockPromises();
          });
        });
        beforeEach(() => {
          let promise = new Promise(function (resolve, reject) {
            resolvePromise = resolve;
            rejectPromise = reject;
          });
          heartbeatApi.fetch.and.returnValue(promise);
          unit.heartbeat();
        });
      });
      describe('when surface errors', () => {
        describe('when API fails', () => {
          it('then rethrows', () => {
            expect(caughtError.toString()).toEqual('Error: failure');
          });
          beforeEach(() => {
            rejectPromise(new Error('failure'));
            UnblockPromises();
          });
        });
        beforeEach(() => {
          let promise = new Promise(function (resolve, reject) {
            resolvePromise = resolve;
            rejectPromise = reject;
          });
          heartbeatApi.fetch.and.returnValue(promise);
          unit.heartbeat(true).catch((err) => caughtError = err);
        });
      });
    });
    describe('when tags', () => {
      it('then calls the view heartbeat API', () => {
        expect(HeartbeatApi).toHaveBeenCalledWith(apiUrl);
        expect(heartbeatApi.fetch).toHaveBeenCalledWith({
          data: {
            id: jasmine.any(String),
            journey: [
              {category: 'Feature', action: 'Attempted', name: feature, timestamp: jasmine.any(Number)}
            ],
            token: apiKey,
            tags: ['tag'],
            platform: {},
            timestamp: jasmine.any(Number)
          }
        });
      });
      let resolvePromise = null;
      let rejectPromise = null;
      beforeEach(() => {
        let promise = new Promise(function (resolve, reject) {
          resolvePromise = resolve;
          rejectPromise = reject;
        });
        heartbeatApi.fetch.and.returnValue(promise);
        unit.variant(['tag']);
        unit.heartbeat();
      });
    });
    describe('when platform', () => {
      it('then calls the view heartbeat API', () => {
        expect(HeartbeatApi).toHaveBeenCalledWith(apiUrl);
        expect(heartbeatApi.fetch).toHaveBeenCalledWith({
          data: {
            id: jasmine.any(String),
            journey: [
              {category: 'Feature', action: 'Attempted', name: feature, timestamp: jasmine.any(Number)}
            ],
            token: apiKey,
            tags: [],
            platform: {
              softwareVersion: 'a',
              deviceModel: 'b',
              operatingSystemName: 'c',
              operatingSystemVersion: 'd'
            },
            timestamp: jasmine.any(Number)
          }
        });
      });
      let resolvePromise = null;
      let rejectPromise = null;
      beforeEach(() => {
        let promise = new Promise(function (resolve, reject) {
          resolvePromise = resolve;
          rejectPromise = reject;
        });
        heartbeatApi.fetch.and.returnValue(promise);
        unit.platform('a', 'b', 'c', 'd');
        unit.heartbeat();
      });
    });
    describe('when ecom abandonment', () => {
      let resolvePromise = null;
      let rejectPromise = null;
      beforeEach(() => {
        let promise = new Promise(function (resolve, reject) {
          resolvePromise = resolve;
          rejectPromise = reject;
        });
        heartbeatApi.fetch.and.returnValue(promise);
        unit.ecomAbandonment();
      });
      describe('when ecom stage 0', () => {
        it('then calls the view heartbeat API', () => {
          expect(HeartbeatApi).toHaveBeenCalledWith(apiUrl);
          expect(heartbeatApi.fetch).toHaveBeenCalledWith({
            data: {
              id: jasmine.any(String),
              journey: [
                {category: 'Feature', action: 'Attempted', name: feature, timestamp: jasmine.any(Number)}
              ],
              token: apiKey,
              tags: [],
              timestamp: jasmine.any(Number),
              platform: {},
              watchdog: {
                expires_in_seconds: 600,
                if_abandoned: {superOutcome: 'Add Product To Cart', outcome: 'Abandoned', result: 'fail'}
              }
            }
          })
        });
        beforeEach(() => {
          unit.heartbeat();
        });
        afterEach(() => {
          unit.reset();
        })
      });
      describe('when ecom stage 1', () => {
        it('then calls the view heartbeat API', () => {
          expect(HeartbeatApi).toHaveBeenCalledWith(apiUrl);
          expect(heartbeatApi.fetch).toHaveBeenCalledWith({
            data: {
              id: jasmine.any(String),
              journey: [
                {category: 'Feature', action: 'Attempted', name: feature, timestamp: jasmine.any(Number)},
                {superOutcome: 'Add Product To Cart', outcome: 'Add - product', result: 'success', timestamp: jasmine.any(Number)}
              ],
              token: apiKey,
              tags: [],
              timestamp: jasmine.any(Number),
              platform: {},
              watchdog: {
                expires_in_seconds: 600,
                if_abandoned: {superOutcome: 'Customer Checkout', outcome: 'Abandoned', result: 'fail'}
              }
            }
          })
        });
        beforeEach(() => {
          unit.productAddedToCart("product");
          unit.heartbeat();
        });
        afterEach(() => {
          unit.reset();
        })
      });
      describe('when ecom stage 2', () => {
        it('then calls the view heartbeat API', () => {
          expect(HeartbeatApi).toHaveBeenCalledWith(apiUrl);
          expect(heartbeatApi.fetch).toHaveBeenCalledWith({
            data: {
              id: jasmine.any(String),
              journey: [
                {category: 'Feature', action: 'Attempted', name: feature, timestamp: jasmine.any(Number)},
                {superOutcome: 'Customer Checkout', outcome: 'Check Out', result: 'success', timestamp: jasmine.any(Number)}
              ],
              token: apiKey,
              tags: [],
              timestamp: jasmine.any(Number),
              platform: {},
              watchdog: {
                expires_in_seconds: 600,
                if_abandoned: {superOutcome: 'Customer Purchase', outcome: 'Abandoned', result: 'fail'}
              }
            }
          })
        });
        beforeEach(() => {
          unit.checkOut();
          unit.heartbeat();
          resolvePromise();
        });
        afterEach(() => {
          unit.reset();
        })
      });
      describe('when ecom stage 3', () => {
        it('then calls the view heartbeat API', () => {
          expect(HeartbeatApi).toHaveBeenCalledWith(apiUrl);
          expect(heartbeatApi.fetch).toHaveBeenCalledWith({
            data: {
              id: jasmine.any(String),
              journey: [
                {category: 'Feature', action: 'Attempted', name: feature, timestamp: jasmine.any(Number)},
                {superOutcome: 'Customer Purchase', outcome: 'Purchase - SKU', result: 'success', timestamp: jasmine.any(Number)}
              ],
              token: apiKey,
              tags: [],
              timestamp: jasmine.any(Number),
              platform: {},
              watchdog: {
                remove: true
              }
            }
          })
        });
        it('then resets heartbeat state', () => {
          const type = retrieveLocal('heartbeat_type');
          const outcome = retrieveLocal('heartbeat_outcome');
          const stage = retrieveLocal('heartbeat_stage');
          expect(type).toBeNull();
          expect(outcome).toBeNull();
          expect(stage).toBeNull();
        });
        beforeEach(() => {
          unit.purchase(['SKU']);
          unit.heartbeat();
          resolvePromise();
          UnblockPromises();
        });

      });
    });
    describe('when custom abandonment', () => {
      let resolvePromise = null;
      let rejectPromise = null;
      beforeEach(() => {
        let promise = new Promise(function (resolve, reject) {
          resolvePromise = resolve;
          rejectPromise = reject;
        });
        heartbeatApi.fetch.and.returnValue(promise);
        unit.customAbandonment({
          expires_in_seconds: 600,
          if_abandoned: {
            superOutcome: 'Custom',
            outcome: 'Abandoned',
            result: 'fail'
          }
        });
      });
      describe('when called', () => {
        it('then calls the view heartbeat API', () => {
          expect(HeartbeatApi).toHaveBeenCalledWith(apiUrl);
          expect(heartbeatApi.fetch).toHaveBeenCalledWith({
            data: {
              id: jasmine.any(String),
              journey: [
                {category: 'Feature', action: 'Attempted', name: feature, timestamp: jasmine.any(Number)}
              ],
              token: apiKey,
              tags: [],
              timestamp: jasmine.any(Number),
              platform: {},
              watchdog: {
                expires_in_seconds: 600,
                if_abandoned: {superOutcome: 'Custom', outcome: 'Abandoned', result: 'fail'}
              }
            }
          })
        });
        beforeEach(() => {
          unit.heartbeat();
        });
        afterEach(() => {
          unit.reset();
        })
      });
    });
    describe('when canceling abandonment', () => {
      let resolvePromise = null;
      let rejectPromise = null;
      beforeEach(() => {
        let promise = new Promise(function (resolve, reject) {
          resolvePromise = resolve;
          rejectPromise = reject;
        });
        heartbeatApi.fetch.and.returnValue(promise);
        unit.cancelAbandonment();
      });
      describe('when called', () => {
        it('then calls the view heartbeat API', () => {
          expect(HeartbeatApi).toHaveBeenCalledWith(apiUrl);
          expect(heartbeatApi.fetch).toHaveBeenCalledWith({
            data: {
              id: jasmine.any(String),
              journey: [
                {category: 'Feature', action: 'Attempted', name: feature, timestamp: jasmine.any(Number)}
              ],
              token: apiKey,
              tags: [],
              timestamp: jasmine.any(Number),
              platform: {},
              watchdog: {
                remove: true
              }
            }
          })
        });
        it('then resets heartbeat state', () => {
          const type = retrieveLocal('heartbeat_type');
          const outcome = retrieveLocal('heartbeat_outcome');
          const stage = retrieveLocal('heartbeat_stage');
          expect(type).toBeNull();
          expect(outcome).toBeNull();
          expect(stage).toBeNull();
        });
        beforeEach(() => {
          unit.heartbeat();
          resolvePromise();
          UnblockPromises();
        });
        afterEach(() => {
          unit.reset();
        })
      });
    });
    beforeEach(() => {
      unit.featureAttempted(feature);
    });
  });
  describe('when deanonymizing', () => {
    let person = {name: 'Test User', email: 'test@example.com'};
    describe('when default', () => {
      it('then calls the view deanon API', () => {
        expect(DeanonApi).toHaveBeenCalledWith(apiUrl);
        expect(deanonApi.fetch).toHaveBeenCalledWith({
          data: {
            id: jasmine.any(String),
            person: person,
            token: apiKey,
            timestamp: jasmine.any(Number)
          }
        });
      });
      beforeEach(() => {
        let promise = new Promise(function (resolve, reject) {
        });
        deanonApi.fetch.and.returnValue(promise);
        unit.deanonymize(person);
      });
    });
    describe('when custom', () => {
      let customKey = '<custom>';
      it('then calls the view journey API', () => {
        expect(deanonApi.fetch).toHaveBeenCalledWith({
          data: {
            id: jasmine.any(String),
            person: person,
            token: customKey,
            timestamp: jasmine.any(Number)
          }
        });
      });
      beforeEach(() => {
        let promise = new Promise(function (resolve, reject) {
        });
        deanonApi.fetch.and.returnValue(promise);
        unit.init(apiKey = customKey);
        unit.deanonymize(person);
      });
    });
  });
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    unit = new _Xenon(apiKey, apiUrl, JourneyApi, DeanonApi, HeartbeatApi);
    unit2 = new _Xenon(apiKey, apiUrl, JourneyApi, DeanonApi, HeartbeatApi);
  });
  afterEach(() => {
    unit = null;
    unit2 = null;
    localStorage.clear();
    sessionStorage.clear();
  });
})
;