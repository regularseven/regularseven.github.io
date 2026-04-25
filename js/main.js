(function () {
	'use strict';

	const root = document.documentElement;
	const STORAGE_KEY = 'alex-theme';

	function applyTheme(theme) {
		root.setAttribute('data-theme', theme);
		try {
			localStorage.setItem(STORAGE_KEY, theme);
		} catch (_) {}
	}

	function initTheme() {
		let saved = null;
		try { saved = localStorage.getItem(STORAGE_KEY); } catch (_) {}
		if (saved === 'light' || saved === 'dark') {
			applyTheme(saved);
		} else {
			const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
			applyTheme(prefersLight ? 'light' : 'dark');
		}
	}

	initTheme();

	const themeBtn = document.getElementById('themeToggle');
	if (themeBtn) {
		themeBtn.addEventListener('click', function () {
			const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
			applyTheme(next);
		});
	}

	const menuBtn = document.getElementById('menuToggle');
	const nav = document.getElementById('primary-nav');

	function closeMenu() {
		if (!nav || !menuBtn) return;
		nav.classList.remove('is-open');
		menuBtn.classList.remove('is-open');
		menuBtn.setAttribute('aria-expanded', 'false');
		document.body.classList.remove('menu-open');
	}

	if (menuBtn && nav) {
		menuBtn.addEventListener('click', function () {
			const isOpen = nav.classList.toggle('is-open');
			menuBtn.classList.toggle('is-open', isOpen);
			menuBtn.setAttribute('aria-expanded', String(isOpen));
			document.body.classList.toggle('menu-open', isOpen);
		});

		nav.querySelectorAll('a').forEach(function (link) {
			link.addEventListener('click', closeMenu);
		});

		window.addEventListener('resize', function () {
			if (window.innerWidth > 768) closeMenu();
		});
	}

	const yearEl = document.getElementById('year');
	if (yearEl) yearEl.textContent = new Date().getFullYear();

	const form = document.getElementById('contactForm');
	const status = document.getElementById('formStatus');

	if (form && status) {
		form.addEventListener('submit', async function (event) {
			event.preventDefault();
			status.className = 'form-status';
			status.textContent = '';

			if (!form.checkValidity()) {
				form.reportValidity();
				return;
			}

			const action = form.getAttribute('action') || '';
			if (action.indexOf('YOUR_FORM_ID') !== -1) {
				status.classList.add('is-error');
				status.textContent = 'Form not yet configured. Replace YOUR_FORM_ID in index.html with your Formspree ID.';
				return;
			}

			const submitBtn = form.querySelector('button[type="submit"]');
			if (submitBtn) submitBtn.disabled = true;
			status.textContent = 'Sending…';

			try {
				const response = await fetch(action, {
					method: 'POST',
					body: new FormData(form),
					headers: { 'Accept': 'application/json' }
				});

				if (response.ok) {
					form.reset();
					status.classList.add('is-success');
					status.textContent = 'Thanks — your message is on its way. I\'ll reply within a business day.';
				} else {
					const data = await response.json().catch(function () { return {}; });
					status.classList.add('is-error');
					status.textContent = (data && data.error) || 'Something went wrong. Please email hello@alex.dev instead.';
				}
			} catch (err) {
				status.classList.add('is-error');
				status.textContent = 'Network error. Please email hello@alex.dev instead.';
			} finally {
				if (submitBtn) submitBtn.disabled = false;
			}
		});
	}
})();
