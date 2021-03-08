# reddit-reader-scraper

Scrapes stories off reddit (or at least attempts to)

# usage

## scraper

scrapes pages sequentially, finds the next chapter by searching for an anchor with "next" as the text

### options

- `name`: the story name
- `initial_url`: first page of the story
- `output`: output file location
- `next_matcher`: custom string to search instead of "next" (case insensitive)
- `continue` (optional): continue scraping from an existing story, continuing from `initial_url` (will load data from `output` and overwrite it)

### example

```
node dist/index.js scrape \
  --name "a story name" \
  --initial_url https://www.reddit.com/r/hfy/comments/.../.../ \
  --output output/a-story-name.json
```

## converter

converts output json into epub

### options

- `file_location`: json data to load
- `output`: output file location

### example

```
node dist/index.js convert \
  --file_location output/a-story-name.json \
  --output a-story-name.epub
```
