import playwright from 'playwright';
import {io} from '../io';
import fs from 'fs/promises';
import {scrapeChapter, Story} from './scraper';
import path from 'path';
import {slug, timer} from './utils';
import {parse} from 'yargs';

interface ScraperArgs {
  name: string;
  initial_url: string;
  next_matcher: string;
  output: string;
  continue?: boolean;
}

const initialiseStory = async (args: ScraperArgs): Promise<Story> => {
  if (args.continue) {
    io.log('loading story from file', {location: args.output});
    const data = await fs.readFile(args.output);
    const parsed = JSON.parse(data.toString()) as Story;
    if (parsed.chapters.length > 0) {
      const last = parsed.chapters[parsed.chapters.length - 1];
      if (last.next === null) {
        last.next = args.initial_url;
      }
    }

    return parsed;
  }

  return {
    name: args.name,
    startingUrl: args.initial_url,
    nextMatcher: args.next_matcher,
    chapters: [],
  };
};

export const runScraper = async (args: ScraperArgs) => {
  const totalDuration = timer();

  const story = await initialiseStory(args);

  const browser = await playwright.chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const url = new URL(args.initial_url);
  const [subreddit, , id] = url.pathname.replace('/r/', '').split('/');
  io.info('scraping story', {
    name: story.name,
    url: url.pathname,
    continue: args.continue ? 'yes' : 'no',
    subreddit,
    id,
  });
  await page.goto(args.initial_url, {waitUntil: 'domcontentloaded'});

  const scrape = async () => {
    const chapterDuration = timer();

    const chapter = await scrapeChapter(page, story.nextMatcher);
    if (chapter === null) {
      io.warning('no chapter found');
      return;
    }

    story.chapters.push(chapter);

    io.info('scraped chapter', {
      title: chapter.title,
      duration: chapterDuration().toString(),
    });

    if (chapter.next) {
      await page.goto(chapter.next);
      await scrape();
    }
  };

  await scrape()
    .then(() => io.info('scraping completed', {name: story.name}))
    .catch((e) => io.error('error scraping', {}, e))
    .finally(async () => {
      const parsed = path.parse(args.output);
      io.info('saving story data', {
        location: args.output,
        chapters: story.chapters.length.toString(),
      });
      io.info('scraper exiting', {duration: totalDuration().toString()});
      await browser?.close();
      await fs.mkdir(parsed.dir, {recursive: true}).catch();
      await io.file(args.output, JSON.stringify(story, null, 4));
    });
};
