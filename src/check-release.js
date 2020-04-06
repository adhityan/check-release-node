const fs = require('fs');
const path = require('path');
const semver = require('semver');
const core = require('@actions/core');
const { GitHub, context } = require('@actions/github');

async function run() {
  try {
    const githubToken = core.getInput('github_token', { required: true });
    const github = new GitHub(githubToken);
    const { owner, repo } = context.repo;

    const packagePath = path.join(process.env.GITHUB_WORKSPACE, 'package.json');
    const packageExists = fs.existsSync(packagePath);
    if (!packageExists)
      core.setFailed('Please use the actions/checkout@v2 step to check out a node project before calling this step');

    const getReleasesData = await github.repos.listReleases({
      owner,
      repo
    });
    const { data: releases } = getReleasesData;
    const releaseVersions = releases.map(e => e.name);
    const strigifiedReleaseVersions = JSON.stringify(releaseVersions);
    core.debug(`Release versions: ${strigifiedReleaseVersions}`);

    let maxVersion = '0.0.0';
    for (let i = 0; i < releaseVersions.length; i += 1) {
      const e = releaseVersions[i];
      const clean = semver.valid(semver.coerce(e));
      if (semver.gt(clean, maxVersion)) maxVersion = clean;
    }
    core.debug(`Maximum release version ${maxVersion}`);

    const packageJson = JSON.parse(fs.readFileSync(packagePath));
    const packageVersion = packageJson.version;
    core.debug(`packageVersion ${packageVersion}`);

    let isNewVersion = false;
    const versionExists = releaseVersions.some(e => e === `v${packageVersion}`);
    if (!versionExists && semver.gt(packageVersion, maxVersion)) isNewVersion = true;
    const getPastVersions = core.getInput('need_past_versions', { required: false });

    core.setOutput('has_new_version', `${isNewVersion}`);
    core.setOutput('has_existing_version', `${versionExists}`);
    core.setOutput('current_release_version', `${packageVersion}`);
    core.setOutput('maximum_past_release_version', `${maxVersion}`);
    if (getPastVersions === 'true') core.setOutput('all_past_versions', strigifiedReleaseVersions);
  } catch (error) {
    core.setFailed(error.message);
    console.error('error', error);
  }
}

module.exports = run;
