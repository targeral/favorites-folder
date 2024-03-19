export interface ITagItem {
    name: string;
    source: "AI" | "USER"
}

export interface IBookmark {
    id: number | string;
    url: string;
    title: string;
    tags: ITagItem[];
}

