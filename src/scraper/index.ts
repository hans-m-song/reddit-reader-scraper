import playwright from 'playwright';
import {io} from '../io';
import fs from 'fs/promises';
import {scrapeChapter, Story} from './scraper';
import path from 'path';
import {slug, timer} from './utils';

interface ScraperArgs {
  name: string;
  initial_url: string;
  next_matcher: string;
  output: string;
  append?: boolean;
}

const initialiseStory = async (args: ScraperArgs): Promise<Story> => {
  if (args.append) {
    io.log('loading story from file', {location: args.output});
    const data = await fs.readFile(args.output);
    const parsed = JSON.parse(data.toString()) as Story;
    parsed.chapters[parsed.chapters.length - 1].next = args.initial_url;

    return {
      ...parsed,
      startingUrl: args.initial_url,
    };
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
  io.log('scraper begin', {
    name: story.name,
    startingUrl: story.startingUrl,
    nextMatcher: String(story.nextMatcher),
    append: args.append ? 'yes' : 'no',
  });

  const browser = await playwright.chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const url = new URL(story.startingUrl);
  const [subreddit, , id] = url.pathname.replace('/r/', '').split('/');
  io.info('scraping story', {name: story.name, subreddit, id});
  await page.goto(story.startingUrl, {waitUntil: 'domcontentloaded'});

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
