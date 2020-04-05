import path from 'path';

const getPathToRemoteRepo = (repoName) => `file://${path.resolve(`${__dirname}`, '..', '..', 'repos', repoName)}`;

export default getPathToRemoteRepo;
