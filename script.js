document.addEventListener('DOMContentLoaded', () => {
    const addUnitButton = document.getElementById('addUnitButton');
    const workshop = document.getElementById('workshop');
    const outWorkshop = document.getElementById('out-workshop');
    const waitingWorkshop = document.getElementById('waiting-workshop');
    const subsectionDropZones = document.querySelectorAll('.subsection-drop-zone');
    const allDropZones = [waitingWorkshop, outWorkshop, ...Array.from(subsectionDropZones), workshop];

    let draggedItem = null;
    let unitCount = 0;
    let longPressTimer = null;
    const longPressDelay = 500;

    function isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    }

    function sortUnitsAlphabetically(container) {
        const units = Array.from(container.querySelectorAll('.draggable-unit'));
        units.sort((a, b) => {
            const textA = a.textContent.trim().toLowerCase();
            const textB = b.textContent.trim().toLowerCase();
            return textA.localeCompare(textB, 'ar', { sensitivity: 'base' });
        });
        units.forEach(unit => {
            container.appendChild(unit);
        });
    }

    function updateUnitColor(unit, dropZoneElement) {
        if (dropZoneElement.id === 'out-workshop') {
            unit.style.backgroundColor = 'var(--danger-red)';
        } else if (dropZoneElement.id === 'waiting-workshop') {
            unit.style.backgroundColor = 'var(--accent-orange)';
        } else {
            unit.style.backgroundColor = 'var(--primary-blue)';
        }
    }

    function dropItem(targetDropZone) {
        if (draggedItem && targetDropZone && draggedItem.parentElement !== targetDropZone) {
            targetDropZone.appendChild(draggedItem);
            updateUnitColor(draggedItem, targetDropZone);
            sortUnitsAlphabetically(targetDropZone);
        }
        
        if (draggedItem) {
            draggedItem.classList.remove('dragging');
            draggedItem.style.removeProperty('position');
            draggedItem.style.removeProperty('top');
            draggedItem.style.removeProperty('left');
            draggedItem.style.removeProperty('pointer-events');
            
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        }
        draggedItem = null;
        allDropZones.forEach(zone => zone.classList.remove('drag-over'));
    }

    function handleTouchMove(e) {
        if (draggedItem) {
            e.preventDefault();
            const touch = e.touches[0];
            draggedItem.style.left = `${touch.clientX - draggedItem.offsetWidth / 2}px`;
            draggedItem.style.top = `${touch.clientY - draggedItem.offsetHeight / 2}px`;

            const dropZone = document.elementFromPoint(touch.clientX, touch.clientY);
            allDropZones.forEach(zone => {
                if (zone.contains(dropZone) || zone === dropZone) {
                    zone.classList.add('drag-over');
                } else {
                    zone.classList.remove('drag-over');
                }
            });
        }
    }

    function handleTouchEnd(e) {
        if (draggedItem) {
            const touch = e.changedTouches[0];
            const dropZone = document.elementFromPoint(touch.clientX, touch.clientY);
            const finalDropZone = allDropZones.find(zone => zone.contains(dropZone) || zone === dropZone);
            dropItem(finalDropZone);
        }
    }

    function setupDropZones() {
        allDropZones.forEach(element => {
            element.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                element.classList.add('drag-over');
            });
            element.addEventListener('dragleave', () => {
                element.classList.remove('drag-over');
            });
            element.addEventListener('drop', (e) => {
                e.preventDefault();
                element.classList.remove('drag-over');
                dropItem(element);
            });
        });
    }

    function createDraggableUnit(initialText = null) {
        const newUnit = document.createElement('div');
        newUnit.className = 'draggable-unit';
        newUnit.textContent = initialText || `وحدة رقم ${++unitCount}`; 
        newUnit.draggable = true;

        newUnit.addEventListener('dragstart', (e) => {
            draggedItem = newUnit;
            e.dataTransfer.setData('text/plain', '');
            e.dataTransfer.effectAllowed = 'move';
            setTimeout(() => newUnit.classList.add('dragging'), 0);
        });
        newUnit.addEventListener('dragend', () => {
            newUnit.classList.remove('dragging');
            draggedItem = null;
        });

        if (isTouchDevice()) {
            newUnit.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                if (draggedItem) {
                    dropItem(draggedItem.parentElement);
                }
                clearTimeout(longPressTimer);
                longPressTimer = setTimeout(() => {
                    draggedItem = newUnit;
                    newUnit.classList.add('dragging');
                    newUnit.style.position = 'fixed';
                    const rect = newUnit.getBoundingClientRect();
                    newUnit.style.top = `${rect.top}px`;
                    newUnit.style.left = `${rect.left}px`;
                    newUnit.style.pointerEvents = 'none';

                    window.addEventListener('touchmove', handleTouchMove, { passive: false });
                    window.addEventListener('touchend', handleTouchEnd);
                }, longPressDelay);
            });

            newUnit.addEventListener('touchend', () => {
                clearTimeout(longPressTimer);
            });
        }
        
        newUnit.addEventListener('dblclick', (e) => {
            const currentText = newUnit.textContent;
            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.value = currentText;
            inputField.className = 'edit-unit-input';

            newUnit.textContent = '';
            newUnit.appendChild(inputField);
            inputField.focus();

            const saveChanges = () => {
                newUnit.textContent = inputField.value.trim() || currentText;
                if (newUnit.contains(inputField)) {
                    newUnit.removeChild(inputField);
                }
                sortUnitsAlphabetically(newUnit.parentElement);
            };

            inputField.addEventListener('blur', saveChanges);
            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveChanges();
                    inputField.blur();
                }
            });
        });

        waitingWorkshop.appendChild(newUnit); 
        updateUnitColor(newUnit, waitingWorkshop);
    }
    
    addUnitButton.addEventListener('click', () => createDraggableUnit());

    const totalInitialUnits = 236;
    const numberedUnitsStart = 3001;
    const numberedUnitsEnd = 3221;

    for (let i = 0; i < totalInitialUnits; i++) {
        let unitText;
        if (i < (numberedUnitsEnd - numberedUnitsStart + 1)) {
            unitText = `${numberedUnitsStart + i}`;
        } else {
            unitText = `وحدة رقم ${unitCount + 1}`;
            unitCount++;
        }
        createDraggableUnit(unitText);
    }
    
    sortUnitsAlphabetically(waitingWorkshop);
    setupDropZones();
});
