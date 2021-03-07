import fs from 'fs/promises';
import {Story} from '../scraper/scraper';
import Epub from 'epub-gen';
import {io} from '../io';

interface ConverterArgs {
  file_location: string;
  output: string;
}

export const runConverter = async (args: ConverterArgs) => {
  const data = await fs.readFile(args.file_location);
  const json = JSON.parse(data.toString()) as Story;
  await new Epub({
    title: json.name,
    author: '',
    output: args.output,
    content: json.chapters.map((chapter) => ({
      title: chapter.title,
      author: chapter.author,
      data: chapter.content,
    })),
  }).promise;
  io.log('done');
};
