/**
 * 0 = other
 * 1 = chrome
 * 2 = edge
 */
export type BrowserType = '0' | '1' | '2';

export interface ITagItem {
    name: string;
    source: "AI" | "USER" | "SYSTEM";
    browserType: BrowserType;
}

export interface IBookmark {
    id: number | string;
    url: string;
    title: string;
    tags: ITagItem[];
    dateAdded: number;
    browserType: BrowserType;
}
