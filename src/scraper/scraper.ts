import {Page} from 'playwright';
import {
  CHAPTER_AUTHOR,
  CHAPTER_CONTAINER,
  CHAPTER_CONTENT,
  CHAPTER_TITLE,
} from './selectors';
import {getElement, getProp} from './utils';

export interface Chapter {
  location: string;
  author: string;
  title: string;
  content: string;
  next: string | null;
}

export interface StoryMeta {
  startingUrl: string;
  nextMatcher: RegExp;
  name: string;
}

export interface Story extends StoryMeta {
  chapters: Chapter[];
}

export const getNext = async (
  page: Page,
  nextMatcher: RegExp,
): Promise<string | null> => {
  const content = await getElement(page, CHAPTER_CONTENT);
  if (!content) return null;

  const anchors = await content.$$eval('a', (elist) =>
    elist.map(({href, innerText}) => ({href, innerText})),
  );

  const next = await anchors.filter(
    ({innerText}) => innerText && nextMatcher.test(innerText),
  );

  return next[0]?.href || null;
};

export const scrapeChapter = async (
  page: Page,
  nextMatcher: RegExp,
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
