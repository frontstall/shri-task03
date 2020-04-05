import last from 'lodash/last';
import first from 'lodash/first';

const getRepoFullName = (url) => {
  const nameWithExtension = last(url.split(':'));

  return first(nameWithExtension.split('.')) || '';
};

export default getRepoFullName;
