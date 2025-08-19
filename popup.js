async function loadSessions() {
  const { sessions = [] } = await chrome.storage.local.get(['sessions']);
  const container = document.getElementById('sessions');
  container.innerHTML = '';
  sessions.forEach((s, idx) => {
    const el = document.createElement('div');
    el.className = 'session';
    el.innerHTML = `<h4>${new Date(s.createdAt).toLocaleString()}</h4>` +
                   `<div>${s.tabs.length} вкладок</div>` +
                   `<button data-idx="${idx}" class="restore">Восстановить</button>`;
    container.appendChild(el);
  });

  container.querySelectorAll('.restore').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const idx = parseInt(e.target.getAttribute('data-idx'), 10);
      const { sessions = [] } = await chrome.storage.local.get(['sessions']);
      const session = sessions[idx];
      if (!session) return;
      for (const t of session.tabs) {
        await chrome.tabs.create({ url: t.url, active: false });
      }
    });
  });
}

document.getElementById('save-session').addEventListener('click', async () => {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const minimal = tabs.map(t => ({ url: t.url, title: t.title }));
  const { sessions = [] } = await chrome.storage.local.get(['sessions']);
  sessions.unshift({ createdAt: Date.now(), tabs: minimal });
  await chrome.storage.local.set({ sessions });
  await loadSessions();
});

document.addEventListener('DOMContentLoaded', loadSessions);
