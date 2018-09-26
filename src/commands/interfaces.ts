/**
 * CLI arguments for `init` command.
 */
export interface InitOptions {
  webconfig?: string;
  force?: boolean;
  skip?: boolean;
}

/**
 * CLI arguments for `pull` command.
 */
export interface PullOptions {
  config?: string;
}
