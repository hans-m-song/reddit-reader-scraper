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
}

export const runScraper = async (args: ScraperArgs) => {
  const totalDuration = timer();

  const story: Story = {
    name: args.name,
    startingUrl: args.initial_url,
    nextMatcher: new RegExp(args.next_matcher, 'i'),
    chapters: [],
  };

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
      const folder = path.join(__dirname, '../../', args.output);
      const location = path.join(folder, `${slug(story.name)}.json`);
      io.info('saving story data', {
        location,
        chapters: story.chapters.length.toString(),
      });
      io.info('scraper exiting', {duration: totalDuration().toString()});
      await browser?.close();
      await fs.mkdir(folder, {recursive: true}).catch();
      await io.file(location, JSON.stringify(story, null, 4));
    });
};
