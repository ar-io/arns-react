import { ANT_CHANGELOG, DEFAULT_ANT_LUA_ID } from '../utils/constants';

const headerRegex = new RegExp('## \\[\\d+\\] - \\[([A-Za-z0-9_-]{43})\\]');
const idReg = new RegExp(/[A-Za-z0-9_-]{43}/);

/**
 * This script checks if the changelog of the ANT is up to date with the current ID the sdk provides
 */
async function main() {
  try {
    const currentChangelog = ANT_CHANGELOG;
    // get current changelog from main branch of https://github.com/ar-io/ar-io-ant-process/blob/main/CHANGELOG.md
    const response = await fetch(
      'https://raw.githubusercontent.com/ar-io/ar-io-ant-process/main/CHANGELOG.md',
    );

    const changelog = await response.text();
    const newVersionHeader = headerRegex.exec(changelog)![0];
    const newVersionId = idReg.exec(newVersionHeader)![0];
    const oldVersionHeader = headerRegex.exec(currentChangelog)![0];
    const oldVersionId = idReg.exec(oldVersionHeader)![0];

    // throw an error if the changelog is not up to date
    if (newVersionId !== DEFAULT_ANT_LUA_ID) {
      throw new Error(
        `Changelog is not up to date. Current ID is ${DEFAULT_ANT_LUA_ID} but changelog is at ${newVersionId}`,
      );
    }
  } catch (error) {
    console.error('Issue checking ANT changelog:\n\n');
    console.error(error);

    process.exit(1);
  }
}

main();
