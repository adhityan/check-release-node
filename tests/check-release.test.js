jest.mock('fs');
jest.mock('@actions/core');
jest.mock('@actions/github');

const fs = require('fs');
const { GitHub, context } = require('@actions/github');
const run = require('../src/check-release.js');

/* eslint-disable no-undef */
describe('List Release', () => {
  let listReleases;

  beforeEach(() => {
    listReleases = jest.fn().mockReturnValueOnce({
      data: []
    });

    context.repo = {
      owner: 'owner',
      repo: 'repo'
    };

    const github = {
      repos: {
        listReleases
      }
    };

    GitHub.mockImplementation(() => github);
    process.env.GITHUB_TOKEN = 'mock';
    process.env.GITHUB_WORKSPACE = 'mock';
  });

  test('List releases endpoint is called', async () => {
    fs.existsSync = jest.fn().mockReturnValueOnce(true);
    fs.readFileSync = jest.fn().mockReturnValueOnce('{ "version": "1.0.0" }');

    await run();

    expect(listReleases).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo'
    });
  });
});
