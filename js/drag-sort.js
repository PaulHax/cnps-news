export function initDragSort(container, onReorder) {
  let draggedEl = null;
  let draggedIndex = -1;

  container.addEventListener('dragstart', (e) => {
    const card = e.target.closest('[data-article-id]');
    if (!card || !e.target.classList.contains('drag-handle')) return;
    draggedEl = card;
    draggedIndex = [...container.children].indexOf(card);
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  });

  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const card = e.target.closest('[data-article-id]');
    if (!card || card === draggedEl) return;
    const rect = card.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    if (e.clientY < midY) {
      container.insertBefore(draggedEl, card);
    } else {
      container.insertBefore(draggedEl, card.nextSibling);
    }
  });

  container.addEventListener('dragend', (e) => {
    if (!draggedEl) return;
    draggedEl.classList.remove('dragging');
    const newIndex = [...container.children].indexOf(draggedEl);
    if (newIndex !== draggedIndex) {
      onReorder(draggedIndex, newIndex);
    }
    draggedEl = null;
    draggedIndex = -1;
  });
}
