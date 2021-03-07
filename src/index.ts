import yargs from 'yargs';
import {runConverter} from './converter';
import {runScraper} from './scraper/index';
import 'source-map-support/register';

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
        .option('append', {
          description: 'Append chapters to specified output file',
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
    (args) => runScraper(args),
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
    (args) => runConverter(args),
  )
  .demandCommand()
  .help()
  .parse();

console.log(args);
