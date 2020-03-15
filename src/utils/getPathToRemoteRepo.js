import path from 'path';

const getPathToRemoteRepo = (repoName) => `file://${path.resolve(`${__dirname}`, '..', '..', '..', repoName)}`;

export default getPathToRemoteRepo;
