export const CHAPTER_CONTAINER = '[data-test-id="post-content"]';

export const CHAPTER_AUTHOR = `${CHAPTER_CONTAINER} a[href*="/user/"]`;

export const CHAPTER_TITLE = `${CHAPTER_CONTAINER} > :nth-child(3)`;

export const CHAPTER_CONTENT = `${CHAPTER_CONTAINER} > :nth-child(5)`;
