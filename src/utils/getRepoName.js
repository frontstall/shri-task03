import last from 'lodash/last';
import first from 'lodash/first';

const getRepoName = (url) => {
  const nameWithExtension = last(url.split('/'));

  return first(nameWithExtension.split('.')) || '';
};

export default getRepoName;
