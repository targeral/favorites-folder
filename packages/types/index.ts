export interface ITagItem {
    name: string;
    source: "AI" | "USER" | "SYSTEM"
}

export interface IBookmark {
    id: number | string;
    url: string;
    title: string;
    tags: ITagItem[];
    dateAdded: number;
}

