/* eslint block-scoped-var: "off" */

/// <reference types="node" />

// required for loading into a NodeJS context
if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define(['./labelNormalizer'], (labelNormalizer) => {
  class ProjectFilter {
    constructor() {
      this.selectedLabels = new Set();
      this.searchQuery = '';
      this.setupEventListeners();
    }

    setupEventListeners() {
      // Search input listener
      const searchInput = document.getElementById('search');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value.toLowerCase();
          this.triggerFilterUpdate();
        });
      }

      // Label filter container
      const labelContainer = document.getElementById('tags-filter');
      if (labelContainer) {
        labelContainer.addEventListener('change', (e) => {
          if (e.target.type === 'checkbox') {
            if (e.target.checked) {
              this.selectedLabels.add(e.target.value);
            } else {
              this.selectedLabels.delete(e.target.value);
            }
            this.triggerFilterUpdate();
          }
        });
      }
    }

    updateLabelList(projects) {
      const labelContainer = document.getElementById('tags-filter');
      if (!labelContainer) return;

      // Get all unique normalized labels
      const allLabels = new Set();
      projects.forEach((project) => {
        (project.tags || []).forEach((tag) => {
          allLabels.add(labelNormalizer.normalizeLabel(tag));
        });
      });

      // Sort labels alphabetically
      const sortedLabels = Array.from(allLabels).sort();

      // Create label count map
      const labelCount = new Map();
      sortedLabels.forEach((label) => {
        labelCount.set(label, 0);
      });

      // Count projects per label
      projects.forEach((project) => {
        const normalizedLabels = labelNormalizer.normalizeLabels(
          project.tags || []
        );
        normalizedLabels.forEach((label) => {
          labelCount.set(label, (labelCount.get(label) || 0) + 1);
        });
      });

      // Generate HTML for labels
      const labelsHTML = sortedLabels
        .map(
          (label) => `
        <div class="tag-filter-item">
          <input type="checkbox" 
                 id="label-${label}" 
                 value="${label}"
                 ${this.selectedLabels.has(label) ? 'checked' : ''}>
          <label for="label-${label}">
            ${label} (${labelCount.get(label)})
          </label>
        </div>
      `
        )
        .join('');

      labelContainer.innerHTML = labelsHTML;
    }

    filterProjects(projects) {
      return projects.filter((project) => {
        // Apply search filter
        const matchesSearch =
          !this.searchQuery ||
          project.name.toLowerCase().includes(this.searchQuery) ||
          project.desc.toLowerCase().includes(this.searchQuery);

        // Apply label filter
        const matchesLabels =
          this.selectedLabels.size === 0 ||
          labelNormalizer
            .normalizeLabels(project.tags || [])
            .some((tag) => this.selectedLabels.has(tag));

        return matchesSearch && matchesLabels;
      });
    }

    triggerFilterUpdate() {
      // Dispatch custom event for other components to listen to
      window.dispatchEvent(
        new CustomEvent('projectsFiltered', {
          detail: {
            searchQuery: this.searchQuery,
            selectedLabels: Array.from(this.selectedLabels),
          },
        })
      );
    }
  }

  return ProjectFilter;
});
