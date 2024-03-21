import { Storage } from "@plasmohq/storage"

export const StorageKeyHash = {
    TOKEN: "TOKEN",
    REPO: "REPO",
    OWNER: "OWNER",
    EMAIL: "EMAIL",
    GEMINI_API_KEY: "GEMINI_API_KEY",
    TAGS: "TAGS",
};

export const getStorage = () => {
    return new Storage({
        area: "local",
        copiedKeyList: Object.values(StorageKeyHash)
    });
};