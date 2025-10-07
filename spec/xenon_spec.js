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
import {
  UnblockPromises,
  ImmediatelyResolvePromise,
  ImmediatelyResolveAllPromises,
  ResetImmediatelyResolvePromises
} from './helper/api_helper';
import {retrieveSession, storeSession, retrieveLocal, resetSession} from '../src/storage/storage';
import MockPromises from "mock-promises";


describe('View SDK', () => {
  let unit = null;
  let unit2 = null;
  let journeyApi = jasmine.createSpyObj('MyJourneyApi', ['fetch']);
  let JourneyApi = jasmine.createSpy('constructor');
  JourneyApi.and.returnValue(journeyApi);
  let deanonApi = jasmine.createSpyObj('MyDeanonApi', ['fetch']);
  let DeanonApi = jasmine.createSpy('constructor');
  DeanonApi.and.returnValue(deanonApi);
  let heartbeatApi = jasmine.createSpyObj('MyHeartbeatApi', ['fetch']);
  let HeartbeatApi = jasmine.createSpy('constructor');
  HeartbeatApi.and.returnValue(heartbeatApi);
  let sampleApi = jasmine.createSpyObj('MySampleApi', ['fetch']);
  let SampleApi = jasmine.createSpy('constructor');
  SampleApi.and.returnValue(sampleApi);
  let countApi = jasmine.createSpyObj('MyCountApi', ['fetch']);
  let CountApi = jasmine.createSpy('constructor');
  CountApi.and.returnValue(countApi);
  let errorLogApi = jasmine.createSpyObj('MyErrorLogApi', ['fetch']);
  let ErrorLogApi = jasmine.createSpy('constructor');
  ErrorLogApi.and.returnValue(errorLogApi);
  let apiKey = '<token>';
  let apiUrl = 'https://localhost';
  let countApiUrl = 'https://localhost2';
  let sampleResolvePromise = null;
  let sampleRejectPromise = null;
  let samplePromise = null;
  let countResolvePromise = null;
  let countRejectPromise = null;
  let countPromise = null;

  function resetCalls() {
    DeanonApi.calls.reset();
    deanonApi.fetch.calls.reset();
    HeartbeatApi.calls.reset();
    heartbeatApi.fetch.calls.reset();
    JourneyApi.calls.reset();
    journeyApi.fetch.calls.reset();
    SampleApi.calls.reset();
    sampleApi.fetch.calls.reset();
    CountApi.calls.reset();
    countApi.fetch.calls.reset();
    ErrorLogApi.calls.reset();
    errorLogApi.fetch.calls.reset();
  }

  describe('when no decision previously', () => {
    describe('when able to sample', () => {
      // Platforming, Tagging, Sampling and Init tests
      it('then has a positive sample decision', (done) => {
        (async () => {
          ImmediatelyResolvePromise(3);
          expect(await unit.sampleDecision()).toBeTrue();
          done();
        })();
      });
      it('then calls the view sample API', () => {
        expect(sampleApi.fetch).toHaveBeenCalledWith({
          data: {
            id: jasmine.any(String),
            token: apiKey
          }
        });
      });
      it('then has a version', () => {
        expect(unit.version()).toEqual(jasmine.any(String));
      });
      describe('when initialized', () => {
        it('then has default journey', (done) => {
          (async () => {
            ImmediatelyResolvePromise(3);
            expect(await unit.journey()).toEqual([]);
            done();
          })();
        });
        it('then has default id', (done) => {
          (async () => {
            expect(await unit.id()).not.toBeNull();
            expect(await unit.id()).not.toEqual('');
            done();
          })();
        });
        it('then has default id when storage cleared', (done) => {
          sessionStorage.removeItem('xenon-view');
          (async () => {
            expect(await unit.id()).not.toBeNull();
            expect(await unit.id()).not.toEqual('');
            done();
          })();
        });
        describe('when id set', () => {
          let testId = '<some random uuid>';
          beforeEach((done) => {
            (async () => {
              await unit.id(testId);
              done();
            })();
          });
          it('then has set id', (done) => {
            (async () => {
              expect(await unit.id()).toEqual(testId);
              done();
            })();
          });
          it('then persists id', () => {
            expect(sessionStorage.getItem('xenon-view')).toEqual(JSON.stringify(testId));
          });
        });
      });
      describe('when initialized and previous journey', () => {
        it('then has previous journey', (done) => {
          (async () => {
            const value = await unit.journey();
            let journeyStr = JSON.stringify(value[0]);
            expect(journeyStr).toContain('{"superOutcome":"Lead Capture","outcome":"Phone Number","result":"success","timestamp":');
            done();
          })();
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(9);
            await unit.leadCaptured('Phone Number');
            unit = new _Xenon();
            sampleResolvePromise({sample: true});
            UnblockPromises();
            ImmediatelyResolvePromise(10);
            await unit.init(apiKey, apiUrl);
            done();
          })();
        });
      });
      describe('when initialized with a previous id', () => {
        let testId = '<some random uuid>';
        it('then has previous id', (done) => {
          (async () => {
            expect(await unit.id()).toEqual(testId);
            done();
          })();
        });
        beforeEach((done) => {
          (async () => {
            await unit.id(testId);
            unit = new _Xenon();
            done();
          })();
        });
      });
      describe('when regenerating an ID', () => {
        let previousId = null;
        it('then has previous id', (done) => {
          (async () => {
            expect(await unit.id()).not.toEqual(previousId);
            done();
          })();
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(3);
            previousId = await unit.id();
            unit = new _Xenon();
            ImmediatelyResolvePromise(3);
            await unit.newId();
            done();
          })();
        });
      });
      describe('when adding outcome after platform reset', () => {
        it('then journey doesn\'t contain platform', (done) => {
          (async () => {
            const journey = await unit.journey();
            expect(Object.keys(journey[0])).not.toContain('platform')
            done();
          })();
        });
        beforeEach((done) => {
          const softwareVersion = '5.1.5';
          const deviceModel = 'Pixel 4 XL';
          const operatingSystemName = 'Android';
          const operatingSystemVersion = '12.0';
          (async () => {
            ImmediatelyResolvePromise(3);
            await unit.platform(softwareVersion, deviceModel, operatingSystemName, operatingSystemVersion);
            ImmediatelyResolvePromise(3);
            await unit.removePlatform();
            ImmediatelyResolvePromise(7);
            await unit.applicationInstalled()
            done();
          })();
        });
        afterEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(3);
            await unit.removePlatform();
            ImmediatelyResolvePromise(0);
            done();
          })();
        });
      });
      describe('when adding outcome after platform set', () => {
        describe('via manual platform setting', () => {
          it('then journey contains platform', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.platform.softwareVersion).toEqual('5.1.5');
              expect(journey.platform.deviceModel).toEqual('Pixel 4 XL');
              expect(journey.platform.operatingSystemName).toEqual('Android');
              expect(journey.platform.operatingSystemVersion).toEqual('12.0');
              done();
            })();
          });
          beforeEach((done) => {
            const softwareVersion = '5.1.5';
            const deviceModel = 'Pixel 4 XL';
            const operatingSystemName = 'Android';
            const operatingSystemVersion = '12.0';
            (async () => {
              ImmediatelyResolvePromise(3);
              await unit.platform(softwareVersion, deviceModel, operatingSystemName, operatingSystemVersion);
              ImmediatelyResolvePromise(7);
              await unit.applicationInstalled()
              done();
            })();
          });
          afterEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(3);
              await unit.removePlatform();
              ImmediatelyResolvePromise(0);
              done();
            })();
          });
        });
        describe('via automatic platform setting', () => {
          it('then journey contains platform', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.platform.softwareVersion).toEqual('5.1.5');
              expect(journey.platform.deviceModel).toEqual('Maemo Browser:1.4.1.22');
              expect(journey.platform.operatingSystemName).toEqual('Maemo');
              expect(journey.platform.operatingSystemVersion).toEqual(undefined);
              done();
            })();
          });
          beforeEach((done) => {
            const userAgent = 'Mozilla/5.0 (X11; U; Linux armv7l; en-GB; rv:1.9.2a1pre) Gecko/20090928 Firefox/3.5 Maemo Browser 1.4.1.22 RX-51 N900';
            const softwareVersion = '5.1.5';
            (async () => {
              ImmediatelyResolvePromise(4);
              await unit.setPlatformByUserAgent(userAgent, softwareVersion);
              ImmediatelyResolvePromise(7);
              await unit.applicationInstalled()
              done();
            })();
          });
          afterEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(3);
              await unit.removePlatform();
              ImmediatelyResolvePromise(0);
              done();
            })();
          });
        });
      });
      describe("when testing tags", () => {
        describe('when restart tags', () => {
          describe('without previous duplicate', () => {
            beforeEach((done) => {
              (async () => {
                ImmediatelyResolvePromise(3);
                await unit.resetVariants();
                ImmediatelyResolvePromise(7);
                await unit.startVariant('test');
                done();
              })();
            });
            it('should have variant', () => {
              const tags = sessionStorage.getItem('view-tags');
              expect(tags).toContain("test");
            });
          });
          describe('with previous duplicate', () => {
            beforeEach((done) => {
              (async () => {
                ImmediatelyResolvePromise(3);
                await unit.resetVariants()
                ImmediatelyResolvePromise(7);
                await unit.variant(['test'])
                ImmediatelyResolvePromise(7);
                await unit.startVariant('test');
                done();
              })();
            });
            it('should have variant', () => {
              const tagsString = sessionStorage.getItem('view-tags');
              const tags = JSON.parse(tagsString)
              expect(tags).toContain("test");
              expect(tags.length).toEqual(1);
            });
          });
          describe('with previous not duplicate', () => {
            beforeEach((done) => {
              (async () => {
                ImmediatelyResolvePromise(3);
                await unit.resetVariants()
                ImmediatelyResolvePromise(7);
                await unit.variant(['test1'])
                ImmediatelyResolvePromise(7);
                await unit.startVariant('test');
                done();
              })();
            });
            it('should only have variant', () => {
              const tagsString = sessionStorage.getItem('view-tags');
              const tags = JSON.parse(tagsString)
              expect(tags).toContain("test");
              expect(tags.length).toEqual(1);
            });
          });
        });
        describe('when appending tag', () => {
          describe('without previous duplicate', () => {
            beforeEach((done) => {
              (async () => {
                ImmediatelyResolvePromise(3);
                await unit.resetVariants()
                ImmediatelyResolvePromise(7);
                unit.addVariant('test')
                done();
              })();
            });
            it('should have variant', () => {
              const tags = sessionStorage.getItem('view-tags');
              expect(tags).toContain("test");
            });
          });
          describe('with previous duplicate', () => {
            beforeEach((done) => {
              (async () => {
                ImmediatelyResolvePromise(3);
                await unit.resetVariants();
                ImmediatelyResolvePromise(7);
                await unit.variant(['test']);
                done();
              })();
            });
            describe('when start Variant', () => {
              it('should have variant', () => {
                const tagsString = sessionStorage.getItem('view-tags');
                const tags = JSON.parse(tagsString)
                expect(tags).toContain("test");
                expect(tags.length).toEqual(1);
              });
              beforeEach((done) => {
                (async () => {
                  ImmediatelyResolvePromise(7);
                  await unit.startVariant('test');
                  done();
                })();
              });
            });
            describe('when adding variant', () => {
              it('should have variant', () => {
                const tagsString = sessionStorage.getItem('view-tags');
                const tags = JSON.parse(tagsString)
                expect(tags).toContain("test");
                expect(tags.length).toEqual(1);
              });
              beforeEach((done) => {
                (async () => {
                  ImmediatelyResolvePromise(7);
                  await unit.addVariant('test');
                  done();
                })();
              });
            });
          });
          describe('with previous not duplicate', () => {
            beforeEach((done) => {
              (async () => {
                ImmediatelyResolvePromise(3);
                await unit.resetVariants()
                ImmediatelyResolvePromise(7);
                await unit.variant(['test1'])
                ImmediatelyResolvePromise(7);
                await unit.addVariant('test');
                done();
              })();
            });
            it('should have variant', () => {
              const tagsString = sessionStorage.getItem('view-tags');
              const tags = JSON.parse(tagsString)
              expect(tags).toContain("test1");
              expect(tags.length).toEqual(2);
            });
          });
        })
        describe('when adding outcome after tags reset', () => {
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.variant(['tag'])
              ImmediatelyResolvePromise(3);
              await unit.resetVariants()
              ImmediatelyResolvePromise(7);
              await unit.applicationInstalled();
              done();
            })();
          });
          it('then journey doesn\'t contain tags', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(Object.keys(journey)).not.toContain('tags');
              done();
            })();
          });
        });
        describe('when adding outcome after tags', () => {
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.variant(['tag'])
              ImmediatelyResolvePromise(7);
              await unit.applicationInstalled();
              done();
            })();
          });
          it('then journey contains tags', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.tags).toEqual(['tag']);
              done();
            })();
          });
        });
        afterEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(3);
            unit.resetVariants()
            done();
          })();
        });
      });
      // Stock Business Outcomes tests
      describe('when leadAttributed', () => {
        const source = 'Google Ad';
        const identifier = 'Search';
        describe('when has id', () => {
          it('then counts', () => {
            expect(countApi.fetch).toHaveBeenCalledWith({
              data: {
                uid: jasmine.any(String),
                token: '<token>',
                timestamp: jasmine.any(Number),
                outcome: 'Attribution',
                content: {leadSource: 'Attributed', leadCampaign: null, leadGuid: null},
                platform: null,
                skus: null,
                value: 0
              }
            });
          });
          beforeEach((done) => {
            (async () => {
              await storeSession('view-attribution', {
                leadSource: 'Attributed',
                leadCampaign: null,
                leadGuid: null
              });
              ImmediatelyResolvePromise(8);
              countResolvePromise({"result": "success"});
              await unit.leadAttributed(source, identifier)
              done();
            })();
          });
        });
        describe('when no id', () => {
          it('then counts', () => {
            expect(countApi.fetch).toHaveBeenCalledWith({
              data: {
                uid: jasmine.any(String),
                token: '<token>',
                timestamp: jasmine.any(Number),
                outcome: 'Attribution',
                content: {leadSource: 'Attributed', leadCampaign: null, leadGuid: null},
                platform: null,
                skus: null,
                value: 0
              }
            });
          });
          beforeEach((done) => {
            (async () => {
              await storeSession('view-attribution', {
                leadSource: 'Attributed',
                leadCampaign: null,
                leadGuid: null
              });
              ImmediatelyResolvePromise(8);
              countResolvePromise({"result": "success"});
              await unit.leadAttributed(source)
              done();
            })();
          });
        });
      });
      describe('when leadUnattributed', () => {
        it('then counts', () => {
          expect(countApi.fetch).toHaveBeenCalledWith({
            data: {
              uid: jasmine.any(String),
              token: '<token>',
              timestamp: jasmine.any(Number),
              outcome: 'Attribution',
              content: {leadSource: 'Unattributed', leadCampaign: null, leadGuid: null},
              platform: null,
              skus: null,
              value: 0
            }
          });
        });
        beforeEach((done) => {
          (async () => {
            await storeSession('view-attribution', {
              leadSource: 'Unattributed',
              leadCampaign: null,
              leadGuid: null
            });
            ImmediatelyResolvePromise(8);
            countResolvePromise({"result": "success"});
            await unit.leadUnattributed()
            done();
          })();
        });
      });
      describe('when leadCaptured', () => {
        const phone = 'Phone Number';
        it('then creates journey with outcome', (done) => {
          (async () => {
            const journey = (await unit.journey())[0];
            expect(journey.superOutcome).toEqual('Lead Capture');
            expect(journey.outcome).toEqual(phone);
            expect(journey.result).toEqual('success');
            done();
          })();
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(7);
            await unit.leadCaptured(phone)
            done();
          })();
        });
      });
      describe('when leadCaptureDeclined', () => {
        const phone = 'Phone Number';
        it('then creates journey with outcome', (done) => {
          (async () => {
            const journey = (await unit.journey())[0];
            expect(journey.superOutcome).toEqual('Lead Capture');
            expect(journey.outcome).toEqual(phone);
            expect(journey.result).toEqual('fail');
            done();
          })();
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(7);
            await unit.leadCaptureDeclined(phone)
            done();
          })();
        });
      });
      describe('when accountSignup', () => {
        const viaFacebook = 'Facebook';
        it('then creates journey with outcome', (done) => {
          (async () => {
            const journey = (await unit.journey())[0];
            expect(journey.superOutcome).toEqual('Account Signup');
            expect(journey.outcome).toEqual(viaFacebook);
            expect(journey.result).toEqual('success');
            done();
          })();
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(7);
            await unit.accountSignup(viaFacebook)
            done();
          })();
        });
      });
      describe('when accountSignupDeclined', () => {
        const viaFacebook = 'Facebook';
        it('then creates journey with outcome', (done) => {
          (async () => {
            const journey = (await unit.journey())[0];
            expect(journey.superOutcome).toEqual('Account Signup');
            expect(journey.outcome).toEqual(viaFacebook);
            expect(journey.result).toEqual('fail');
            done();
          })();
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(7);
            await unit.accountSignupDeclined(viaFacebook)
            done();
          })();
        });
      });
      describe('when applicationInstalled', () => {
        it('then creates journey with outcome', (done) => {
          (async () => {
            const journey = (await unit.journey())[0];
            expect(journey.superOutcome).toEqual('Application Installation');
            expect(journey.outcome).toEqual('Installed');
            expect(journey.result).toEqual('success');
            done();
          })();
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(7);
            await unit.applicationInstalled();
            done();
          })();
        });
      });
      describe('when applicationNotInstalled', () => {
        it('then creates journey with outcome', (done) => {
          (async () => {
            const journey = (await unit.journey())[0];
            expect(journey.superOutcome).toEqual('Application Installation');
            expect(journey.outcome).toEqual('Not Installed');
            expect(journey.result).toEqual('fail');
            done();
          })();
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(7);
            await unit.applicationNotInstalled();
            done();
          })();
        });
      });
      describe('when initialSubscription', () => {
        const tierSilver = 'Silver Monthly';
        const method = 'Stripe'; // optional
        const price = '$25'; // optional
        const term = '30d'; // optional
        describe('when has method, price and term', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.term).toEqual(term);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.initialSubscription(tierSilver, method, price, term);
              done();
            })();
          });
        });
        describe('when has method and price', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.price).toEqual(price);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.initialSubscription(tierSilver, method, price);
              done();
            })();
          });
        });
        describe('when has method', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.method).toEqual(method);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.initialSubscription(tierSilver, method);
              done();
            })();
          });
        });
        describe('when no method', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Initial Subscription');
              expect(journey.outcome).toEqual('Subscribe - ' + tierSilver);
              expect(journey.result).toEqual('success');
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.initialSubscription(tierSilver);
              done();
            })();
          });
        });
      });
      describe('when subscriptionDeclined', () => {
        const tierSilver = 'Silver Monthly';
        const method = 'Stripe'; // optional
        const price = '$25'; // optional
        const term = '30d'; // optional
        describe('when has method, price, and term', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.term).toEqual(term);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.subscriptionDeclined(tierSilver, method, price, term);
              done();
            })();
          });
        });
        describe('when has method and price', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.price).toEqual(price);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.subscriptionDeclined(tierSilver, method, price);
              done();
            })();
          });
        });
        describe('when has method', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.method).toEqual(method);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.subscriptionDeclined(tierSilver, method);
              done();
            })();
          });
        });
        describe('when no method', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Initial Subscription');
              expect(journey.outcome).toEqual('Decline - ' + tierSilver);
              expect(journey.result).toEqual('fail');
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.subscriptionDeclined(tierSilver);
              done();
            })();
          });
        });
      });
      describe('when subscriptionRenewed', () => {
        const tierSilver = 'Silver Monthly';
        const method = 'Stripe'; // optional
        const price = '$25'; // optional
        const term = '30d'; // optional
        describe('when has method, price and term', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.term).toEqual(term);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.subscriptionRenewed(tierSilver, method, price, term);
              done();
            })();
          });
        });
        describe('when has method and price', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.price).toEqual(price);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.subscriptionRenewed(tierSilver, method, price);
              done();
            })();
          });
        });
        describe('when has method', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.method).toEqual(method);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.subscriptionRenewed(tierSilver, method);
              done();
            })();
          });
        });
        describe('when no method', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Subscription Renewal');
              expect(journey.outcome).toEqual('Renew - ' + tierSilver);
              expect(journey.result).toEqual('success');
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.subscriptionRenewed(tierSilver);
              done();
            })();
          });
        });
      });
      describe('when subscriptionPaused', () => {
        const tierSilver = 'Silver Monthly';
        const method = 'Stripe'; // optional
        const price = '$25'; // optional
        const term = '30d'; // optional
        describe('when has method, price, and term', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.term).toEqual(term);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.subscriptionPaused(tierSilver, method, price, term);
              done();
            })();
          });
        });
        describe('when has method and price', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.price).toEqual(price);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.subscriptionPaused(tierSilver, method, price);
              done();
            })();
          });
        });
        describe('when has method', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.method).toEqual(method);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.subscriptionPaused(tierSilver, method);
              done();
            })();
          });
        });
        describe('when no method', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Subscription Renewal');
              expect(journey.outcome).toEqual('Paused - ' + tierSilver);
              expect(journey.result).toEqual('fail');
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.subscriptionPaused(tierSilver);
              done();
            })();
          });
        });
      });
      describe('when subscriptionCanceled', () => {
        const tierSilver = 'Silver Monthly';
        const method = 'Stripe'; // optional
        const price = '$25'; // optional
        const term = '30d'; // optional
        describe('when has method, price, and term', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.term).toEqual(term);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.subscriptionCanceled(tierSilver, method, price, term);
              done();
            })();
          });
        });
        describe('when has method and price', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.price).toEqual(price);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.subscriptionCanceled(tierSilver, method, price);
              done();
            })();
          });
        });
        describe('when has method', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.method).toEqual(method);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.subscriptionCanceled(tierSilver, method);
              done();
            })();
          });
        });
        describe('when no method', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Subscription Renewal');
              expect(journey.outcome).toEqual('Cancel - ' + tierSilver);
              expect(journey.result).toEqual('fail');
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.subscriptionCanceled(tierSilver);
              done();
            })();
          });
        });
      });
      describe('when subscriptionUpsold', () => {
        const tierSilver = 'Silver Monthly';
        const method = 'Stripe'; // optional
        const price = '$25'; // optional
        const term = '30d'; // optional
        describe('when has method, price and term', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.term).toEqual(term);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.subscriptionUpsold(tierSilver, method, price, term);
              done();
            })();
          });
        });
        describe('when has method and price', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.price).toEqual(price);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.subscriptionUpsold(tierSilver, method, price);
              done();
            })();
          });
        });
        describe('when has method', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.method).toEqual(method);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.subscriptionUpsold(tierSilver, method);
              done();
            })();
          });
        });
        describe('when no method', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Subscription Upsold');
              expect(journey.outcome).toEqual('Upsold - ' + tierSilver);
              expect(journey.result).toEqual('success');
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.subscriptionUpsold(tierSilver);
              done();
            })();
          });
        });
      });
      describe('when subscriptionUpsellDeclined', () => {
        const tierSilver = 'Silver Monthly';
        const method = 'Stripe'; // optional
        const price = '$25'; // optional
        const term = '30d'; // optional
        describe('when has method, price and term', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.term).toEqual(term);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.subscriptionUpsellDeclined(tierSilver, method, price, term);
              done();
            })();
          });
        });
        describe('when has method, and price', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.price).toEqual(price);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.subscriptionUpsellDeclined(tierSilver, method, price);
              done();
            })();
          });
        });
        describe('when has method', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.method).toEqual(method);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.subscriptionUpsellDeclined(tierSilver, method);
              done();
            })();
          });
        });
        describe('when no method', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Subscription Upsold');
              expect(journey.outcome).toEqual('Declined - ' + tierSilver);
              expect(journey.result).toEqual('fail');
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.subscriptionUpsellDeclined(tierSilver);
              done();
            })();
          });
        });
      });
      describe('when subscriptionDownsell', () => {
        const tierSilver = 'Silver Monthly';
        const method = 'Stripe'; // optional
        const price = '$25'; // optional
        const term = '30d'; // optional
        describe('when has method, price and term', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.term).toEqual(term);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.subscriptionDownsell(tierSilver, method, price, term);
              done();
            })();
          });
        });
        describe('when has method and price', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.price).toEqual(price);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.subscriptionDownsell(tierSilver, method, price);
              done();
            })();
          });
        });
        describe('when has method', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.method).toEqual(method);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.subscriptionDownsell(tierSilver, method);
              done();
            })();
          });
        });
        describe('when no method', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Subscription Upsold');
              expect(journey.outcome).toEqual('Downsell - ' + tierSilver);
              expect(journey.result).toEqual('fail');
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.subscriptionDownsell(tierSilver);
              done();
            })();
          });
        });
      });
      describe('when adCicked', () => {
        const provider = 'AdMob';
        const id = 'ID-1234'; // optional
        const price = '$0.225'; // optional
        describe('when has id and price', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Advertisement');
              expect(journey.outcome).toEqual('Ad Click - ' + provider);
              expect(journey.result).toEqual('success');
              expect(journey.id).toEqual(id);
              expect(journey.price).toEqual(price);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.adClicked(provider, id, price);
              done();
            })();
          });
        });
        describe('when has id', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Advertisement');
              expect(journey.outcome).toEqual('Ad Click - ' + provider);
              expect(journey.result).toEqual('success');
              expect(journey.id).toEqual(id);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.adClicked(provider, id);
              done();
            })();
          });
        });
        describe('when no method', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Advertisement');
              expect(journey.outcome).toEqual('Ad Click - ' + provider);
              expect(journey.result).toEqual('success');
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.adClicked(provider);
              done();
            })();
          });
        });
      });
      describe('when adIgnored', () => {
        const provider = 'AdMob';
        const id = 'ID-1234'; // optional
        const price = '$0.225'; // optional
        describe('when has id and price', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Advertisement');
              expect(journey.outcome).toEqual('Ad Ignored - ' + provider);
              expect(journey.result).toEqual('fail');
              expect(journey.id).toEqual(id);
              expect(journey.price).toEqual(price);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.adIgnored(provider, id, price);
              done();
            })();
          });
        });
        describe('when has id', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Advertisement');
              expect(journey.outcome).toEqual('Ad Ignored - ' + provider);
              expect(journey.result).toEqual('fail');
              expect(journey.id).toEqual(id);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.adIgnored(provider, id);
              done();
            })();
          });
        });
        describe('when no method', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Advertisement');
              expect(journey.outcome).toEqual('Ad Ignored - ' + provider);
              expect(journey.result).toEqual('fail');
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.adIgnored(provider);
              done();
            })();
          });
        });
      });
      describe('when referral', () => {
        const kind = 'Share';
        const detail = 'Review'; // optional
        describe('when has detail', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Referral');
              expect(journey.outcome).toEqual('Referred - ' + kind);
              expect(journey.result).toEqual('success');
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.referral(kind, detail);
              done();
            })();
          });
        });
        describe('when no detail', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Referral');
              expect(journey.outcome).toEqual('Referred - ' + kind);
              expect(journey.result).toEqual('success');
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.referral(kind);
              done();
            })();
          });
        });
      });
      describe('when referralDeclined', () => {
        const kind = 'Share';
        const detail = 'Review'; // optional
        describe('when has detail', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Referral');
              expect(journey.outcome).toEqual('Declined - ' + kind);
              expect(journey.result).toEqual('fail');
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.referralDeclined(kind, detail);
              done();
            })();
          });
        });
        describe('when no detail', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Referral');
              expect(journey.outcome).toEqual('Declined - ' + kind);
              expect(journey.result).toEqual('fail');
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              await unit.referralDeclined(kind);
              done();
            })();
          });
        });

      });
      // Ecommerce Related Outcomes tests
      describe('when productAddedToCart', () => {
        const laptop = 'Dell XPS';
        const price = 1234.56;
        describe('when only product', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Add Product To Cart');
              expect(journey.outcome).toEqual('Add - ' + laptop);
              expect(journey.result).toEqual('success');
              done();
            })();
          });
          it('then counts', () => {
            expect(countApi.fetch).toHaveBeenCalledWith({
              data: {
                uid: jasmine.any(String),
                token: '<token>',
                timestamp: jasmine.any(Number),
                outcome: 'Add To Cart',
                content: {leadSource: null, leadCampaign: null, leadGuid: null},
                platform: null,
                skus: ['Dell XPS'],
                value: 0
              }
            });
          });
          beforeEach((done) => {
            (async () => {
              await storeSession('view-attribution', {
                leadSource: null,
                leadCampaign: null,
                leadGuid: null
              })
              ImmediatelyResolvePromise(7);
              countResolvePromise({"result": "success"});
              unit.productAddedToCart(laptop);
              done();
            })();
          });
        });
        describe('when product and price', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Add Product To Cart');
              expect(journey.outcome).toEqual('Add - ' + laptop);
              expect(journey.result).toEqual('success');
              expect(journey.price).toEqual(price);
              done();
            })();
          });
          it('then counts', () => {
            expect(countApi.fetch).toHaveBeenCalledWith({
              data: {
                uid: jasmine.any(String),
                token: '<token>',
                timestamp: jasmine.any(Number),
                outcome: 'Add To Cart',
                content: {leadSource: null, leadCampaign: null, leadGuid: null},
                platform: null,
                skus: [laptop],
                value: price
              }
            });
          });
          beforeEach((done) => {
            (async () => {
              await storeSession('view-attribution', {
                leadSource: null,
                leadCampaign: null,
                leadGuid: null
              })
              ImmediatelyResolvePromise(7);
              countResolvePromise({"result": "success"});
              unit.productAddedToCart(laptop, price);
              done();
            })();
          });
        });
        beforeEach(() => {
          resetCalls();
        });
      });
      describe('when productNotAddedToCart', () => {
        const laptop = 'Dell XPS';
        it('then creates journey with outcome', (done) => {
          (async () => {
            const journey = (await unit.journey())[0];
            expect(journey.superOutcome).toEqual('Add Product To Cart');
            expect(journey.outcome).toEqual('Ignore - ' + laptop);
            expect(journey.result).toEqual('fail');
            done();
          })();
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(7);
            await unit.productNotAddedToCart(laptop);
            done();
          })();
        });
      });
      describe('when upsold', () => {
        const laptop = 'Dell XPS';
        const price = 25; // optional
        describe('when has price', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Upsold Product');
              expect(journey.outcome).toEqual('Upsold - ' + laptop);
              expect(journey.result).toEqual('success');
              expect(journey.price).toEqual(price);
              done();
            })();
          });
          it('then counts', () => {
            expect(countApi.fetch).toHaveBeenCalledWith({
              data: {
                uid: jasmine.any(String),
                token: '<token>',
                timestamp: jasmine.any(Number),
                outcome: 'Upsell',
                content: {leadSource: null, leadCampaign: null, leadGuid: null},
                platform: null,
                skus: [laptop],
                value: 25
              }
            });
          });
          beforeEach((done) => {
            (async () => {
              await storeSession('view-attribution', {
                leadSource: null,
                leadCampaign: null,
                leadGuid: null
              })
              ImmediatelyResolvePromise(7);
              countResolvePromise({"result": "success"});
              unit.upsold(laptop, price);
              done();
            })();
          });
        });
        describe('when no price', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Upsold Product');
              expect(journey.outcome).toEqual('Upsold - ' + laptop);
              expect(journey.result).toEqual('success');
              done();
            })();
          });
          it('then counts', () => {
            expect(countApi.fetch).toHaveBeenCalledWith({
              data: {
                uid: jasmine.any(String),
                token: '<token>',
                timestamp: jasmine.any(Number),
                outcome: 'Upsell',
                content: {leadSource: null, leadCampaign: null, leadGuid: null},
                platform: null,
                skus: [laptop],
                value: 0
              }
            });
          });
          beforeEach((done) => {
            (async () => {
              await storeSession('view-attribution', {
                leadSource: null,
                leadCampaign: null,
                leadGuid: null
              })
              ImmediatelyResolvePromise(7);
              countResolvePromise({"result": "success"});
              unit.upsold(laptop);
              done();
            })();
          });
        });
      });
      describe('when upsellDismissed', () => {
        const laptop = 'Dell XPS';
        const price = '$25'; // optional
        describe('when price', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Upsold Product');
              expect(journey.outcome).toEqual('Dismissed - ' + laptop);
              expect(journey.result).toEqual('fail');
              expect(journey.price).toEqual(price);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              unit.upsellDismissed(laptop, price);
              done();
            })();
          });
        });
        describe('when no price', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Upsold Product');
              expect(journey.outcome).toEqual('Dismissed - ' + laptop);
              expect(journey.result).toEqual('fail');
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              unit.upsellDismissed(laptop);
              done();
            })();
          });
        });
      });
      describe('when checkOut', () => {
        describe('when no member', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Customer Checkout');
              expect(journey.outcome).toEqual('Check Out');
              expect(journey.result).toEqual('success');
              done();
            })();
          });
          it('then counts', () => {
            expect(countApi.fetch).toHaveBeenCalledWith({
              data: {
                uid: jasmine.any(String),
                token: '<token>',
                timestamp: jasmine.any(Number),
                outcome: 'Check Out',
                content: {leadSource: null, leadCampaign: null, leadGuid: null},
                platform: null,
                skus: null,
                value: 0
              }
            });
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              countResolvePromise({"result": "success"});
              unit.checkOut();
              done();
            })();
          });
        });
        describe('when member', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Customer Checkout');
              expect(journey.outcome).toEqual('Check Out - Guest');
              expect(journey.result).toEqual('success');
              done();
            })();
          });
          it('then counts', () => {
            expect(countApi.fetch).toHaveBeenCalledWith({
              data: {
                uid: jasmine.any(String),
                token: '<token>',
                timestamp: jasmine.any(Number),
                outcome: 'Checkout:Guest',
                content: {leadSource: null, leadCampaign: null, leadGuid: null},
                platform: null,
                skus: null,
                value: 0
              }
            });
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              countResolvePromise({"result": "success"});
              unit.checkOut("Guest");
              done();
            })();
          });
        });
        beforeEach(() => {
          storeSession('view-attribution', {
            leadSource: null,
            leadCampaign: null,
            leadGuid: null
          })
        });
      });
      describe('when checkoutCanceled', () => {
        it('then creates journey with outcome', (done) => {
          (async () => {
            const journey = (await unit.journey())[0];
            expect(journey.superOutcome).toEqual('Customer Checkout');
            expect(journey.outcome).toEqual('Canceled');
            expect(journey.result).toEqual('fail');
            done();
          })();
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(7);
            unit.checkoutCanceled();
            done();
          })();
        });
      });
      describe('when productRemoved', () => {
        const laptop = 'Dell XPS';
        it('then creates journey with outcome', (done) => {
          (async () => {
            const journey = (await unit.journey())[0];
            expect(journey.superOutcome).toEqual('Customer Checkout');
            expect(journey.outcome).toEqual('Product Removed - ' + laptop);
            expect(journey.result).toEqual('fail');
            done();
          })();
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(7);
            unit.productRemoved(laptop);
            done();
          })();
        });
      });
      describe('when purchased', () => {
        const SKUs = '12345, 6789-b';
        const price = 25; // optional
        const shipping = 3; // optional
        const discount = 15; // optional
        describe('when price', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Customer Purchase');
              expect(journey.outcome).toEqual('Purchase');
              expect(journey.skus).toEqual(['12345', '6789-b']);
              expect(journey.result).toEqual('success');
              expect(journey.price).toEqual(price);
              done();
            })();
          });
          it('then counts', () => {
            expect(countApi.fetch).toHaveBeenCalledWith({
              data: {
                uid: jasmine.any(String),
                token: '<token>',
                timestamp: jasmine.any(Number),
                outcome: 'Purchase',
                content: {leadSource: null, leadCampaign: null, leadGuid: null},
                platform: null,
                skus: ['12345', '6789-b'],
                value: price
              }
            });
          });
          beforeEach((done) => {
            (async () => {
              await storeSession('view-attribution', {
                leadSource: null,
                leadCampaign: null,
                leadGuid: null
              })
              ImmediatelyResolvePromise(7);
              countResolvePromise({"result": "success"});
              unit.purchase(SKUs, price);
              done();
            })();
          });
        });
        describe('when price and skus as array', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Customer Purchase');
              expect(journey.outcome).toEqual('Purchase');
              expect(journey.skus).toEqual(['12345', '6789-b']);
              expect(journey.result).toEqual('success');
              expect(journey.price).toEqual(price);
              done();
            })();
          });
          it('then counts', () => {
            expect(countApi.fetch).toHaveBeenCalledWith({
              data: {
                uid: jasmine.any(String),
                token: '<token>',
                timestamp: jasmine.any(Number),
                outcome: 'Purchase',
                content: {leadSource: null, leadCampaign: null, leadGuid: null},
                platform: null,
                skus: ['12345', '6789-b'],
                value: price
              }
            });
          });
          beforeEach((done) => {
            (async () => {
              await storeSession('view-attribution', {
                leadSource: null,
                leadCampaign: null,
                leadGuid: null
              })
              ImmediatelyResolvePromise(7);
              countResolvePromise({"result": "success"});
              unit.purchase(['12345', '6789-b'], price);
              done();
            })();
          });
        });
        describe('when price plus shipping', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Customer Purchase');
              expect(journey.outcome).toEqual('Purchase');
              expect(journey.skus).toEqual(['12345', '6789-b']);
              expect(journey.result).toEqual('success');
              expect(journey.price).toEqual(price);
              expect(journey.shipping).toEqual(shipping);
              done();
            })();
          });
          it('then counts', () => {
            expect(countApi.fetch).toHaveBeenCalledWith({
              data: {
                uid: jasmine.any(String),
                token: '<token>',
                timestamp: jasmine.any(Number),
                outcome: 'Purchase',
                content: {leadSource: null, leadCampaign: null, leadGuid: null},
                platform: null,
                skus: ['12345', '6789-b'],
                value: price
              }
            });
          });
          beforeEach((done) => {
            (async () => {
              await storeSession('view-attribution', {
                leadSource: null,
                leadCampaign: null,
                leadGuid: null
              })
              ImmediatelyResolvePromise(7);
              countResolvePromise({"result": "success"});
              unit.purchase(SKUs, price, null, shipping);
              done();
            })();
          });
        });
        describe('when price plus member', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Customer Purchase');
              expect(journey.outcome).toEqual('Purchase - Guest');
              expect(journey.skus).toEqual(['12345', '6789-b']);
              expect(journey.result).toEqual('success');
              done();
            })();
          });
          it('then counts', () => {
            expect(countApi.fetch).toHaveBeenCalledWith({
              data: {
                uid: jasmine.any(String),
                token: '<token>',
                timestamp: jasmine.any(Number),
                outcome: 'Purchase:Guest',
                content: {leadSource: null, leadCampaign: null, leadGuid: null},
                platform: null,
                skus: ['12345', '6789-b'],
                value: price
              }
            });
          });
          beforeEach((done) => {
            (async () => {
              await storeSession('view-attribution', {
                leadSource: null,
                leadCampaign: null,
                leadGuid: null
              })
              ImmediatelyResolvePromise(7);
              countResolvePromise({"result": "success"});
              unit.purchase(SKUs, price, null, null, "Guest");
              done();
            })();
          });
        });
        describe('when price plus discount', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Customer Purchase');
              expect(journey.outcome).toEqual('Purchase');
              expect(journey.skus).toEqual(['12345', '6789-b']);
              expect(journey.result).toEqual('success');
              expect(journey.price).toEqual(price);
              expect(journey.discount).toEqual(discount);
              done();
            })();
          });
          it('then counts', () => {
            expect(countApi.fetch).toHaveBeenCalledWith({
              data: {
                uid: jasmine.any(String),
                token: '<token>',
                timestamp: jasmine.any(Number),
                outcome: 'Purchase',
                content: {leadSource: null, leadCampaign: null, leadGuid: null},
                platform: null,
                skus: ['12345', '6789-b'],
                value: price
              }
            });
          });
          beforeEach((done) => {
            (async () => {
              await storeSession('view-attribution', {
                leadSource: null,
                leadCampaign: null,
                leadGuid: null
              })
              ImmediatelyResolvePromise(7);
              countResolvePromise({"result": "success"});
              unit.purchase(SKUs, price, discount);
              done();
            })();
          });
        });
        describe('when no price', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Customer Purchase');
              expect(journey.outcome).toEqual('Purchase');
              expect(journey.skus).toEqual(['12345', '6789-b']);
              expect(journey.result).toEqual('success');
              done();
            })();
          });
          it('then counts', () => {
            expect(countApi.fetch).toHaveBeenCalledWith({
              data: {
                uid: jasmine.any(String),
                token: '<token>',
                timestamp: jasmine.any(Number),
                outcome: 'Purchase',
                content: {leadSource: null, leadCampaign: null, leadGuid: null},
                platform: null,
                skus: ['12345', '6789-b'],
                value: 0
              }
            });
          });
          beforeEach((done) => {
            (async () => {
              await storeSession('view-attribution', {
                leadSource: null,
                leadCampaign: null,
                leadGuid: null
              })
              ImmediatelyResolvePromise(7);
              countResolvePromise({"result": "success"});
              unit.purchase(SKUs);
              done();
            })();
          });
        });
        beforeEach(() => {
          resetCalls();
        });
      });
      describe('when purchaseCanceled', () => {
        const SKUs = '12345, 6789-b';
        const price = '$25'; // optional
        describe('when SKUs and price', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Customer Purchase');
              expect(journey.outcome).toEqual('Canceled - ' + SKUs);
              expect(journey.result).toEqual('fail');
              expect(journey.price).toEqual(price);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              unit.purchaseCancel(SKUs, price);
              done();
            })();
          });
        });
        describe('when SKUs', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Customer Purchase');
              expect(journey.outcome).toEqual('Canceled - ' + SKUs);
              expect(journey.result).toEqual('fail');
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              unit.purchaseCancel(SKUs);
              done();
            })();
          });
        });
        describe('when without SKUs', () => {
          it('then creates journey with outcome', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.superOutcome).toEqual('Customer Purchase');
              expect(journey.outcome).toEqual('Canceled');
              expect(journey.result).toEqual('fail');
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(7);
              unit.purchaseCancel();
              done();
            })();
          });
        });
      });
      describe('when promiseFulfilled', () => {
        it('then creates journey with outcome', (done) => {
          (async () => {
            const journey = (await unit.journey())[0];
            expect(journey.superOutcome).toEqual('Promise Fulfillment');
            expect(journey.outcome).toEqual('Fulfilled');
            expect(journey.result).toEqual('success');
            done();
          })();
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(7);
            unit.promiseFulfilled();
            done();
          })();
        });
      });
      describe('when promiseUnfulfilled', () => {
        it('then creates journey with outcome', (done) => {
          (async () => {
            const journey = (await unit.journey())[0];
            expect(journey.superOutcome).toEqual('Promise Fulfillment');
            expect(journey.outcome).toEqual('Unfulfilled');
            expect(journey.result).toEqual('fail');
            done();
          })();
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(7);
            unit.promiseUnfulfilled();
            done();
          })();
        });
      });
      describe('when productKept', () => {
        const laptop = 'Dell XPS';
        it('then creates journey with outcome', (done) => {
          (async () => {
            const journey = (await unit.journey())[0];
            expect(journey.superOutcome).toEqual('Product Disposition');
            expect(journey.outcome).toEqual('Kept - ' + laptop);
            expect(journey.result).toEqual('success');
            done();
          })();
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(7);
            unit.productKept(laptop);
            done();
          })();
        });
      });
      describe('when productReturned', () => {
        const laptop = 'Dell XPS';
        it('then creates journey with outcome', (done) => {
          (async () => {
            const journey = (await unit.journey())[0];
            expect(journey.superOutcome).toEqual('Product Disposition');
            expect(journey.outcome).toEqual('Returned - ' + laptop);
            expect(journey.result).toEqual('fail');
            done();
          })();
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(7);
            unit.productReturned(laptop);
            done();
          })();
        });
      });
      // Stock Milestones tests
      describe('when featureAttempted', () => {
        const name = 'Scale Recipe';
        const detail = 'x2'; // optional
        describe('when has detail', () => {
          it('then has a milestone', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.category).toEqual('Feature');
              expect(journey.action).toEqual('Attempted');
              expect(journey.name).toEqual(name);
              expect(journey.details).toEqual(detail);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(10);
              unit.featureAttempted(name, detail);
              done();
            })();
          });
        });
        describe('when has no detail', () => {
          it('then has a milestone', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.category).toEqual('Feature');
              expect(journey.action).toEqual('Attempted');
              expect(journey.name).toEqual(name);
              expect(journey.details).toBe(undefined);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(10);
              unit.featureAttempted(name);
              done();
            })();
          });
        });
      });
      describe('when featureCompleted', () => {
        const name = 'Scale Recipe';
        const detail = 'x2'; // optional
        describe('when has detail', () => {
          it('then has a milestone', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.category).toEqual('Feature');
              expect(journey.action).toEqual('Completed');
              expect(journey.name).toEqual(name);
              expect(journey.details).toEqual(detail);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(10);
              unit.featureCompleted(name, detail);
              done();
            })();
          });
        });
        describe('when has no detail', () => {
          it('then has a milestone', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.category).toEqual('Feature');
              expect(journey.action).toEqual('Completed');
              expect(journey.name).toEqual(name);
              expect(journey.details).toBe(undefined);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(10);
              unit.featureCompleted(name);
              done();
            })();
          });
        });
      });
      describe('when featureFailed', () => {
        const name = 'Scale Recipe';
        const detail = 'x2'; // optional
        describe('when has detail', () => {
          it('then has a milestone', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.category).toEqual('Feature');
              expect(journey.action).toEqual('Failed');
              expect(journey.name).toEqual(name);
              expect(journey.details).toEqual(detail);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(10);
              unit.featureFailed(name, detail);
              done();
            })();
          });
        });
        describe('when has no detail', () => {
          it('then has a milestone', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.category).toEqual('Feature');
              expect(journey.action).toEqual('Failed');
              expect(journey.name).toEqual(name);
              expect(journey.details).toBe(undefined);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(10);
              unit.featureFailed(name);
              done();
            })();
          });
        });
      });
      describe('when contentViewed', () => {
        const contentType = 'Blog Post';
        const identifier = 'how-to-install-xenon-view'; // optional
        describe('when has identifier', () => {
          it('then has a milestone', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.category).toEqual('Content');
              expect(journey.action).toEqual('Viewed');
              expect(journey.type).toEqual(contentType);
              expect(journey.identifier).toEqual(identifier);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(10);
              unit.contentViewed(contentType, identifier);
              done();
            })();
          });
        });
        describe('when has no identifier', () => {
          it('then has a milestone', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.category).toEqual('Content');
              expect(journey.action).toEqual('Viewed');
              expect(journey.type).toEqual(contentType);
              expect(journey.identifier).toBe(undefined);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(10);
              unit.contentViewed(contentType);
              done();
            })();
          });
        });
      });
      describe('when contentEdited', () => {
        const contentType = 'Blog Post';
        const identifier = 'how-to-install-xenon-view'; // optional
        const detail = 'Rewrote'; //optional
        describe('when has details', () => {
          it('then has a milestone', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.category).toEqual('Content');
              expect(journey.action).toEqual('Edited');
              expect(journey.type).toEqual(contentType);
              expect(journey.details).toEqual(detail);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(10);
              unit.contentEdited(contentType, identifier, detail);
              done();
            })();
          });
        });
        describe('when has identifier', () => {
          it('then has a milestone', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.category).toEqual('Content');
              expect(journey.action).toEqual('Edited');
              expect(journey.type).toEqual(contentType);
              expect(journey.identifier).toEqual(identifier);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(10);
              unit.contentEdited(contentType, identifier);
              done();
            })();
          });
        });
        describe('when has no identifier', () => {
          it('then has a milestone', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.category).toEqual('Content');
              expect(journey.action).toEqual('Edited');
              expect(journey.type).toEqual(contentType);
              expect(journey.identifier).toBe(undefined);
              expect(journey.details).toBe(undefined);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(10);
              unit.contentEdited(contentType);
              done();
            })();
          });
        });
      });
      describe('when contentCreated', () => {
        const contentType = 'Blog Post';
        const identifier = 'how-to-install-xenon-view'; // optional
        describe('when has identifier', () => {
          it('then has a milestone', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.category).toEqual('Content');
              expect(journey.action).toEqual('Created');
              expect(journey.type).toEqual(contentType);
              expect(journey.identifier).toEqual(identifier);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(10);
              unit.contentCreated(contentType, identifier);
              done();
            })();
          });
        });
        describe('when has no identifier', () => {
          it('then has a milestone', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.category).toEqual('Content');
              expect(journey.action).toEqual('Created');
              expect(journey.type).toEqual(contentType);
              expect(journey.identifier).toBe(undefined);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(10);
              unit.contentCreated(contentType);
              done();
            })();
          });
        });
      });
      describe('when contentDeleted', () => {
        const contentType = 'Blog Post';
        const identifier = 'how-to-install-xenon-view'; // optional
        describe('when has identifier', () => {
          it('then has a milestone', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.category).toEqual('Content');
              expect(journey.action).toEqual('Deleted');
              expect(journey.type).toEqual(contentType);
              expect(journey.identifier).toEqual(identifier);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(10);
              unit.contentDeleted(contentType, identifier);
              done();
            })();
          });
        });
        describe('when has no identifier', () => {
          it('then has a milestone', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.category).toEqual('Content');
              expect(journey.action).toEqual('Deleted');
              expect(journey.type).toEqual(contentType);
              expect(journey.identifier).toBe(undefined);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(10);
              unit.contentDeleted(contentType);
              done();
            })();
          });
        });
      });
      describe('when contentArchived', () => {
        const contentType = 'Blog Post';
        const identifier = 'how-to-install-xenon-view'; // optional
        describe('when has identifier', () => {
          it('then has a milestone', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.category).toEqual('Content');
              expect(journey.action).toEqual('Archived');
              expect(journey.type).toEqual(contentType);
              expect(journey.identifier).toEqual(identifier);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(10);
              unit.contentArchived(contentType, identifier);
              done();
            })();
          });
        });
        describe('when has no identifier', () => {
          it('then has a milestone', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.category).toEqual('Content');
              expect(journey.action).toEqual('Archived');
              expect(journey.type).toEqual(contentType);
              expect(journey.identifier).toBe(undefined);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(10);
              unit.contentArchived(contentType);
              done();
            })();
          });
        });
      });
      describe('when contentRequested', () => {
        const contentType = 'Blog Post';
        const identifier = 'how-to-install-xenon-view'; // optional
        describe('when has identifier', () => {
          it('then has a milestone', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.category).toEqual('Content');
              expect(journey.action).toEqual('Requested');
              expect(journey.type).toEqual(contentType);
              expect(journey.identifier).toEqual(identifier);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(30);
              await unit.contentRequested(contentType, identifier);
              done();
            })();
          });
        });
        describe('when has no identifier', () => {
          it('then has a milestone', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.category).toEqual('Content');
              expect(journey.action).toEqual('Requested');
              expect(journey.type).toEqual(contentType);
              expect(journey.identifier).toBe(undefined);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(30);
              await unit.contentRequested(contentType);
              done();
            })();
          });
        });
      });
      describe('when contentSearched', () => {
        const contentType = 'Blog Post';
        it('then has a milestone', (done) => {
          (async () => {
            const journey = (await unit.journey())[0];
            expect(journey.category).toEqual('Content');
            expect(journey.action).toEqual('Searched');
            expect(journey.type).toEqual(contentType);
            done();
          })();
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(30);
            await unit.contentSearched(contentType);
            done();
          })();
        });
      });
      describe('when pageLoadTime', () => {
        const loadTime = 0.31;
        const url = 'http://example.com';
        it('then has a milestone', (done) => {
          (async () => {
            const journey = (await unit.journey())[0];
            expect(journey.category).toEqual('Webpage Load Time');
            expect(journey.time).toEqual('0.31');
            expect(journey.identifier).toEqual(url);
            done();
          })();
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(30);
            await unit.pageLoadTime(loadTime, url);
            done();
          })();
        });
      });
      // Custom Milestones tests
      describe('when custom milestone', () => {
        let category = 'Function';
        let operation = 'Called';
        let name = 'Query Database';
        let detail = 'User Lookup';
        describe('when stock', () => {
          it('then has a milestone', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.category).toEqual(category);
              expect(journey.action).toEqual(operation);
              expect(journey.name).toEqual(name);
              expect(journey.details).toEqual(detail);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(11);
              await unit.milestone(category, operation, name, detail);
              done();
            })();
          });
        });
        describe('when stock with url', () => {
          const url = "https://www.example.com";
          it('then has a milestone', (done) => {
            (async () => {
              const journey = (await unit.journey())[0];
              expect(journey.category).toEqual(category);
              expect(journey.action).toEqual(operation);
              expect(journey.name).toEqual(name);
              expect(journey.details).toEqual(detail);
              expect(journey.url).toEqual(url)
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(11);
              unit.pageURL(url);
              await unit.milestone(category, operation, name, detail);
              done();
            })();
          });
        });
      });
      // Internals
      describe('when adding duplicate feature', () => {
        const feature = 'duplicate';
        it('then has a journey with a single event', (done) => {
          (async () => {
            const journey = (await unit.journey());
            expect(journey[0].count).toEqual(2);
            expect(journey.length).toEqual(1);
            done();
          })();
        });
        describe('when adding third duplicate', () => {
          it('then has a count of 3', (done) => {
            (async () => {
              const journey = (await unit.journey());
              expect(journey[0].count).toEqual(3);
              expect(journey.length).toEqual(1);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(20);
              await unit.featureAttempted(feature);
              done();
            })();
          });
        });
        describe('when adding new milestone', () => {
          it('then has a count of 2', (done) => {
            (async () => {
              const journey = (await unit.journey());
              expect(journey[0].count).toEqual(2);
              expect(journey.length).toEqual(2);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(20);
              await unit.milestone('category', 'operation', 'name', 'detail');
              done();
            })();
          });
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(20);
            await unit.featureAttempted(feature);
            ImmediatelyResolvePromise(20);
            await unit.featureAttempted(feature);
            done();
          })();
        });
      });
      describe('when adding duplicate content', () => {
        const name = 'duplicate';
        it('then has a journey with a single event', (done) => {
          (async () => {
            const journey = (await unit.journey());
            expect(journey[0].count).toEqual(2);
            expect(journey.length).toEqual(1);
            done();
          })();
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(20);
            await unit.contentSearched(name);
            ImmediatelyResolvePromise(20);
            await unit.contentSearched(name);
            done();
          })();
        });
      });
      describe('when adding duplicate content with identifier', () => {
        const name = 'duplicate';
        it('then has a journey with a single event', (done) => {
          (async () => {
            const journey = (await unit.journey());
            expect(journey[0].count).toEqual(2);
            expect(journey.length).toEqual(1);
            done();
          })();
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(20);
            await unit.contentEdited(name, 'identifier');
            ImmediatelyResolvePromise(20);
            await unit.contentEdited(name, 'identifier');
            done();
          })();
        });
      });
      describe('when adding duplicate content with detail', () => {
        const name = 'duplicate';
        it('then has a journey with a single event', (done) => {
          (async () => {
            const journey = (await unit.journey());
            expect(journey[0].count).toEqual(2);
            expect(journey.length).toEqual(1);
            done();
          })();
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(20);
            await unit.contentEdited(name, 'identifier', 'detail');
            ImmediatelyResolvePromise(20);
            await unit.contentEdited(name, 'identifier', 'detail');
            done();
          })();
        });
      });
      describe('when adding duplicate milestone', () => {
        const category = 'Function';
        const operation = 'Called';
        const name = 'Query Database';
        const detail = 'User Lookup';
        it('then has a journey with a single event', (done) => {
          (async () => {
            const journey = (await unit.journey());
            expect(journey[0].count).toEqual(2);
            expect(journey.length).toEqual(1);
            done();
          })();
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(20);
            await unit.milestone(category, operation, name, detail);
            ImmediatelyResolvePromise(20);
            await unit.milestone(category, operation, name, detail);
            done();
          })();
        });
      });
      describe('when adding almost duplicate feature', () => {
        const feature = 'almostDup';
        it('then has a journey with a 2 events', (done) => {
          (async () => {
            const journey = (await unit.journey());
            expect(journey.length).toEqual(2);
            done();
          })();
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(20);
            await unit.featureAttempted(feature);
            ImmediatelyResolvePromise(20);
            await unit.featureCompleted(feature);
            done();
          })();
        });
      });
      describe('when adding almost duplicate content', () => {
        const name = 'Scale Recipe';
        it('then has a journey with a 2 events', (done) => {
          (async () => {
            const journey = (await unit.journey());
            expect(journey.length).toEqual(2);
            done();
          })();
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(20);
            await unit.contentViewed(name);
            ImmediatelyResolvePromise(20);
            await unit.contentSearched(name);
            done();
          })();
        });
      });
      describe('when adding almost duplicate content with identifier', () => {
        const name = 'Scale Recipe';
        it('then has a journey with a 2 events', (done) => {
          (async () => {
            const journey = (await unit.journey());
            expect(journey.length).toEqual(2);
            done();
          })();
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(20);
            await unit.contentEdited(name, 'identifier');
            ImmediatelyResolvePromise(20);
            await unit.contentEdited(name, 'identifier2');
            done();
          })();
        });
      });
      describe('when adding almost duplicate content with detail', () => {
        const name = 'Scale Recipe';
        it('then has a journey with a 2 events', (done) => {
          (async () => {
            const journey = (await unit.journey());
            expect(journey.length).toEqual(2);
            done();
          })();
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(20);
            await unit.contentEdited(name, 'identifier', 'detail');
            ImmediatelyResolvePromise(20);
            await unit.contentEdited(name, 'identifier', 'detail2');
            done();
          })();
        });
      });
      describe('when adding almost duplicate milestone', () => {
        const category = 'Function';
        const operation = 'Called';
        const name = 'Query Database';
        const detail = 'User Lookup';
        it('then has a journey with a 2 events', (done) => {
          (async () => {
            const journey = (await unit.journey());
            expect(journey.length).toEqual(2);
            done();
          })();
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(20);
            await unit.milestone(category, operation, name, detail);
            ImmediatelyResolvePromise(20);
            await unit.milestone(category, operation, name, detail + '2');
            done();
          })();
        });
      });
      describe('when resetting', () => {
        const feature = 'resetting';
        describe('when restoring', () => {
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(20);
              await unit.restore();
              done();
            })();
          });
          it('then has a journey with added event', (done) => {
            (async () => {
              const journey = (await unit.journey());
              expect(journey.length).toEqual(1);
              expect(journey[0].name).toEqual(feature + " 1st");
              done();
            })();
          });
        });
        describe('when restoring dulicates', () => {
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(20);
              await unit.restore([{name: 'a', timestamp: 1}, {name: 'b', timestamp: 1}]);
              done();
            })();
          });
          it('then has a journey with added event', (done) => {
            (async () => {
              const journey = (await unit.journey());
              expect(journey.length).toEqual(2);
              expect(journey[0].name).toEqual("a");
              done();
            })();
          });
        });
        describe('when restoring after another event was added', () => {
          const anotherFeature = 'resetting2';
          it('then adds new event at end of previous journey', (done) => {
            (async () => {
              const journey = (await unit.journey());
              expect(journey.length).toEqual(2);
              expect(journey[1].name).toEqual(anotherFeature);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(20);
              await unit.featureAttempted(anotherFeature);
              ImmediatelyResolvePromise(20);
              await unit.restore();
              done();
            })();
          });
        });
        describe('when restoring out of order', () => {
          beforeEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(20);
              await unit.restore();
              ImmediatelyResolvePromise(20);
              const saveFirst = await unit.reset();
              const timestamp1 = saveFirst[0].timestamp;
              ImmediatelyResolvePromise(20);
              await unit.storeJourney([{
                category: 'Feature',
                action: 'Attempted',
                name: feature + " 2nd",
                timestamp: timestamp1 + 0.001
              }]);
              ImmediatelyResolvePromise(20);
              const saveSecond = await unit.reset();
              ImmediatelyResolvePromise(20);
              await unit.storeJourney([{
                category: 'Feature',
                action: 'Attempted',
                name: feature + " 3rd",
                timestamp: timestamp1 + 0.002
              }]);
              ImmediatelyResolvePromise(20);
              const saveThird = await unit.reset();
              ImmediatelyResolvePromise(20);
              await unit.restore(saveThird);
              ImmediatelyResolvePromise(20);
              await unit.restore(saveFirst);
              ImmediatelyResolvePromise(20);
              await unit.restore(saveSecond);
              done();
            })();
          });
          it('should restore inorder', (done) => {
            (async () => {
              const journey = (await unit.journey());
              expect(journey.length).toEqual(3);
              const subjourney = journey[1];
              expect(subjourney.name).toEqual('resetting 2nd');
              done();
            })();
          });
        })
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(20);
            await unit.featureAttempted(feature + " 1st");
            ImmediatelyResolvePromise(20);
            await unit.reset();
            done();
          })();
        });
      });
      describe('when adding an event after reset', () => {
        const feature = 'postreset';
        it('then has a journey with only event', (done) => {
          (async () => {
            const journey = (await unit.journey());
            expect(journey.length).toEqual(1);
            const subjourney = journey[0];
            expect(subjourney.name).toEqual(feature);
            done();
          })();
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(20);
            await unit.reset();
            ImmediatelyResolvePromise(20);
            await unit.featureAttempted(feature);
            done();
          })();
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
      describe('autodiscoverLeadFrom', () => {
        beforeEach(() => {
          localStorage.clear();
          sessionStorage.clear();
          resetCalls();
          MockPromises.reset();
          ImmediatelyResolveAllPromises();
        });
        describe('when custom xenon attribution', () => {
          let filteredQuery = '';
          it('then has tags', (done) => {
            (async () => {
              const tags = await retrieveSession('view-tags');
              expect(tags).toContain("email");
              expect(tags).toContain("2024");
              done();
            })();
          });
          it('then filters appropriately', () => {
            expect(filteredQuery).toEqual("");
          });
          describe('when repeated', () => {
            it('then has same tags', (done) => {
              (async () => {
                const tags = await retrieveSession('view-tags');
                expect(tags).toContain("email");
                expect(tags).toContain("2024");
                done();
              })();
            });
            it('then has attribution', (done) => {
              (async () => {
                const attribution = await retrieveSession('view-attribution');
                expect(attribution).toEqual({leadSource: 'email', leadCampaign: '2024', leadGuid: null});
                done();
              })();
            })
            beforeEach((done) => {
              (async () => {
                await resetSession('view-attribution');
                await unit.autodiscoverLeadFrom('?xenonSrc=email&xenonId=2024');
                done();
              })();
            });
          });
          beforeEach((done) => {
            (async () => {
              countResolvePromise({"result": "success"});
              filteredQuery = await unit.autodiscoverLeadFrom('?xenonSrc=email&xenonId=2024');
              done();
            })();
          });
        });
        describe('when xenon end user id passed', () => {
          let filteredQuery = '';
          it('then has expected ID', (done) => {
            (async () => {
              const euid = await unit.id();
              expect(euid).toEqual("1234-5678");
              done();
            })();
          });
          it('then filters appropriately', () => {
            expect(filteredQuery).toEqual("");
          });
          beforeEach((done) => {
            (async () => {
              countResolvePromise({"result": "success"});
              filteredQuery = await unit.autodiscoverLeadFrom('?xenon_euid=1234-5678');
              done();
            })();
          });
        });
        describe('when custom xenon attribution with only source', () => {
          let filteredQuery = '';
          it('then has tags', (done) => {
            (async () => {
              const tags = await retrieveSession('view-tags');
              expect(tags).toContain("email");
              done();
            })();
          });
          it('then filters appropriately', () => {
            expect(filteredQuery).toEqual("");
          });
          beforeEach((done) => {
            (async () => {
              countResolvePromise({"result": "success"});
              filteredQuery = await unit.autodiscoverLeadFrom('?xenonSrc=email');
              done();
            })();
          });
        });
        describe('when Google Merchant', () => {
          let filteredQuery = '';
          it('then has tags', (done) => {
            (async () => {
              const tags = await retrieveSession('view-tags');
              expect(tags).toContain("Google Merchant");
              expect(tags).toContain("2024");
              done();
            })();
          });
          it('then filters appropriately', () => {
            expect(filteredQuery).toEqual("?srsltid=2024");
          });
          beforeEach((done) => {
            (async () => {
              countResolvePromise({"result": "success"});
              filteredQuery = await unit.autodiscoverLeadFrom('?srsltid=2024');
              done();
            })();
          });
        });
        /* codex add test here */
        describe('when Cerebro attribution', () => {
          let filteredQuery = '';
          it('then has tags', (done) => {
            (async () => {
              const tags = await retrieveSession('view-tags');
              expect(tags).toContain("Cerebro");
              expect(tags).toContain("2024");
              done();
            })();
          });
          it('then filters appropriately', () => {
            expect(filteredQuery).toEqual("?cr_campaignid=2024");
          });
          beforeEach((done) => {
            (async () => {
              countResolvePromise({"result": "success"});
              filteredQuery = await unit.autodiscoverLeadFrom('?cr_campaignid=2024');
              done();
            })();
          });
          describe('when duplicate added', () => {
            it('then has tags', (done) => {
              (async () => {
                const tags = await retrieveSession('view-tags');
                expect(tags).toContain("Cerebro");
                expect(tags).toContain("2024");
                done();
              })();
            });
            it('then filters appropriately', () => {
              expect(filteredQuery).toEqual("?cr_campaignid=2024");
            });
            beforeEach((done) => {
              (async () => {
                countResolvePromise({"result": "success"});
                filteredQuery = await unit.autodiscoverLeadFrom('?cr_campaignid=2024');
                done();
              })();
            });
          });
        });
        describe('when Klaviyo attribution', () => {
          let filteredQuery = '';
          it('then has tags', (done) => {
            (async () => {
              const tags = await retrieveSession('view-tags');
              expect(tags).toContain("Klaviyo");
              expect(tags).toContain("2024");
              done();
            })();
          });
          it('then filters appropriately', () => {
            expect(filteredQuery).toEqual("?utm_source=klaviyo&utm_campaign=2024");
          });
          beforeEach((done) => {
            (async () => {
              countResolvePromise({"result": "success"});
              filteredQuery = await unit.autodiscoverLeadFrom('?utm_source=klaviyo&utm_campaign=2024');
              done();
            })();
          });
        });
        describe('when Klaviyo with medium attribution', () => {
          let filteredQuery = '';
          it('then has tags', (done) => {
            (async () => {
              const tags = await retrieveSession('view-tags');
              expect(tags).toContain("Klaviyo - email");
              expect(tags).toContain("2024");
              done();
            })();
          });
          it('then filters appropriately', () => {
            expect(filteredQuery).toEqual("?utm_source=klaviyo&utm_campaign=2024&utm_medium=email");
          });
          beforeEach((done) => {
            (async () => {
              countResolvePromise({"result": "success"});
              filteredQuery = await unit.autodiscoverLeadFrom('?utm_source=klaviyo&utm_campaign=2024&utm_medium=email');
              done();
            })();
          });
        });
        describe('when Google Ad', () => {
          let filteredQuery = '';
          it('then has tags', (done) => {
            (async () => {
              const tags = await retrieveSession('view-tags');
              expect(tags).toContain("Google Ad");
              expect(tags).toContain("2024");
              done();
            })();
          });
          it('then filters appropriately', () => {
            expect(filteredQuery).toEqual("?g_campaignid=2024");
          });
          beforeEach((done) => {
            (async () => {
              countResolvePromise({"result": "success"});
              filteredQuery = await unit.autodiscoverLeadFrom('?g_campaignid=2024');
              done();
            })();
          });
        });
        describe('when Share-a-sale ads method 1', () => {
          let filteredQuery = '';
          it('then has tags', (done) => {
            (async () => {
              const tags = await retrieveSession('view-tags');
              expect(tags).toContain("Share-a-sale");
              expect(tags).toContain("2024");
              done();
            })();
          });
          it('then filters appropriately', () => {
            expect(filteredQuery).toEqual("?utm_source=shareasale&sscid=2024");
          });
          beforeEach((done) => {
            (async () => {
              countResolvePromise({"result": "success"});
              filteredQuery = await unit.autodiscoverLeadFrom('?utm_source=shareasale&sscid=2024');
              done();
            })();
          });
        });
        describe('when Share-a-sale ads method 2', () => {
          let filteredQuery = '';
          it('then has tags', (done) => {
            (async () => {
              const tags = await retrieveSession('view-tags');
              expect(tags).toContain("Share-a-sale");
              expect(tags).toContain("2024");
              done();
            })();
          });
          it('then filters appropriately', () => {
            expect(filteredQuery).toEqual("?sscid=2024");
          });
          beforeEach((done) => {
            (async () => {
              countResolvePromise({"result": "success"});
              filteredQuery = await unit.autodiscoverLeadFrom('?sscid=2024');
              done();
            })();
          });
        });
        describe('when Google Organic', () => {
          let filteredQuery = '';
          it('then has tags', (done) => {
            (async () => {
              const tags = await retrieveSession('view-tags');
              expect(tags).toContain("Google Organic");
              expect(tags).toContain("2024");
              done();
            })();
          });
          it('then filters appropriately', () => {
            expect(filteredQuery).toEqual("?g_adtype=none&g_campaign=2024");
          });
          beforeEach((done) => {
            (async () => {
              countResolvePromise({"result": "success"});
              filteredQuery = await unit.autodiscoverLeadFrom('?g_adtype=none&g_campaign=2024');
              done();
            })();
          });
        });
        describe('when Google Paid Search', () => {
          let filteredQuery = '';
          it('then has tags', (done) => {
            (async () => {
              const tags = await retrieveSession('view-tags');
              expect(tags).toContain("Google Paid Search");
              expect(tags).toContain("2024");
              done();
            })();
          });
          it('then filters appropriately', () => {
            expect(filteredQuery).toEqual("?g_adtype=search&g_campaign=2024");
          });
          beforeEach((done) => {
            (async () => {
              countResolvePromise({"result": "success"});
              filteredQuery = await unit.autodiscoverLeadFrom('?g_adtype=search&g_campaign=2024');
              done();
            })();
          });
        });
        describe('when Facebook Ad', () => {
          let filteredQuery = '';
          it('then has tags', (done) => {
            (async () => {
              const tags = await retrieveSession('view-tags');
              expect(tags).toContain("Facebook Ad");
              expect(tags).toContain("2024");
              done();
            })();
          });
          it('then filters appropriately', () => {
            expect(filteredQuery).toEqual("?utm_source=facebook&utm_campaign=2024");
          });
          beforeEach((done) => {
            (async () => {
              countResolvePromise({"result": "success"});
              filteredQuery = await unit.autodiscoverLeadFrom('?utm_source=facebook&utm_campaign=2024');
              done();
            })();
          });
        });
        describe('when Email', () => {
          let filteredQuery = '';
          it('then has tags', (done) => {
            (async () => {
              const tags = await retrieveSession('view-tags');
              expect(tags).toContain("Email");
              expect(tags).toContain("2024");
              done();
            })();
          });
          it('then filters appropriately', () => {
            expect(filteredQuery).toEqual("?utm_source=email-broadcast&utm_campaign=2024");
          });
          beforeEach((done) => {
            (async () => {
              countResolvePromise({"result": "success"});
              filteredQuery = await unit.autodiscoverLeadFrom('?utm_source=email-broadcast&utm_campaign=2024');
              done();
            })();
          });
        });
        describe('when YouTube', () => {
          let filteredQuery = '';
          it('then has tags', (done) => {
            (async () => {
              const tags = await retrieveSession('view-tags');
              expect(tags).toContain("YouTube");
              expect(tags).toContain("2024");
              done();
            })();
          });
          it('then filters appropriately', () => {
            expect(filteredQuery).toEqual("?utm_source=youtube&utm_campaign=2024");
          });
          beforeEach((done) => {
            (async () => {
              countResolvePromise({"result": "success"});
              filteredQuery = await unit.autodiscoverLeadFrom('?utm_source=youtube&utm_campaign=2024');
              done();
            })();
          });
        });
        describe('when YouTube with previous variant', () => {
          it('then has tags', (done) => {
            (async () => {
              const tags = await retrieveSession('view-tags');
              expect(tags).toContain("YouTube");
              expect(tags).toContain("2024");
              expect(tags).toContain("test");
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              countResolvePromise({"result": "success"});
              await unit.variant(['test'])
              await unit.autodiscoverLeadFrom('?utm_source=youtube&utm_campaign=2024');
              done();
            })();
          });
        });
        describe('when Other', () => {
          let filteredQuery = '';
          it('then has tags', (done) => {
            (async () => {
              const tags = await retrieveSession('view-tags');
              expect(tags).toContain("instagram");
              expect(tags).toContain("2024");
              done();
            })();
          });
          it('then filters appropriately', () => {
            expect(filteredQuery).toEqual("?utm_source=instagram&utm_campaign=2024");
          });
          beforeEach((done) => {
            (async () => {
              countResolvePromise({"result": "success"});
              filteredQuery = await unit.autodiscoverLeadFrom('?utm_source=instagram&utm_campaign=2024');
              done();
            })();
          });
        });
        describe('when None', () => {
          let filteredQuery = '';
          it('then has tags', (done) => {
            (async () => {
              const tags = await retrieveSession('view-tags');
              expect(tags).toContain("Unattributed");
              done();
            })();
          });
          it('then filters appropriately', () => {
            expect(filteredQuery).toEqual('');
          });
          it('then counts', () => {
            expect(countApi.fetch).toHaveBeenCalledWith({
              data: {
                uid: jasmine.any(String),
                token: '<token>',
                timestamp: jasmine.any(Number),
                outcome: 'Attribution',
                content: {leadSource: 'Unattributed', leadCampaign: null, leadGuid: null},
                platform: null,
                skus: null,
                value: 0
              }
            });
          });
          beforeEach((done) => {
            (async () => {
              countResolvePromise({"result": "success"});
              await unit.autodiscoverLeadFrom('');
              countResolvePromise({"result": "success"});
              await unit.autodiscoverLeadFrom('');
              await resetSession('view-attribution');
              countResolvePromise({"result": "success"});
              filteredQuery = await unit.autodiscoverLeadFrom('');
              done();
            })();
          });
        });
        describe('when no Query', () => {
          let filteredQuery = '';
          it('then has tags', (done) => {
            (async () => {
              const tags = await retrieveSession('view-tags');
              expect(tags).toContain("Unattributed");
              done();
            })();
          });
          it('then filters appropriately', () => {
            expect(filteredQuery).toEqual('?hello=world');
          });
          beforeEach((done) => {
            (async () => {
              countResolvePromise({"result": "success"});
              filteredQuery = await unit.autodiscoverLeadFrom('?hello=world');
              done();
            })();
          });
        });
        describe('when None previous variant', () => {
          it('then has tags', (done) => {
            (async () => {
              const tags = await retrieveSession('view-tags');
              expect(tags).toContain('test', "unattributed");
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              countResolvePromise({"result": "success"});
              await unit.variant(['test'])
              await unit.autodiscoverLeadFrom('');
              done();
            })();
          });
        });
        describe('when other query and previous variant', () => {
          it('then has tags', (done) => {
            (async () => {
              const tags = await retrieveSession('view-tags');
              expect(tags).toContain('test', "unattributed");
              expect(tags).not.toContain(null);
              done();
            })();
          });
          beforeEach((done) => {
            (async () => {
              countResolvePromise({"result": "success"});
              await unit.variant(['test'])
              await unit.autodiscoverLeadFrom('?abc=123');
              done();
            })();
          });
        });
        afterEach(() => {
          localStorage.clear();
          sessionStorage.clear();
          ResetImmediatelyResolvePromises();
        });
      });
      // API Communication tests
      describe('when committing a journey', () => {
        const feature = 'committing';
        describe('when default', () => {
          let resolveCommitPromise = null;
          let rejectCommitPromise = null;
          let caughtError = null;
          let capturedValue = null;
          let commitPromise;
          describe('when normal', () => {
            describe('when API passes', () => {
              beforeEach((done) => {
                commitPromise = new Promise(function (resolve, reject) {
                  resolveCommitPromise = resolve;
                  rejectCommitPromise = reject;
                });
                (async () => {
                  resolveCommitPromise({"result": "success"});
                  await commitPromise
                  UnblockPromises();
                  ImmediatelyResolvePromise(30);
                  unit.commit()
                  done();
                })();
              });
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
              it('then resets journey', (done) => {
                (async () => {
                  expect(await unit.journey()).toEqual([]);
                  done();
                })();
              });
            });
            describe('when API fails', () => {
              it('then restores journey', (done) => {
                (async () => {
                  const journey = await unit.journey();
                  expect(journey.length).toEqual(1);
                  const subjourney = journey[0];
                  expect(subjourney.name).toEqual(feature);
                  done();
                })();
              });
              beforeEach((done) => {
                commitPromise = new Promise(function (resolve, reject) {
                  resolveCommitPromise = resolve;
                  rejectCommitPromise = reject;
                });
                (async () => {
                  try {
                    rejectCommitPromise(new Error("Failure"));
                    await commitPromise
                  } catch (e) {
                  }
                  UnblockPromises();
                  ImmediatelyResolvePromise(30);
                  unit.commit()
                  done();
                })();
              });
            });
            beforeEach(() => {
              journeyApi.fetch.and.callFake(() => {
                return commitPromise
              });
            });
          });
          describe('when surfacing', () => {
            describe('when API fails', () => {
              it('then rethrows', () => {
                expect(caughtError.toString()).toEqual('Error: failure');
              });
              beforeEach((done) => {
                commitPromise = new Promise(function (resolve, reject) {
                  resolveCommitPromise = resolve;
                  rejectCommitPromise = reject;
                });
                (async () => {
                  try {
                    rejectCommitPromise(new Error("failure"));
                    await commitPromise
                  } catch (e) {
                  }
                  UnblockPromises();
                  ImmediatelyResolvePromise(30);
                  try {
                    await unit.commit(true)
                  } catch (e) {
                    caughtError = e.toString();
                  }
                  done();
                })();
              });
            });
            describe('when API succeeds', () => {
              it('then gets success', () => {
                expect(capturedValue.toString()).toEqual('success');
              });
              beforeEach((done) => {
                commitPromise = new Promise(function (resolve, reject) {
                  resolveCommitPromise = resolve;
                  rejectCommitPromise = reject;
                });
                (async () => {
                  resolveCommitPromise("success");
                  await commitPromise
                  UnblockPromises();
                  ImmediatelyResolvePromise(30);
                  capturedValue = await unit.commit(true)
                  done();
                })();
              });
            });
            beforeEach(() => {
              journeyApi.fetch.and.callFake(() => {
                return commitPromise
              });
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
          beforeEach((done) => {
            (async () => {
              let resolveCommitPromise;
              let promise = new Promise(function (resolve, reject) {
                resolveCommitPromise = resolve;
              });
              journeyApi.fetch.and.returnValue(promise);
              ImmediatelyResolvePromise(30);
              await unit.init(customKey);
              ImmediatelyResolvePromise(30);
              resolveCommitPromise({"result": "success"});
              await unit.commit();
              done();
            })();
          });
          afterEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(30);
              await unit.init(apiKey);
              done();
            })();
          });
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(30);
            await unit.featureAttempted(feature);
            done();
          })();
        });
      });
      describe('when heartbeating', () => {
        const feature = 'heartbeating';
        describe('when default', () => {
          let resolvePromise = null;
          let rejectPromise = null;
          let caughtError = null;
          describe('when default api call', () => {
            describe('when API Successful', () => {
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
              it('then resets journey', (done) => {
                (async () => {
                  expect(await unit.journey()).toEqual([]);
                  done();
                })();
              });
              beforeEach((done) => {
                (async () => {
                  let promise = new Promise(function (resolve, reject) {
                    resolvePromise = resolve;
                    rejectPromise = reject;
                  });
                  heartbeatApi.fetch.and.returnValue(promise);
                  resolvePromise({"Result": "Success"});
                  await promise;
                  UnblockPromises();
                  await unit.heartbeat();
                  done();
                })();
              });
            });
            describe('when API fails', () => {
              it('then restores journey', (done) => {
                (async () => {
                  const journey = await unit.journey();
                  expect(journey.length).toEqual(1);
                  const subjourney = journey[0];
                  expect(subjourney.name).toEqual(feature);
                  done();
                })();
              });
              beforeEach((done) => {
                (async () => {
                  let promise = new Promise(function (resolve, reject) {
                    resolvePromise = resolve;
                    rejectPromise = reject;
                  });
                  heartbeatApi.fetch.and.returnValue(promise);
                  try {
                    rejectPromise(new Error('failure'));
                    await promise;
                  } catch (e) {
                  }
                  UnblockPromises();
                  await unit.heartbeat();
                  done();
                })();
              });
            });
          });
          describe('when surface errors', () => {
            describe('when API fails', () => {
              it('then rethrows', () => {
                expect(caughtError.toString()).toEqual('Error: failure');
              });
            });
            beforeEach((done) => {
              let promise = new Promise(function (resolve, reject) {
                resolvePromise = resolve;
                rejectPromise = reject;
              });
              heartbeatApi.fetch.and.returnValue(promise);
              (async () => {
                try {
                  rejectPromise(new Error("failure"));
                  await promise
                } catch (e) {
                }
                UnblockPromises();
                ImmediatelyResolvePromise(30);
                try {
                  await unit.heartbeat(true)
                } catch (e) {
                  caughtError = e.toString();
                }
                done();
              })();
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
          beforeEach((done) => {
            (async () => {
              let promise = new Promise(function (resolve, reject) {
                resolvePromise = resolve;
                rejectPromise = reject;
              });
              heartbeatApi.fetch.and.returnValue(promise);
              resolvePromise({"Result": "Success"});
              await promise;
              UnblockPromises();
              await unit.variant(['tag']);
              await unit.heartbeat();
              done();
            })();
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
          beforeEach((done) => {
            (async () => {
              let promise = new Promise(function (resolve, reject) {
                resolvePromise = resolve;
                rejectPromise = reject;
              });
              heartbeatApi.fetch.and.returnValue(promise);
              resolvePromise({"Result": "Success"});
              await promise;
              UnblockPromises();
              await unit.platform('a', 'b', 'c', 'd');
              await unit.heartbeat();
              done();
            })();
          });
        });
        describe('when ecom abandonment', () => {
          let resolvePromise = null;
          let rejectPromise = null;
          let heartbeatPromise;
          beforeEach((done) => {
            heartbeatPromise = new Promise(function (resolve, reject) {
              resolvePromise = resolve;
              rejectPromise = reject;
            });
            heartbeatApi.fetch.and.returnValue(heartbeatPromise);
            (async () => {
              ImmediatelyResolvePromise(30);
              await unit.ecomAbandonment();
              done();
            })();
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
            beforeEach((done) => {
              (async () => {
                countResolvePromise({"result": "success"});
                sampleResolvePromise({sample: true});
                resolvePromise({"Result": "Success"});
                await heartbeatPromise;
                UnblockPromises();
                ImmediatelyResolvePromise(30);
                await unit.heartbeat();
                done();
              })();
            });
            afterEach((done) => {
              (async () => {
                ImmediatelyResolvePromise(30);
                await unit.reset();
                done();
              })();
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
                    {
                      superOutcome: 'Add Product To Cart',
                      outcome: 'Add - product',
                      result: 'success',
                      timestamp: jasmine.any(Number)
                    }
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
            beforeEach((done) => {
              (async () => {
                ImmediatelyResolvePromise(30);
                countResolvePromise({"result": "success"});
                await unit.productAddedToCart("product")
                resolvePromise({"Result": "Success"});
                await heartbeatPromise;
                sampleResolvePromise({sample: true});
                UnblockPromises();
                ImmediatelyResolvePromise(30);
                await unit.heartbeat();
                done();
              })();
            });
            afterEach((done) => {
              (async () => {
                ImmediatelyResolvePromise(30);
                await unit.reset();
                done();
              })();
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
                    {
                      superOutcome: 'Customer Checkout',
                      outcome: 'Check Out',
                      result: 'success',
                      timestamp: jasmine.any(Number)
                    }
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
            beforeEach((done) => {
              (async () => {
                ImmediatelyResolvePromise(30);
                countResolvePromise({"result": "success"});
                await unit.checkOut();
                resolvePromise({"Result": "Success"});
                await heartbeatPromise;
                sampleResolvePromise({sample: true});
                UnblockPromises();
                ImmediatelyResolvePromise(30);
                await unit.heartbeat();
                done();
              })();
            });
            afterEach((done) => {
              (async () => {
                ImmediatelyResolvePromise(30);
                await unit.reset();
                done();
              })();
            });
          });
          describe('when ecom stage 3', () => {
            it('then calls the view heartbeat API', () => {
              expect(HeartbeatApi).toHaveBeenCalledWith(apiUrl);
              expect(heartbeatApi.fetch).toHaveBeenCalledWith({
                data: {
                  id: jasmine.any(String),
                  journey: [
                    {category: 'Feature', action: 'Attempted', name: feature, timestamp: jasmine.any(Number)},
                    {
                      superOutcome: 'Customer Purchase',
                      outcome: 'Purchase',
                      skus: ['SKU'],
                      result: 'success',
                      timestamp: jasmine.any(Number)
                    }
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
            it('then resets heartbeat state', (done) => {
              (async () => {
                const type = await retrieveLocal('heartbeat_type');
                const outcome = await retrieveLocal('heartbeat_outcome');
                const stage = await retrieveLocal('heartbeat_stage');
                expect(type).toBeNull();
                expect(outcome).toBeNull();
                expect(stage).toBeNull();
                done();
              })();
            });
            beforeEach((done) => {
              (async () => {
                ImmediatelyResolvePromise(30);
                countResolvePromise({"result": "success"});
                await unit.purchase(['SKU']);
                resolvePromise({"Result": "Success"});
                await heartbeatPromise;
                sampleResolvePromise({sample: true});
                UnblockPromises();
                ImmediatelyResolvePromise(30);
                await unit.heartbeat();
                done();
              })();
            });
            afterEach((done) => {
              (async () => {
                ImmediatelyResolvePromise(30);
                await unit.reset();
                done();
              })();
            });
          });
        });
        describe('when custom abandonment', () => {
          let resolvePromise = null;
          let rejectPromise = null;
          let heartbeatPromise;
          beforeEach((done) => {
            (async () => {
              heartbeatPromise = new Promise(function (resolve, reject) {
                resolvePromise = resolve;
                rejectPromise = reject;
              });
              heartbeatApi.fetch.and.returnValue(heartbeatPromise);
              await unit.customAbandonment({
                expires_in_seconds: 600,
                if_abandoned: {
                  superOutcome: 'Custom',
                  outcome: 'Abandoned',
                  result: 'fail'
                }
              });
              done();
            })();
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
            beforeEach((done) => {
              (async () => {
                ImmediatelyResolvePromise(30);
                countResolvePromise({"result": "success"});
                resolvePromise({"Result": "Success"});
                await heartbeatPromise;
                sampleResolvePromise({sample: true});
                UnblockPromises();
                ImmediatelyResolvePromise(30);
                await unit.heartbeat();
                done();
              })();
            });
            afterEach((done) => {
              (async () => {
                ImmediatelyResolvePromise(30);
                await unit.reset();
                done();
              })();
            });
          });
        });
        describe('when canceling abandonment', () => {
          let resolvePromise = null;
          let rejectPromise = null;
          let heartbeatPromise;
          beforeEach((done) => {
            heartbeatPromise = new Promise(function (resolve, reject) {
              resolvePromise = resolve;
              rejectPromise = reject;
            });
            heartbeatApi.fetch.and.returnValue(heartbeatPromise);
            (async () => {
              ImmediatelyResolvePromise(30);
              await unit.cancelAbandonment();
              done();
            })();
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
            it('then resets heartbeat state', (done) => {
              (async () => {
                const type = await retrieveLocal('heartbeat_type');
                const outcome = await retrieveLocal('heartbeat_outcome');
                const stage = await retrieveLocal('heartbeat_stage');
                expect(type).toBeNull();
                expect(outcome).toBeNull();
                expect(stage).toBeNull();
                done();
              })();
            });
            beforeEach((done) => {
              (async () => {
                ImmediatelyResolvePromise(30);
                countResolvePromise({"result": "success"});
                resolvePromise({"Result": "Success"});
                await heartbeatPromise;
                sampleResolvePromise({sample: true});
                UnblockPromises();
                ImmediatelyResolvePromise(30);
                await unit.heartbeat();
                done();
              })();
            });
            afterEach((done) => {
              (async () => {
                ImmediatelyResolvePromise(30);
                await unit.reset();
                done();
              })();
            });
          });
        });
        beforeEach((done) => {
          (async () => {
            ImmediatelyResolvePromise(30);
            await unit.featureAttempted(feature);
            done();
          })();
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
          beforeEach((done) => {
            (async () => {
              let resolvePromise;
              let promise = new Promise(function (resolve, reject) {
                resolvePromise = resolve;
              });
              deanonApi.fetch.and.returnValue(promise);
              ImmediatelyResolvePromise(30);
              countResolvePromise({"result": "success"});
              resolvePromise({"Result": "Success"});
              await promise;
              sampleResolvePromise({sample: true});
              UnblockPromises();
              ImmediatelyResolvePromise(30);
              await unit.deanonymize(person);
              done();
            })();
          });
          afterEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(30);
              await unit.init(apiKey);
              done();
            })();
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
          beforeEach((done) => {
            (async () => {
              let resolvePromise;
              let promise = new Promise(function (resolve, reject) {
                resolvePromise = resolve;
              });
              deanonApi.fetch.and.returnValue(promise);
              ImmediatelyResolvePromise(30);
              countResolvePromise({"result": "success"});
              resolvePromise({"Result": "Success"});
              await promise;
              sampleResolvePromise({sample: true});
              UnblockPromises();
              ImmediatelyResolvePromise(30);
              await unit.init(customKey);
              await unit.deanonymize(person);
              done();
            })();
          });
          afterEach((done) => {
            (async () => {
              ImmediatelyResolvePromise(30);
              await unit.init(apiKey);
              done();
            })();
          });
        });
      });
      describe('when counting', () => {
        let capturedError = null;
        let capturedValue = null;
        describe('when capturing', () => {
          describe('it passes', () => {
            it('then calls the view count API', () => {
              expect(CountApi).toHaveBeenCalledWith(countApiUrl);
              expect(countApi.fetch).toHaveBeenCalledWith({
                data: {
                  uid: jasmine.any(String),
                  token: apiKey,
                  timestamp: jasmine.any(Number),
                  outcome: '<outcome>',
                  content: {leadSource: 'Unattributed', leadGuid: null},
                  platform: null,
                  skus: null,
                  value: 0.0
                }
              });
            });
            beforeEach((done) => {
              (async () => {
                resetCalls();
                ImmediatelyResolvePromise(8);
                capturedValue = await unit.count("<outcome>", 0.0, null, true);
                done();
              })();
            });
          });
          describe('it passes with a platform', () => {
            const platform = {
              softwareVersion: 1.0,
              deviceModel: 'test-browser',
              operatingSystemName: 'any',
              operatingSystemVersion: '1.0'
            };
            it('then calls the view count API', () => {
              expect(countApi.fetch).toHaveBeenCalledWith({
                data: {
                  uid: jasmine.any(String),
                  token: apiKey,
                  timestamp: jasmine.any(Number),
                  outcome: '<outcome>',
                  content: {leadSource: 'Unattributed', leadGuid: null},
                  platform: platform,
                  skus: [],
                  value: 0.0
                }
              });
            });
            beforeEach((done) => {
              (async () => {
                resetCalls();
                ImmediatelyResolvePromise(9);
                await storeSession('view-platform', platform);
                capturedValue = await unit.count("<outcome>", 0.0, [], true);
                done();
              })();
            });
            afterEach(() => {
              sessionStorage.clear();
              ImmediatelyResolvePromise(0);
            });
          });
          describe('it passes with SKUS', () => {
            it('then calls the view count API', () => {
              expect(CountApi).toHaveBeenCalledWith(countApiUrl);
              expect(countApi.fetch).toHaveBeenCalledWith({
                data: {
                  uid: jasmine.any(String),
                  token: apiKey,
                  timestamp: jasmine.any(Number),
                  outcome: '<outcome>',
                  content: {leadSource: 'Unattributed', leadGuid: null},
                  platform: null,
                  skus: ["aSku"],
                  value: 0.0
                }
              });
            });
            beforeEach((done) => {
              (async () => {
                ImmediatelyResolvePromise(8);
                resetCalls();
                capturedValue = await unit.count("<outcome>", 0.0, ["aSku"], true);
                done();
              })();
            });
          });
          describe('it fails on second count call', () => {
            it('should surface error', () => {
              expect(capturedError.toString()).toEqual('Error: failure');
            });
            it('should capture a replay', (done) => {
              (async () => {
                const replay = await retrieveSession('view-count-replay');
                expect(replay).toEqual([{
                  data: {
                    uid: jasmine.any(String),
                    token: '<token>',
                    timestamp: jasmine.any(Number),
                    outcome: '<outcome>',
                    content: {leadSource: 'Unattributed', leadGuid: null},
                    platform: null,
                    skus: [],
                    value: 0
                  }
                }]);
                done();
              })();
            });
            describe('it fails consecutively', () => {
              it('should surface error', () => {
                expect(capturedError.toString()).toEqual('Error: failure');
              });
              it('should capture a replay', (done) => {
                (async () => {
                  const replay = await retrieveSession('view-count-replay');
                  expect(replay).toEqual([{
                    data: {
                      uid: jasmine.any(String),
                      token: '<token>',
                      timestamp: jasmine.any(Number),
                      outcome: '<outcome>',
                      content: {leadSource: 'Unattributed', leadGuid: null},
                      platform: null,
                      skus: [],
                      value: 0
                    }
                  }, {
                    data: {
                      uid: jasmine.any(String),
                      token: '<token>',
                      timestamp: jasmine.any(Number),
                      outcome: '<outcome2>',
                      content: {leadSource: 'Unattributed', leadGuid: null},
                      platform: null,
                      skus: [],
                      value: 0
                    }
                  }]);
                  done();
                })();
              });
              beforeEach((done) => {
                (async () => {
                  countPromise = new Promise(function (resolve, reject) {
                    countResolvePromise = resolve;
                    countRejectPromise = reject;
                  });
                  countApi.fetch.and.returnValue(countPromise);
                  try {
                    countRejectPromise(new Error('failure'));
                    await countPromise;
                  } catch (e) {
                  }
                  UnblockPromises();
                  resetCalls();
                  ImmediatelyResolvePromise(30);
                  try {
                    capturedValue = await unit.count("<outcome2>", 0.0, [], true);
                  } catch (e) {
                    capturedError = e;
                  }
                  done();
                })();
              });
            });
            describe('it is called successfully after failure', () => {
              it('should make calls with replays', () => {
                expect(countApi.fetch).toHaveBeenCalledTimes(2);
              });
              beforeEach((done) => {
                (async () => {
                  countPromise = new Promise(function (resolve, reject) {
                    countResolvePromise = resolve;
                    countRejectPromise = reject;
                  });
                  countApi.fetch.and.returnValue(countPromise);
                  try {
                    countResolvePromise({"result": "success"});
                    await countPromise;
                  } catch (e) {
                  }
                  UnblockPromises();
                  resetCalls();
                  ImmediatelyResolvePromise(9);
                  try {
                    capturedValue = await unit.count("<outcome2>", 0.0, [], true);
                  } catch (e) {
                    capturedError = e;
                  }
                  done();
                })();
              });
            });
            beforeEach((done) => {
              (async () => {
                countPromise = new Promise(function (resolve, reject) {
                  countResolvePromise = resolve;
                  countRejectPromise = reject;
                });
                countApi.fetch.and.returnValue(countPromise);
                ImmediatelyResolvePromise(1);
                try {
                  countRejectPromise(new Error('failure'));
                  await countPromise;
                } catch (e) {
                }
                UnblockPromises();
                resetCalls();
                ImmediatelyResolvePromise(8);
                try {
                  capturedValue = await unit.count("<outcome>", 0.0, [], true);
                } catch (e) {
                  capturedError = e;
                }
                done();
              })();
            });
          });
          beforeEach((done) => {
            (async () => {
              countResolvePromise({"result": "success"});
              await countPromise;
              UnblockPromises();
              ImmediatelyResolvePromise(22);
              await unit.autodiscoverLeadFrom("?hello=world");
              done();
            })();
          });
        });
        describe('when not capturing and first count call successful', () => {
          describe('second call fails', () => {
            it('should not surface error', () => {
              expect(capturedError).toBeNull();
            });
            beforeEach((done) => {
              (async () => {
                countPromise = new Promise(function (resolve, reject) {
                  countResolvePromise = resolve;
                  countRejectPromise = reject;
                });
                countApi.fetch.and.returnValue(countPromise);
                try {
                  countRejectPromise(new Error('failure'));
                  await countPromise;
                } catch (e) {
                }
                UnblockPromises();
                resetCalls();
                ImmediatelyResolvePromise(30);
                try {
                  capturedValue = await unit.count("<outcome>", 0.0);
                } catch (e) {
                  capturedError = e;
                }
                done();
              })();
            });
          });
          beforeEach((done) => {
            (async () => {
              countResolvePromise({"result": "success"});
              UnblockPromises();
              ImmediatelyResolvePromise(30);
              await unit.autodiscoverLeadFrom("?hello=world");
              done();
            })();
          });
        });
        describe('when not capturing and no previous attribution', () => {
          it('should not have values', () => {
            expect(capturedError).toBeNull();
            expect(capturedValue).toBeTrue();
          });
          beforeEach((done) => {
            (async () => {
              countResolvePromise({"result": "success"});
              UnblockPromises();
              ImmediatelyResolvePromise(30);
              try {
                capturedValue = await unit.count("<outcome>", 0.0);
              } catch (e) {
                capturedError = e;
              }
              done();
            })();
          });
        });
        beforeEach(() => {
          capturedError = null;
          capturedValue = null;
        });
      });
      describe('when recording errors', () => {
        describe('when default', () => {
          const log = ["<line>"]
          it('then calls the view error log API', () => {
            expect(ErrorLogApi).toHaveBeenCalledWith(apiUrl);
            expect(errorLogApi.fetch).toHaveBeenCalledWith({
              data: {
                log: log,
                token: apiKey,
              }
            });
          });
          beforeEach(() => {
            let promise = new Promise(function (resolve, reject) {
            });
            errorLogApi.fetch.and.returnValue(promise);
            unit.recordError(log);
          });
        });
      });
      beforeEach((done) => {
        sampleResolvePromise({sample: true});
        UnblockPromises();
        (async () => {
          ImmediatelyResolvePromise(47);
          await unit.init(apiKey, apiUrl);
          await unit2.init(apiKey, apiUrl);
          done();
        })();
      });
    });
    describe('when unable to sample', () => {
      describe('when adding value', () => {
        it('should have the set sample decision', (done) => {
          (async () => {
            MockPromises.reset();
            ImmediatelyResolvePromise(9);
            expect(await unit.sampleDecision(false)).toBeFalse();
            expect(await unit.sampleDecision(true)).toBeTrue();
            done();
          })();
        });
      });
      describe('when api returns no sampling', () => {
        it('then calls the view sample API', () => {
          expect(sampleApi.fetch).toHaveBeenCalledWith({
            data: {
              id: jasmine.any(String),
              token: apiKey
            }
          });
        });
        it('then has a negative sample decision', (done) => {
          (async () => {
            expect(await unit.sampleDecision()).toBeFalse()
            done();
          })();
        });
        describe('when committing a journey', () => {
          const feature = 'committing';
          describe('when default', () => {
            it('then never calls the view journey API', () => {
              expect(JourneyApi).not.toHaveBeenCalledWith(apiUrl);
              expect(journeyApi.fetch).not.toHaveBeenCalledWith({
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
            it('then never resets journey', (done) => {
              (async () => {
                expect(await unit.journey()).toEqual([{
                  category: 'Feature', action: 'Attempted', name: feature, timestamp: jasmine.any(Number)
                }]);
                done();
              })();
            });
            beforeEach((done) => {
              (async () => {
                resetCalls();
                await unit.commit();
                done();
              })();
            });
          });
          beforeEach((done) => {
            (async () => {
              await unit.featureAttempted(feature);
              done();
            })();
          });
        });
        describe('when heartbeating', () => {
          const feature = 'heartbeating';
          describe('when default', () => {
            it('then never calls the view heartbeat API', () => {
              expect(HeartbeatApi).not.toHaveBeenCalledWith(apiUrl);
              expect(heartbeatApi.fetch).not.toHaveBeenCalledWith({
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
            it('then never resets journey', (done) => {
              (async () => {
                expect(await unit.journey()).toEqual([{
                  category: 'Feature', action: 'Attempted', name: feature, timestamp: jasmine.any(Number)
                }]);
                done();
              })();
            });
            beforeEach((done) => {
              (async () => {
                resetCalls();
                await unit.heartbeat();
                done();
              })();
            });
          });
          beforeEach((done) => {
            (async () => {
              await unit.featureAttempted(feature);
              done();
            })();
          });
        });
        describe('when deanonymizing', () => {
          let person = {name: 'Test User', email: 'test@example.com'};
          describe('when default', () => {
            it('then never calls the view deanon API', () => {
              expect(DeanonApi).not.toHaveBeenCalledWith(apiUrl);
              expect(deanonApi.fetch).not.toHaveBeenCalledWith({
                data: {
                  id: jasmine.any(String),
                  person: person,
                  token: apiKey,
                  timestamp: jasmine.any(Number)
                }
              });
            });
            beforeEach((done) => {
              (async () => {
                resetCalls();
                await unit.deanonymize(person);
                done();
              })();
            });
          });
        });
        describe('when recording errors', () => {
          const log = ["<line>"]
          it('then never calls the view error log API', () => {
            expect(ErrorLogApi).not.toHaveBeenCalledWith(apiUrl);
            expect(errorLogApi.fetch).not.toHaveBeenCalledWith({
              data: {
                log: log,
                token: apiKey,
              }
            });
          });
          beforeEach((done) => {
            (async () => {
              resetCalls();
              await unit.recordError(log);
              done();
            })();
          });
        });
        beforeEach((done) => {
          (async () => {
            sampleResolvePromise({sample: false});
            UnblockPromises();
            ImmediatelyResolvePromise(60);
            await unit.init(apiKey, apiUrl);
            done();
          })();
        });
      });
    });
    describe('when sample api errors', () => {
      describe('when generic error', () => {
        it('then has a positive sample decision', (done) => {
          (async () => {
            ImmediatelyResolvePromise(30);
            expect(await unit.sampleDecision()).toBeTrue();
            done();
          })();
        });
        beforeEach((done) => {
          ImmediatelyResolvePromise(2);
          (async () => {
            localStorage.clear();
            sessionStorage.clear();
            try {
              sampleRejectPromise(new Error('{"result": "failed"}'));
              await samplePromise;
            } catch (e) {
            }
            UnblockPromises();
            ImmediatelyResolvePromise(60);
            await unit.init(apiKey, apiUrl);
            done();
          })();
        });
      });
      describe('when authentication error', () => {
        it('then has a positive sample decision', (done) => {
          (async () => {
            ImmediatelyResolvePromise(30);
            expect(await unit.sampleDecision()).toBeTrue();
            done();
          })();
        });
        beforeEach((done) => {
          ImmediatelyResolvePromise(2);
          (async () => {
            localStorage.clear();
            sessionStorage.clear();
            try {
              const error = new Error('{"result": "no-auth"}');
              error.authIssue = true;
              sampleRejectPromise(error);
              await samplePromise;
            } catch (e) {
            }
            UnblockPromises();
            ImmediatelyResolvePromise(60);
            await unit.init(apiKey, apiUrl);
            done();
          })();
        });
      });
      describe('when authentication error with callback', () => {
        let captureError = null;
        const callback = (error) => {
          captureError = error;
        }
        it('then has a positive sample decision', (done) => {
          (async () => {
            ImmediatelyResolvePromise(30);
            expect(await unit.sampleDecision()).toBeTrue();
            done();
          })();
        });
        it('should have captured error', () => {
          expect(captureError.toString()).toEqual('Error: {"result": "no-auth"}');
        });
        beforeEach((done) => {
          ImmediatelyResolvePromise(2);
          (async () => {
            localStorage.clear();
            sessionStorage.clear();
            try {
              const error = new Error('{"result": "no-auth"}');
              error.authIssue = true;
              sampleRejectPromise(error);
              await samplePromise;
            } catch (e) {
            }
            UnblockPromises();
            ImmediatelyResolvePromise(60);
            await unit.init(apiKey, apiUrl, callback);
            done();
          })();
        });
      });
    });
    beforeEach(() => {
      localStorage.clear();
      sessionStorage.clear();
      samplePromise = new Promise(function (resolve, reject) {
        sampleResolvePromise = resolve;
        sampleRejectPromise = reject;
      });
      sampleApi.fetch.and.returnValue(samplePromise);
      countPromise = new Promise(function (resolve, reject) {
        countResolvePromise = resolve;
        countRejectPromise = reject;
      });
      countApi.fetch.and.returnValue(countPromise);
      unit = new _Xenon(apiKey, apiUrl, countApiUrl, JourneyApi, DeanonApi, HeartbeatApi, SampleApi, CountApi, ErrorLogApi);
      unit2 = new _Xenon(apiKey, apiUrl, countApiUrl, JourneyApi, DeanonApi, HeartbeatApi, SampleApi, CountApi, ErrorLogApi);
    });
    afterEach(() => {
      unit = null;
      unit2 = null;
      localStorage.clear();
      sessionStorage.clear();
      resetCalls();
    });
  });
  describe('when decision previously and unable to sample', () => {
    let unit3;
    it('then unable to sample', (done) => {
      (async () => {
        ImmediatelyResolvePromise(3);
        expect(await unit3.sampleDecision()).toBeFalse();
        done();
      })();
    });
    beforeEach((done) => {
      (async () => {
        MockPromises.reset();
        localStorage.clear();
        sessionStorage.clear();
        samplePromise = new Promise(function (resolve, reject) {
          sampleResolvePromise = resolve;
          sampleRejectPromise = reject;
        });
        sampleApi.fetch.and.returnValue(samplePromise);
        ImmediatelyResolvePromise(2);
        await storeSession('xenon-will-sample', false);
        unit3 = new _Xenon(apiKey, apiUrl, countApiUrl, JourneyApi, DeanonApi, HeartbeatApi, SampleApi, CountApi);
        done();
      })();
    });
    afterEach(() => {
      localStorage.clear();
      sessionStorage.clear();
      resetCalls();
      MockPromises.reset();
    });
  });
})
;
