import {ElementHandle, Page} from 'playwright';
import {io} from '../io';

export const getElement = async (
  el: Page | ElementHandle,
  selector: string,
): Promise<ElementHandle | null> => {
  const element = await el.$(selector);
  if (!element) {
    io.warning('element not found', {selector});
    return null;
  }
  return element;
};

export const getProp = async (el: ElementHandle, property = 'innerText') =>
  el.evaluate((el, prop) => (el as any)[prop] as string | null, property);

export const getAttribute = async (el: ElementHandle, attribute: string) =>
  el.evaluate((el) => (el as HTMLElement).getAttribute(attribute));

export const slug = (value: string) => value.replace(/\s+/g, '-');

export const timer = () => {
  const start = Date.now();
  return () => (Date.now() - start) / 1000;
};
