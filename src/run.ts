import {match} from 'ts-pattern';
import {Action, promptAction, promptFileLocation, promptInitStory} from './cli';
import {convertToEpub} from './converter';
import {fromFile, runScraper} from './scraper';
import {Story} from './scraper/scraper';

const scrape = async (continueStory?: Story) => {
  if (continueStory) {
    await runScraper(continueStory);
    return continueStory;
  }

  const {continue: cont, ...storyInit} = await promptInitStory();

  const storyMeta = cont
    ? {...storyInit, ...(await fromFile(storyInit.fileLocation))}
    : storyInit;

  const story = {chapters: [], ...storyMeta};

  await runScraper(story);

  return story;
};

const convert = async (continueStory?: Story) => {
  const inputFileLocation = continueStory
    ? {answer: ''}
    : await promptFileLocation('Input file location');

  const story = continueStory
    ? continueStory
    : await fromFile(inputFileLocation.answer);

  const outputFileLocation = await promptFileLocation('Output file location');

  await convertToEpub(story, outputFileLocation.answer);

  return story;
};

export const runInteractive = async (continueStory?: Story) => {
  const action = await promptAction();

  if (action.answer === Action.Quit) {
    return;
  }

  const executor = match(action.answer)
    .with(Action.Scrape, () => scrape)
    .with(Action.Convert, () => convert)
    .run();

  const story = await executor(continueStory);

  await runInteractive(story);
};

if (require.main === module) {
  runInteractive();
}
