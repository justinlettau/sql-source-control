/**
 * CLI arguments for `init` command.
 */
export interface InitOptions {
  webconfig?: string;
  force?: boolean;
  skip?: boolean;
}

/**
 * CLI arguments for `list` command.
 */
export interface ListOptions {
  config?: string;
}

/**
 * CLI arguments for `pull` command.
 */
export interface PullOptions {
  config?: string;
}

/**
 * CLI arguments for `push` command.
 */
export interface PushOptions {
  config?: string;
  skip?: boolean;
}
