import Express from 'express';
import morgan from 'morgan';
import Git from 'nodegit';
import fs from 'fs';
import del from 'del';

import {
  callApi,
  clone,
  getPathToLocalRepo,
  getRepoName,
} from './utils';

const API_ROOT = '/api';
const DEFAULT_REPO_NAME = 'mock';

const initServer = (port) => {
  const app = new Express();
  const logger = morgan('combined');
  app.use(logger);
  app.use(Express.json());
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'OPTIONS, DELETE, POST, GET');
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
  });

  app.post(`${API_ROOT}/settings`, async (req, res, next) => {
    try {
      const {
        period,
        repoUrl,
        buildCommand,
        mainBranch,
      } = req.body;

      const repoName = getRepoName(repoUrl) || DEFAULT_REPO_NAME;
      const data = {
        buildCommand,
        mainBranch: mainBranch || 'master',
        period: parseInt(period, 10),
        repoName,
      };
      const pathToLocalRepo = getPathToLocalRepo(repoName);

      await del(pathToLocalRepo);
      await fs.promises.mkdir(pathToLocalRepo);
      await clone(repoUrl, pathToLocalRepo);
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
        params: { buildId: req.params.buildId },
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
        url: '/build/log',
        params: { buildId: req.params.buildId },
      });
      res.send(data);
    } catch (error) {
      next(error);
    }
  });

  app.post(`${API_ROOT}/builds/:commitHash`, async (req, res, next) => {
    const { commitHash } = req.params;
    try {
      const { data: { repoName, mainBranch } } = await callApi({ method: 'GET', url: '/conf' });
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

      const response = await callApi({ method: 'POST', url: '/build/request', data });
      res.send(response);
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
