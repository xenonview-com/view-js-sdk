// Karma configuration
// Generated on Tue Sep 28 2021 10:30:21 GMT-0600 (Mountain Daylight Time)
const path = require('path');
module.exports = function (config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://www.npmjs.com/search?q=keywords:karma-adapter
    frameworks: ['browserify', 'jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'src/**/*.?(m)js',
      'spec/**/*[Ss]pec.?(m)js'
    ],


    // list of files / patterns to exclude
    exclude: [],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://www.npmjs.com/search?q=keywords:karma-preprocessor
    preprocessors: {
      'src/**/*.?(m)js': ['browserify'],
      'spec/**/*[Ss]pec.?(m)js': ['browserify']
    },

    browserify: {
      debug: true,
      transform: [
        ['babelify', {
          presets: ["@babel/preset-env"],
          sourceMap: "inline",
          "plugins": [
            ["istanbul", {
              "exclude": ["spec/**/*[Ss]pec.?(m)js","spec/**/mock*.?(m)js", "spec/helper/**/*.?(m)js" ]
            }],
            ["@babel/plugin-transform-runtime", {
                "regenerator": true
            }]
          ]
        }],
      ]
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://www.npmjs.com/search?q=keywords:karma-reporter
    reporters: ['progress'],

    coverageIstanbulReporter: {
      // reports can be any that are listed here: https://github.com/istanbuljs/istanbuljs/tree/73c25ce79f91010d1ff073aa6ff3fd01114f90db/packages/istanbul-reports/lib
      reports: ['html', 'lcovonly', 'text'],

      // base output directory. If you include %browser% in the path it will be replaced with the karma browser name
      dir: path.join(__dirname, 'coverage'),

      // Combines coverage information from multiple browsers into one report rather than outputting a report
      // for each browser.
      combineBrowserReports: true,

      // if using webpack and pre-loaders, work around webpack breaking the source path
      fixWebpackSourcePaths: true,

      // Omit files with no statements, no functions and no branches covered from the report
      skipFilesWithNoCoverage: true,

      // Most reporters accept additional config options. You can pass these through the `report-config` option
      'report-config': {
        // all options available at: https://github.com/istanbuljs/istanbuljs/blob/73c25ce79f91010d1ff073aa6ff3fd01114f90db/packages/istanbul-reports/lib/html/index.js#L257-L261
        html: {
          // outputs the report in ./coverage/html
          subdir: 'html'
        }
      },

      // enforce percentage thresholds
      // anything under these percentages will cause karma to fail with an exit code of 1 if not running in watch mode
      // thresholds: {
      //   emitWarning: false, // set to `true` to not fail the test command when thresholds are not met
      //   // thresholds for all files
      //   global: {
      //     statements: 100,
      //     lines: 100,
      //     branches: 100,
      //     functions: 100
      //   },
      //   // thresholds per file
      //   each: {
      //     statements: 100,
      //     lines: 100,
      //     branches: 100,
      //     functions: 100,
      //     overrides: {
      //       'baz/component/**/*.js': {
      //         statements: 98
      //       }
      //     }
      //   }
      // },

      verbose: true // output config used by istanbul for debugging
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://www.npmjs.com/search?q=keywords:karma-launcher
    browsers: ['ChromeHeadless'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser instances should be started simultaneously
    concurrency: Infinity
  })
}
