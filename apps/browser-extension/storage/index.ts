import { Storage } from "@plasmohq/storage"

export const StorageKeyHash = {
    TOKEN: "TOKEN",
    REPO: "REPO",
    OWNER: "OWNER",
    EMAIL: "EMAIL",
    GEMINI_API_KEY: "GEMINI_API_KEY",
    TAGS: "TAGS",
    SETTING_AUTO_BOOKMARK: 'SETTING_AUTO_BOOKMARK'
};

export const StorageServer = 'StorageServer'; // this value is StorageServerValue
export const GithubStorageKey = {
    TOKEN: "TOKEN",
    REPO: "REPO",
    OWNER: "OWNER",
    EMAIL: "EMAIL",
};
export const DefaultStorageKey = {
    TOKEN: "TOKEN",
};

export const TagAIServer = 'TagAIModel';
export const GeminiKey = {
    API_KEY: "Gemini_API_KEY",
    MODEL: "Gemini_MODEL"
};
export const MoonshotKey = {
    API_KEY: "Moonshot_API_KEY",
    MODEL: "Moonshot_MODEL"
};

export const GeneralSetting = {
    BookmarkTagsCount: 'GeneralSetting_BookmarkTagsCount'
};

export const getStorage = () => {
    return new Storage({
        area: "local",
        copiedKeyList: Object.values(StorageKeyHash)
    });
};
