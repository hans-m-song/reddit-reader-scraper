import inquirer from 'inquirer';
import {match} from 'ts-pattern';
import {Story, StoryMeta} from './scraper/scraper';

type Answer<T = string> = {answer: T};

type UrlSelection = {innerText: string; href: string};

export const promptLocation = async (): Promise<Answer> =>
  await inquirer.prompt([
    {
      type: 'input',
      name: 'answer',
      message: 'File location',
    },
  ]);

export enum Action {
  Scrape,
  Convert,
  Custom,
  Save,
  Quit,
}

export const promptAction = async (): Promise<
  Answer<Action.Scrape | Action.Convert | Action.Quit>
> =>
  await inquirer.prompt([
    {
      type: 'list',
      name: 'answer',
      message: 'Choose action',
      choices: [
        {value: Action.Scrape, name: 'Scrape a story'},
        {value: Action.Convert, name: 'Convert to epub'},
        new inquirer.Separator(),
        {value: Action.Quit, name: 'Quit'},
        new inquirer.Separator(),
      ],
    },
  ]);

export const promptFileLocation = async (
  message = 'File location',
): Promise<Answer> =>
  await inquirer.prompt([{type: 'input', name: 'answer', message}]);

export const promptCustomUrl = async (): Promise<Answer> =>
  await inquirer.prompt([
    {
      type: 'input',
      name: 'answer',
      message: 'Enter a custom url',
      validate: (answer) => /^https?:\/\//.test(answer) || 'Invalid url',
    },
  ]);

export const promptNextUrl = async (
  urls: UrlSelection[],
): Promise<Answer<string | null>> => {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'answer',
      message: 'Select next url',
      choices: [
        ...urls.map(({innerText, href}) => ({
          value: href,
          name: `${innerText}: ${href}`,
        })),
        new inquirer.Separator(),
        {value: Action.Custom, name: 'Enter custom url'},
        {value: Action.Quit, name: 'Stop scraping'},
        new inquirer.Separator(),
      ],
    },
  ]);

  return match(answers.answer)
    .with(Action.Quit, () => ({answer: null}))
    .with(Action.Custom, () => promptCustomUrl())
    .otherwise(() => answers as Answer);
};

export const promptInitStory = async (): Promise<
  StoryMeta & {continue: boolean}
> => {
  const story = await inquirer.prompt([
    {
      type: 'list',
      name: 'continue',
      message: 'Continue scraping existing story',
      choices: [
        {value: false, name: 'No'},
        {value: true, name: 'Yes'},
      ],
    },
    {
      type: 'input',
      name: 'fileLocation',
      message: (answers) =>
        answers.continue
          ? 'Existing story file location'
          : 'Output file location',
    },
    {
      type: 'input',
      name: 'nextMatcher',
      message: 'String to match a link pointing to the next chapter',
      when: (answers: any) => !answers.continue,
    },
    {
      type: 'input',
      name: 'name',
      message: 'Story name',
      when: (answers: any) => !answers.continue,
    },
    {
      type: 'input',
      name: 'startingUrl',
      message: 'Starting url',
      validate: (value: string) => /^https?:\/\//.test(value) || 'Invalid url',
      when: (answers: any) => !answers.continue,
    },
  ]);

  return story;
};
