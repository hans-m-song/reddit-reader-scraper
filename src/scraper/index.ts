import playwright from 'playwright';
import {io} from '../io';
import fs from 'fs/promises';
import path from 'path';
import {scrapeChapter, Story} from './scraper';
import {timer} from './utils';

export const fromFile = async (filename: string): Promise<Story> => {
  const filepath = path.resolve(__dirname, '../../', filename);
  io.log('loading story from file', {filepath});
  const data = await fs.readFile(filepath);
  const parsed = JSON.parse(data.toString());
  return parsed;
};

export const runScraper = async (story: Story) => {
  const totalDuration = timer();

  const browser = await playwright.chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const startUrl =
    story.chapters.length > 0
      ? story.chapters[story.chapters.length - 1].location
      : story.startingUrl;

  const url = new URL(startUrl);
  const [subreddit, , id] = url.pathname.replace('/r/', '').split('/');
  io.info('scraping story', {
    name: story.name,
    url: url.pathname,
    subreddit,
    id,
  });

  await page.goto(startUrl, {waitUntil: 'domcontentloaded'});

  const scrape = async () => {
    const chapterDuration = timer();

    const chapter = await scrapeChapter(page, story.nextMatcher);
    if (chapter === null) {
      io.warning('no chapter found');
      return;
    }

    if (chapter.location === startUrl) {
      story.chapters[story.chapters.length - 1] = {
        ...story.chapters[story.chapters.length - 1],
        ...chapter,
      };
    } else {
      story.chapters.push(chapter);
      io.info('scraped chapter', {
        title: chapter.title,
        duration: chapterDuration().toString(),
      });
    }

    if (chapter.next !== null) {
      await page.goto(chapter.next);
      await scrape();
    }
  };

  await scrape()
    .then(() => io.info('scraping completed', {name: story.name}))
    .catch((e) => io.error('error scraping', {}, e))
    .finally(async () => {
      const parsed = path.parse(story.fileLocation);
      io.info('saving story data', {
        location: story.fileLocation,
        chapters: story.chapters.length.toString(),
      });
      io.info('scraper exiting', {duration: totalDuration().toString()});
      await browser?.close();
      await fs.mkdir(parsed.dir, {recursive: true}).catch(() => {});
      await io.file(story.fileLocation, JSON.stringify(story, null, 4));
    });
};
