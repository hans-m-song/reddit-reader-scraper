import yargs from 'yargs';
import {runConverter} from './converter';
import {runScraper} from './scraper/index';
import 'source-map-support/register';
import {runInteractive} from './run';
import {io} from './io';

const args = yargs
  .command(
    'scrape',
    'scrape a story',
    (yargs) =>
      yargs
        .option('name', {
          description: 'Story name',
          type: 'string',
          demandOption: true,
        })
        .option('continue', {
          description:
            'Continue scraping existing story (use output to specify file, initial_url will be used as continuation link)',
          type: 'boolean',
          default: false,
          nargs: 0,
        })
        .option('initial_url', {
          description: 'Url to start scraping from',
          type: 'string',
          demandOption: true,
        })
        .option('next_matcher', {
          description: 'Regex to match a link pointing to the next chapter',
          default: 'next',
          type: 'string',
        })
        .option('output', {
          description: 'Output file location',
          type: 'string',
          demandOption: true,
        }),
    (args) =>
      runScraper({
        startingUrl: args.initial_url,
        nextMatcher: args.next_matcher,
        fileLocation: args.output,
        name: args.name,
        chapters: [],
      }),
  )
  .command(
    'convert',
    'convert a scraped story',
    (yargs) =>
      yargs
        .option('file_location', {
          description: 'File to load data from',
          type: 'string',
          demandOption: true,
        })
        .option('output', {
          description: 'Output file location',
          type: 'string',
          demandOption: true,
        }),
    (args) =>
      runConverter({
        inputFileLocation: args.file_location,
        outputFileLocation: args.output,
      }),
  )
  .command(
    '$0',
    'Default to interactive prompt',
    () => {},
    () => {
      io.log('Running in interactive mode');
      runInteractive();
    },
  )
  .help()
  .parse();
