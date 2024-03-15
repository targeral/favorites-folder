import { Octokit } from 'octokit';
import debugFactory from 'debug';

const debug = debugFactory('GITHUB');

export interface GithubOptions {
  owner: string;
  token: string;
  repo: string;
  email: string;
}

export class Github {
  options: GithubOptions;

  #octokit: Octokit;

  constructor(options: GithubOptions) {
    this.options = options || {};
    console.info(this.options);
    this.#octokit = new Octokit({
      auth: this.options.token,
    });
  }

  async #getGit() {
    return this.#octokit.rest.git;
  }

  #getOwnerAndRepo(): { owner: string; repo: string } {
    return {
      owner: this.options.owner,
      repo: this.options.repo,
    };
  }

  // 获取当前仓库的树对象
  async getCurrentTree({ branch }: { branch: string }) {
    const git = await this.#getGit();
    const response = await git.getTree({
      ...this.#getOwnerAndRepo(),
      tree_sha: branch, // 分支的 SHA 或分支名称
      recursive: 'true', // 递归获取所有文件和文件夹
    });

    return response.data.sha; // 返回当前树对象的 SHA 哈希值
  }

  async createBlob(content: string) {
    const git = await this.#getGit();
    const resp = await git.createBlob({
      ...this.#getOwnerAndRepo(),
      content,
      encoding: 'utf-8',
    });

    return resp.data.sha;
  }

  async getBranchSha({ branch }: { branch: string }) {
    const git = await this.#getGit();
    const refResp = await git.getRef({
      ...this.#getOwnerAndRepo(),
      ref: `heads/${branch}`,
    });

    debug(branch, ':refResp:', refResp);

    if (refResp.status === 200) {
      return refResp.data.object.sha;
    }

    return null;
  }

  async pushCommitToBranch({
    branch,
    commitSha,
  }: {
    branch: string;
    commitSha: string;
  }) {
    const git = await this.#getGit();
    const refResp = await git.updateRef({
      ...this.#getOwnerAndRepo(),
      ref: `heads/${branch}`,
      sha: commitSha,
    });

    if (refResp.status === 200) {
      console.info('提交成功');
    }

    console.info('update ref:resp', refResp);
  }

  async getTreeByBranchSha(branchSha: string) {
    const git = await this.#getGit();
    const treeResp = await git.getTree({
      ...this.#getOwnerAndRepo(),
      tree_sha: branchSha,
    });

    debug('treeResp', treeResp);

    if (treeResp.status === 200) {
      return treeResp.data;
    }

    return null;
  }

  async createTree({
    blobSha,
    filePath,
    currentTreeSha,
  }: {
    blobSha: string;
    filePath: string;
    currentTreeSha: string;
  }) {
    const git = await this.#getGit();
    // 获取当前树对象中的文件和文件夹项
    const response = await git.getTree({
      ...this.#getOwnerAndRepo(),
      tree_sha: currentTreeSha,
      recursive: 'true', // 递归获取所有文件和文件夹
    });

    const currentTreeData = response.data.tree;

    const treeResp = await git.createTree({
      ...this.#getOwnerAndRepo(),
      tree: [
        // 添加文件条目
        {
          path: filePath,
          mode: '100644',
          type: 'blob',
          sha: blobSha, // 文件内容的SHA哈希
        },
        ...(currentTreeData as any),
        // 添加文件夹条目
        //   {
        //     path:  ,
        //     mode: '040000',
        //     type: 'tree',
        //     sha: 'SHA_HASH_OF_FOLDER_TREE', // 文件夹树对象的SHA哈希
        //   },
      ],
      base_tree: undefined, // 如果是新提交，请将其设置为 null,
    });

    return treeResp.data.sha;
  }

  async createCommit({ treeSha, branch }: { treeSha: string; branch: string }) {
    const git = await this.#getGit();
    const parentSha = await this.getBranchSha({ branch });
    if (parentSha === null) {
      throw Error(`不存在${branch} 对应的 sha`);
    }

    await this.getTreeByBranchSha(parentSha);

    const commitResp = await git.createCommit({
      ...this.#getOwnerAndRepo(),
      tree: treeSha,
      parents: [parentSha],
      message: 'update bookmarks',
      author: {
        name: this.options.owner,
        email: this.options.email,
      },
    });

    return commitResp.data; // 返回新提交的 SHA 哈希值
  }

  async createNewFolder({
    folderPath,
    branch,
  }: {
    folderPath: string;
    branch: string;
  }) {
    // 创建新树对象
    debug('folderPath', folderPath);

    const git = await this.#getGit();
    const response = await git.createTree({
      ...this.#getOwnerAndRepo(),
      base_tree: undefined, // 如果是新提交，请将其设置为 null
      // 创建一个表示新文件夹的树对象
      tree: [
        {
          path: folderPath,
          mode: '040000', // 文件夹权限模式
          type: 'tree',
          // sha: null, // 置为 null 表示新文件夹
        },
      ],
    });

    const treeSha = response.data.sha; // 新树对象的 SHA 哈希值

    // 创建新提交，将新树对象与父提交关联起来
    const newCommit = await this.createCommit({ treeSha, branch });

    // 推送新提交到分支
    await this.pushCommitToBranch({ commitSha: newCommit.sha, branch });
  }

  async gitCommitAndPush({
    content = '',
    filePath,
    branch = 'main',
  }: {
    filePath: string;
    content?: string;
    branch?: string;
  }) {
    debug('branch', branch);
    debug('filePath', filePath);

    const currentTreeSha = await this.getCurrentTree({ branch });
    const blobSha = await this.createBlob(content);
    const treeSha = await this.createTree({
      blobSha,
      filePath,
      currentTreeSha,
    });
    const commitResult = await this.createCommit({
      treeSha,
      branch,
    });

    await this.pushCommitToBranch({
      branch,
      commitSha: commitResult.sha,
    });
  }
}
