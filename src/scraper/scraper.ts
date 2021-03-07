import {Page} from 'playwright';
import {io} from '../io';
import readline from 'readline';
import {
  CHAPTER_AUTHOR,
  CHAPTER_CONTAINER,
  CHAPTER_CONTENT,
  CHAPTER_NEXT_FALLBACK,
  CHAPTER_TITLE,
} from './selectors';
import {getElement, getProp, stringMatcher} from './utils';
import fs from 'fs';

export interface Chapter {
  location: string;
  author: string;
  title: string;
  content: string;
  next: string | null;
}

export interface StoryMeta {
  startingUrl: string;
  nextMatcher: string;
  name: string;
}

export interface Story extends StoryMeta {
  chapters: Chapter[];
}

const getUserSelection = async (
  choices: {innerText: string; href: string}[],
  showChoices = true,
): Promise<string | null> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  if (showChoices) {
    choices.forEach(({innerText, href}, i) => {
      console.log(`[${i}]`, `[innerText = ${innerText}] [href = ${href}]`);
    });
    console.log('or "q" to quit');
    console.log('or "c" for custom option');
  }
  // io.info('Index of link to next chapter: ');
  const choice = await new Promise((resolve) =>
    rl.question('Index of link to next chapter: ', resolve),
  );

  if (choice === 'c') {
    const result = await new Promise((resolve) =>
      rl.question('Input a custom link: ', resolve),
    );
    rl.close();
    return result as string;
  }

  rl.close();

  if (choice === 'q') {
    return null;
  }

  if (!isNaN(Number(choice))) {
    return choices[Number(choice)].href;
  }

  return getUserSelection(choices, false);
};

const getNext = async (
  page: Page,
  nextMatcher: string,
): Promise<string | null> => {
  const content = await getElement(page, CHAPTER_CONTENT);
  if (!content) return null;

  const anchors = await content.$$eval('a', (elist) =>
    elist.map(({href, innerText}) => ({href, innerText})),
  );

  const next = anchors.filter(
    ({innerText}) => innerText && stringMatcher(nextMatcher, innerText),
  );

  if (next.length > 0) {
    return next[0].href || null;
  }

  io.warning('next anchor not found', {
    location: await page.evaluate(() => window.location.href),
  });

  const additionalAnchors = await page.$$eval(
    CHAPTER_NEXT_FALLBACK,
    (elist: HTMLAnchorElement[]) =>
      elist.map(({innerText, href}) => ({innerText, href})),
  );

  return getUserSelection([...anchors, ...additionalAnchors]);
};

export const scrapeChapter = async (
  page: Page,
  nextMatcher: string,
): Promise<Chapter | null> => {
  const location = await page.evaluate(() => window.location.pathname);

  const container = await getElement(page, CHAPTER_CONTAINER);
  if (!container) return null;

  const authorEl = await getElement(page, CHAPTER_AUTHOR);
  const titleEl = await getElement(page, CHAPTER_TITLE);
  const contentEl = await getElement(page, CHAPTER_CONTENT);
  if (!authorEl || !titleEl || !contentEl) return null;

  const author = (await getProp(authorEl)) || '';
  const title = (await getProp(titleEl)) || '';
  const content = (await getProp(contentEl, 'innerHTML')) || '';
  const next = await getNext(page, nextMatcher);

  return {location, author, title, content, next};
};
