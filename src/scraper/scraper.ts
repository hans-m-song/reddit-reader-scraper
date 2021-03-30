import {Page} from 'playwright';
import {io} from '../io';
import {
  CHAPTER_AUTHOR,
  CHAPTER_CONTAINER,
  CHAPTER_CONTENT,
  CHAPTER_NEXT_FALLBACK,
  CHAPTER_TITLE,
} from './selectors';
import {getElement, getProp, stringMatcher} from './utils';
import {promptNextUrl} from '../cli';

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
  fileLocation: string;
  name: string;
}

export interface Story extends StoryMeta {
  chapters: Chapter[];
}

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
      elist
        .map(({innerText, href}) => ({innerText, href}))
        .filter(
          ({href}) => !/\/(u(ser)?)|(wiki)|(message\/compose)\//.test(href),
        ),
  );

  return (await promptNextUrl(additionalAnchors)).answer;
};

export const scrapeChapter = async (
  page: Page,
  nextMatcher: string,
): Promise<Chapter | null> => {
  const location = await page.evaluate(() => window.location.href);

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
