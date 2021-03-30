import fs from 'fs/promises';
import {Story} from '../scraper/scraper';
import Epub from 'epub-gen';
import {io} from '../io';

interface ConverterArgs {
  inputFileLocation: string;
  outputFileLocation: string;
}

export const runConverter = async (args: ConverterArgs) => {
  const data = await fs.readFile(args.inputFileLocation);
  const json = JSON.parse(data.toString()) as Story;
  await new Epub({
    title: json.name,
    author: '',
    output: args.outputFileLocation,
    content: json.chapters.map((chapter) => ({
      title: chapter.title,
      author: chapter.author,
      data: chapter.content,
    })),
  }).promise;
  io.log('done');
};

export const convertToEpub = async (
  story: Story,
  outputFileLocation: string,
) => {
  await new Epub({
    title: story.name,
    author: '',
    output: outputFileLocation,
    content: story.chapters.map((chapter) => ({
      title: chapter.title,
      author: chapter.author,
      data: chapter.content,
    })),
  }).promise;
  io.log('done');
};
