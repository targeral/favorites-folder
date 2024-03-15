export interface ITagItem {
    name: string;
    source: "AI" | "USER"
}

export interface IBookmark {
    id: number;
    url: string;
    title: string;
    tags: ITagItem[];
}

