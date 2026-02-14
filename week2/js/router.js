/**
 * HTGAA Week 2 — Hash-Based SPA Router
 * Handles navigation between views with smooth transitions.
 */

import { store } from './store.js';

class Router {
  constructor(contentEl) {
    this.contentEl = contentEl;
    this.routes = new Map();
    this.currentView = null;
    this.currentRoute = '';

    window.addEventListener('hashchange', () => this.navigate());
    // Handle clicks on links with data-route attribute
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-route]');
      if (link) {
        e.preventDefault();
        window.location.hash = link.dataset.route;
      }
    });
  }

  /** Register a route pattern and its view factory. */
  on(pattern, viewFactory) {
    this.routes.set(pattern, viewFactory);
    return this;
  }

  /** Navigate to the current hash route. */
  async navigate(hash) {
    const route = (hash || window.location.hash || '#/').replace(/^#\/?/, '/');
    if (route === this.currentRoute) return;

    // Find matching route
    let matched = null;
    let params = {};
    for (const [pattern, factory] of this.routes) {
      const result = this._match(pattern, route);
      if (result) {
        matched = factory;
        params = result;
        break;
      }
    }

    if (!matched) {
      // Fallback to home
      matched = this.routes.get('/');
      params = {};
    }

    // Transition out
    if (this.currentView) {
      this.contentEl.classList.add('view-exit');
      await this._wait(200);
      if (this.currentView.unmount) this.currentView.unmount();
    }

    this.currentRoute = route;
    store.set('currentRoute', route);

    // Render new view
    this.contentEl.innerHTML = '';
    this.contentEl.classList.remove('view-exit');
    this.contentEl.classList.add('view-enter');

    const view = matched(params);
    this.currentView = view;

    if (view.render) {
      const content = await view.render();
      if (typeof content === 'string') {
        this.contentEl.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        this.contentEl.appendChild(content);
      }
    }

    if (view.mount) await view.mount(this.contentEl);

    // Reinit Lucide icons
    if (window.lucide) lucide.createIcons();

    // Transition in
    requestAnimationFrame(() => {
      this.contentEl.classList.remove('view-enter');
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Update sidebar active state
    this._updateSidebar(route);
  }

  _match(pattern, route) {
    // Convert pattern like /topic/:id to regex
    const paramNames = [];
    const regex = pattern.replace(/:(\w+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
    const match = route.match(new RegExp(`^${regex}$`));
    if (!match) return null;
    const params = {};
    paramNames.forEach((name, i) => { params[name] = match[i + 1]; });
    return params;
  }

  _wait(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  _updateSidebar(route) {
    document.querySelectorAll('.sidebar-link').forEach(link => {
      const href = link.dataset.route || '';
      const isActive = route.startsWith(href.replace('#', ''));
      link.classList.toggle('active', isActive);
    });
  }

  /** Start the router by navigating to the initial hash. */
  start() {
    this.navigate();
  }
}

export { Router };
