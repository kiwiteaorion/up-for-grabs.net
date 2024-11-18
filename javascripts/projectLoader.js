/* eslint block-scoped-var: "off" */

/// <reference types="node" />

// required for loading into a NodeJS context
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(['showdown', 'whatwg-fetch', 'promise-polyfill', './labelNormalizer'], (
  /** @type {import('showdown')} */ showdown,
  _fetch,
  _promise,
  labelNormalizer
) => {
  const { fetch } = window;
  const PAGE_SIZE = 20;
  let currentPage = 0;
  const projectCache = new Map();

  function createProjectCard(project) {
    // Check cache first
    if (projectCache.has(project.name)) {
      return projectCache.get(project.name).cloneNode(true);
    }

    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = project.desc;

    // Cache for reuse
    projectCache.set(project.name, card);
    return card;
  }

  function renderProjects(projects, isInitialLoad = false) {
    const fragment = document.createDocumentFragment();
    const projectList = document.getElementById('projects-list');

    // Clear list on initial load
    if (isInitialLoad) {
      projectList.innerHTML = '';
      currentPage = 0;
    }

    const start = currentPage * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const batch = projects.slice(start, Math.min(end, projects.length));

    batch.forEach((project) => {
      fragment.appendChild(createProjectCard(project));
    });

    projectList.appendChild(fragment);
    currentPage++;

    // Setup infinite scroll on initial load
    if (isInitialLoad && projects.length > PAGE_SIZE) {
      setupInfiniteScroll(projects);
    }
  }

  function setupInfiniteScroll(projects) {
    window.addEventListener(
      'scroll',
      () => {
        if (
          window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 1000
        ) {
          renderProjects(projects);
        }
      },
      { passive: true }
    );
  }

  function loadProjects() {
    if (window.performance) {
      performance.mark('projects-fetch-start');
    }

    return fetch('/javascripts/projects.json')
      .then((response) => response.json())
      .then((files) => {
        const converter = new showdown.Converter();

        return Object.keys(files).map((key) => {
          const project = files[key];
          return {
            ...project,
            desc: converter.makeHtml(project.desc),
            // Normalize the tags/labels
            tags: labelNormalizer.normalizeLabels(project.tags || []),
          };
        });
      })
      .catch((error) => {
        console.error('Unable to load project files', error);
        return [];
      });
  }

  return loadProjects;
});
