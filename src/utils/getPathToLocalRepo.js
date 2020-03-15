import path from 'path';

const getPathToLocalRepo = (repoName) => path.resolve(__dirname, '..', '..', 'repos', repoName);

export default getPathToLocalRepo;
