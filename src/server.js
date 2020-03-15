import Express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import Git from 'nodegit';

import {
  callApi,
  getPathToLocalRepo,
  getPathToRemoteRepo,
} from './utils';

const API_ROOT = '/api';

const initServer = (port) => {
  const app = new Express();
  const logger = morgan('combined');
  app.use(logger);
  app.use(bodyParser.urlencoded({ extended: false }));

  app.post(`${API_ROOT}/settings`, async (req, res, next) => {
    try {
      const { period, repoName } = req.body;
      const pathToRemoteRepo = getPathToRemoteRepo(repoName);

      await Git.Clone(pathToRemoteRepo, `repos/${repoName}`);

      const data = {
        ...req.body,
        period: parseInt(period, 10),
      };

      await callApi({ method: 'POST', url: '/conf', data });
    } catch (error) {
      next(error);
    }
    res.status(200).end();
  });

  app.get(`${API_ROOT}/settings`, async (req, res, next) => {
    try {
      const { data } = await callApi({ method: 'GET', url: '/conf' });
      res.send(data);
    } catch (error) {
      next(error);
    }
  });

  app.delete(`${API_ROOT}/settings`, async (req, res, next) => {
    try {
      await callApi({ method: 'DELETE', url: '/conf' });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  app.get(`${API_ROOT}/builds`, async (req, res, next) => {
    try {
      const { data } = await callApi({ method: 'GET', url: '/build/list' });
      res.send(data);
    } catch (error) {
      next(error);
    }
  });

  app.get(`${API_ROOT}/builds/:buildId`, async (req, res, next) => {
    try {
      const { data } = await callApi({
        method: 'GET',
        url: '/build/details',
        data: { buildId: req.params.buildId },
      });
      res.send(data);
    } catch (error) {
      next(error);
    }
  });

  app.get(`${API_ROOT}/builds/:buildId/logs`, async (req, res, next) => {
    try {
      const { data } = await callApi({
        method: 'GET',
        url: '/build/logs',
        data: { buildId: req.params.buildId },
      });
      res.send(data);
    } catch (error) {
      next(error);
    }
  });

  app.post(`${API_ROOT}/builds/:commitHash`, async (req, res, next) => {
    const { commitHash } = req.params;
    try {
      const {
        data:
        {
          data:
          { repoName, mainBranch },
        },
      } = await callApi({ method: 'GET', url: '/conf' });
      const pathToLocalRepo = getPathToLocalRepo(repoName);
      const repo = await Git.Repository.open(pathToLocalRepo);
      const commit = await repo.getCommit(commitHash);
      const commitMessage = commit.message();
      const authorName = commit.author().name();
      const data = {
        commitMessage,
        commitHash,
        branchName: mainBranch,
        authorName,
      };

      await callApi({ method: 'POST', url: '/build/request', data });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  app.use((error, req, res, next) => { //eslint-disable-line
    console.log(error);
    res.status(500).end();
  });

  app.listen(port, () => {
    console.log(`server has been started on port ${port}`);
  });
};

export default initServer;
