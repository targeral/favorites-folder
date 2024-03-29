import { IBookmark } from 'api-types';

export const transformBookmarksToString = (bookmarks: IBookmark[]) => {
  return JSON.stringify(bookmarks, undefined, 2);
};
