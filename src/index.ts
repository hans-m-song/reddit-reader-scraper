import yargs from 'yargs';
import {runScraper} from './scraper/index';

yargs
  .command(
    'scrape',
    'scrape a story',
    (yargs) =>
      yargs
        .option('name', {
          alias: 'n',
          description: 'Story name',
          type: 'string',
          demandOption: true,
        })
        .option('initial_url', {
          alias: 'i',
          description: 'Url to start scraping from',
          type: 'string',
          demandOption: true,
        })
        .option('next_matcher', {
          alias: 'm',
          description: 'Regex to match a link pointing to the next chapter',
          default: 'next',
          type: 'string',
        })
        .option('output', {
          alias: 'o',
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
          alias: 'l',
          description: 'File to load data from',
          type: 'string',
          demandOption: true,
        })
        .option('output', {
          alias: 'o',
          description: 'Output file location',
          type: 'string',
          demandOption: true,
        }),
    console.log,
  )
  .demandCommand()
  .help()
  .parse();
